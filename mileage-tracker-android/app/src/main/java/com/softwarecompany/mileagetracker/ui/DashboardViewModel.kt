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
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class DashboardViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: TripRepository = TripRepository(
        tripDao = (application as MileageTrackerApp).database.tripDao(),
        expenseDao = application.database.expenseDao()
    )

    private val activityTransitionManager = ActivityTransitionManager(application)

    // Live Engine State from Background Service
    val liveStats: StateFlow<LiveDriveStats> = LocationTrackingService.liveStats

    // Persisted Trips & Stats from Room DB
    val recentTrips: StateFlow<List<TripEntity>> = repository.allTrips.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    val totalDeduction: StateFlow<Double> = repository.totalBusinessDeduction.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = 0.0
    )

    val totalMiles: StateFlow<Double> = repository.totalBusinessMiles.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = 0.0
    )

    val unclassifiedCount: StateFlow<Int> = repository.unclassifiedTripsCount.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = 0
    )

    fun initializeEngine() {
        viewModelScope.launch {
            activityTransitionManager.registerTransitions()
        }
    }

    fun classifyTrip(tripId: String, classification: TripClassification) {
        viewModelScope.launch {
            repository.classifyTrip(tripId, classification)
        }
    }

    fun startManualDrive() {
        LocationTrackingService.startRecording(getApplication(), "MANUAL_TEST")
    }

    fun stopManualDrive() {
        LocationTrackingService.stopRecordingManual(getApplication())
    }
}
