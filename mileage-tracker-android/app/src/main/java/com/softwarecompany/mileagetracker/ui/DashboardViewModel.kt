package com.softwarecompany.mileagetracker.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.softwarecompany.mileagetracker.MileageTrackerApp
import com.softwarecompany.mileagetracker.data.local.entity.TripClassification
import com.softwarecompany.mileagetracker.data.local.entity.TripEntity
import com.softwarecompany.mileagetracker.data.repository.TripRepository
import com.softwarecompany.mileagetracker.engine.ActivityTransitionManager
import com.softwarecompany.mileagetracker.engine.LiveDriveStats
import com.softwarecompany.mileagetracker.engine.LocationTrackingService
import com.softwarecompany.mileagetracker.utils.TaxCalculator
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import java.util.*

enum class TimeframeFilter(val label: String) {
    ALL("All Time"),
    THIS_WEEK("This Week"),
    THIS_MONTH("This Month"),
    THIS_YEAR("2026 YTD")
}

enum class StatusFilter(val label: String) {
    ALL("All"),
    UNCLASSIFIED("Pending"),
    BUSINESS("Business"),
    PERSONAL("Personal")
}

data class UndoAction(
    val tripId: String,
    val previousClassification: TripClassification
)

class DashboardViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: TripRepository = TripRepository(
        tripDao = (application as MileageTrackerApp).database.tripDao(),
        expenseDao = application.database.expenseDao()
    )

    private val activityTransitionManager = ActivityTransitionManager(application)

    // Live Engine State from Background Service
    val liveStats: StateFlow<LiveDriveStats> = LocationTrackingService.liveStats

    // Filters
    val selectedTimeframe = MutableStateFlow(TimeframeFilter.ALL)
    val selectedStatus = MutableStateFlow(StatusFilter.ALL)

    // Undo stack for one-tap reversal of accidental swipes
    val lastUndoAction = MutableStateFlow<UndoAction?>(null)

    // All raw trips from Room DB
    val allTrips: StateFlow<List<TripEntity>> = repository.allTrips.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    // Unclassified Trips specifically for Tinder-style swipe queue
    val unclassifiedTrips: StateFlow<List<TripEntity>> = allTrips.map { trips ->
        trips.filter { it.classification == TripClassification.UNCLASSIFIED }
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    // Dynamically Filtered Trips for the audit list
    val filteredTrips: StateFlow<List<TripEntity>> = combine(
        allTrips,
        selectedTimeframe,
        selectedStatus
    ) { trips, timeframe, status ->
        val cutoff = getTimeframeCutoff(timeframe)
        trips.filter { trip ->
            val matchesTime = trip.startTimestamp >= cutoff
            val matchesStatus = when (status) {
                StatusFilter.ALL -> true
                StatusFilter.UNCLASSIFIED -> trip.classification == TripClassification.UNCLASSIFIED
                StatusFilter.BUSINESS -> trip.classification == TripClassification.BUSINESS
                StatusFilter.PERSONAL -> trip.classification == TripClassification.PERSONAL
            }
            matchesTime && matchesStatus
        }
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    // Filtered Business Deductions based on current timeframe
    val timeframeDeduction: StateFlow<Double> = combine(
        allTrips,
        selectedTimeframe
    ) { trips, timeframe ->
        val cutoff = getTimeframeCutoff(timeframe)
        trips.filter { it.startTimestamp >= cutoff && it.classification == TripClassification.BUSINESS }
            .sumOf { it.deductionAmount }
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = 0.0
    )

    // Filtered Business Miles based on current timeframe
    val timeframeMiles: StateFlow<Double> = combine(
        allTrips,
        selectedTimeframe
    ) { trips, timeframe ->
        val cutoff = getTimeframeCutoff(timeframe)
        trips.filter { it.startTimestamp >= cutoff && it.classification == TripClassification.BUSINESS }
            .sumOf { it.distanceMiles }
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = 0.0
    )

    val unclassifiedCount: StateFlow<Int> = unclassifiedTrips.map { it.size }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = 0
    )

    fun initializeEngine() {
        viewModelScope.launch {
            activityTransitionManager.registerTransitions()
        }
    }

    fun setTimeframe(filter: TimeframeFilter) {
        selectedTimeframe.value = filter
    }

    fun setStatusFilter(filter: StatusFilter) {
        selectedStatus.value = filter
    }

    fun classifyTrip(tripId: String, classification: TripClassification) {
        viewModelScope.launch {
            val existing = repository.allTrips.first().find { it.id == tripId }
            if (existing != null) {
                lastUndoAction.value = UndoAction(tripId, existing.classification)
            }
            repository.classifyTrip(tripId, classification)
        }
    }

    fun undoLastClassification() {
        val undo = lastUndoAction.value ?: return
        viewModelScope.launch {
            repository.classifyTrip(undo.tripId, undo.previousClassification)
            lastUndoAction.value = null
        }
    }

    fun deleteTrip(trip: TripEntity) {
        viewModelScope.launch {
            repository.deleteTrip(trip)
        }
    }

    fun startManualDrive() {
        LocationTrackingService.startRecording(getApplication(), "MANUAL_TEST")
    }

    fun stopManualDrive() {
        LocationTrackingService.stopRecordingManual(getApplication())
    }

    /**
     * Seeds a realistic mock drive with waypoints for quick verification of swipe deck and map canvas.
     */
    fun seedSimulatedTrip(distanceMiles: Double = 6.4) {
        viewModelScope.launch {
            val now = System.currentTimeMillis()
            val start = now - (22 * 60 * 1000) // 22 minutes ago

            // Generate realistic mock waypoints (Denver area / downtown trajectory)
            val baseLat = 39.7392
            val baseLng = -104.9903
            val coordinates = JSONArray()
            val waypointCount = 18

            for (i in 0 until waypointCount) {
                val ratio = i.toDouble() / waypointCount
                val pt = JSONObject().apply {
                    put("lat", baseLat + (ratio * 0.045) + (Math.sin(ratio * Math.PI) * 0.008))
                    put("lng", baseLng + (ratio * 0.060) - (Math.cos(ratio * Math.PI) * 0.006))
                }
                coordinates.put(pt)
            }

            val deduction = TaxCalculator.calculateDeduction(distanceMiles)
            val mockTrip = TripEntity(
                id = UUID.randomUUID().toString(),
                startTimestamp = start,
                endTimestamp = now,
                distanceMiles = distanceMiles,
                deductionRate = TaxCalculator.CURRENT_IRS_RATE,
                deductionAmount = deduction,
                classification = TripClassification.UNCLASSIFIED,
                polylineJson = coordinates.toString(),
                isAutoDetected = true
            )
            repository.saveTrip(mockTrip)
        }
    }

    private fun getTimeframeCutoff(timeframe: TimeframeFilter): Long {
        val cal = Calendar.getInstance()
        return when (timeframe) {
            TimeframeFilter.ALL -> 0L
            TimeframeFilter.THIS_WEEK -> {
                cal.set(Calendar.DAY_OF_WEEK, cal.firstDayOfWeek)
                cal.set(Calendar.HOUR_OF_DAY, 0)
                cal.set(Calendar.MINUTE, 0)
                cal.set(Calendar.SECOND, 0)
                cal.set(Calendar.MILLISECOND, 0)
                cal.timeInMillis
            }
            TimeframeFilter.THIS_MONTH -> {
                cal.set(Calendar.DAY_OF_MONTH, 1)
                cal.set(Calendar.HOUR_OF_DAY, 0)
                cal.set(Calendar.MINUTE, 0)
                cal.set(Calendar.SECOND, 0)
                cal.set(Calendar.MILLISECOND, 0)
                cal.timeInMillis
            }
            TimeframeFilter.THIS_YEAR -> {
                cal.set(Calendar.DAY_OF_YEAR, 1)
                cal.set(Calendar.HOUR_OF_DAY, 0)
                cal.set(Calendar.MINUTE, 0)
                cal.set(Calendar.SECOND, 0)
                cal.set(Calendar.MILLISECOND, 0)
                cal.timeInMillis
            }
        }
    }
}
