package com.softwarecompany.mileagetracker.engine

import android.annotation.SuppressLint
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.location.Location
import android.os.Build
import android.os.IBinder
import android.os.Looper
import androidx.core.app.ServiceCompat
import com.google.android.gms.location.*
import com.softwarecompany.mileagetracker.MileageTrackerApp
import com.softwarecompany.mileagetracker.data.local.entity.TripClassification
import com.softwarecompany.mileagetracker.data.local.entity.TripEntity
import com.softwarecompany.mileagetracker.data.local.entity.WaypointEntity
import com.softwarecompany.mileagetracker.utils.NotificationHelper
import com.softwarecompany.mileagetracker.utils.TaxCalculator
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

class LocationTrackingService : Service() {

    private val serviceScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback
    private val locationFilter = LocationFilter()

    private var currentTripId: String? = null
    private var tripStartTime: Long = 0L
    private var accumulatedMeters: Double = 0.0
    private var lastRecordedLocation: Location? = null
    private val activeCoordinates = mutableListOf<Pair<Double, Double>>()

    // Dwelling cooldown job (if vehicle remains stationary > 4 minutes, finalize drive)
    private var dwellingJob: Job? = null
    private var isActivelyRecording = false

    override fun onCreate() {
        super.onCreate()
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        setupLocationCallback()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action ?: ACTION_START_STANDBY

        when (action) {
            ACTION_START_STANDBY -> {
                startForegroundWithNotification(LiveDriveStats(state = EngineState.IDLE_STANDBY))
            }
            ACTION_START_RECORDING -> {
                val reason = intent?.getStringExtra("EXTRA_REASON") ?: "MANUAL"
                startActiveTrip(reason)
            }
            ACTION_VEHICLE_STOPPED -> {
                scheduleTripFinalization()
            }
            ACTION_STOP_RECORDING -> {
                finalizeTripNow()
            }
        }

        return START_STICKY
    }

    private fun startForegroundWithNotification(stats: LiveDriveStats) {
        val notification = NotificationHelper.buildForegroundNotification(this, stats)
        val foregroundServiceType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION
        } else {
            0
        }
        ServiceCompat.startForeground(this, NOTIFICATION_ID, notification, foregroundServiceType)
    }

    private fun setupLocationCallback() {
        locationCallback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                for (location in result.locations) {
                    processIncomingLocation(location)
                }
            }
        }
    }

    @SuppressLint("MissingPermission")
    private fun startActiveTrip(reason: String) {
        if (isActivelyRecording) return

        isActivelyRecording = true
        dwellingJob?.cancel()
        dwellingJob = null

        currentTripId = UUID.randomUUID().toString()
        tripStartTime = System.currentTimeMillis()
        accumulatedMeters = 0.0
        lastRecordedLocation = null
        activeCoordinates.clear()
        locationFilter.reset()

        val locationRequest = LocationRequest.Builder(
            Priority.PRIORITY_HIGH_ACCURACY,
            LOCATION_INTERVAL_MS
        )
            .setMinUpdateDistanceMeters(MIN_DISTANCE_METERS)
            .setMinUpdateIntervalMillis(FASTEST_INTERVAL_MS)
            .build()

        fusedLocationClient.requestLocationUpdates(
            locationRequest,
            locationCallback,
            Looper.getMainLooper()
        )

        updateStats(
            LiveDriveStats(
                tripId = currentTripId,
                state = EngineState.RECORDING_DRIVE,
                distanceMiles = 0.0,
                deductionAmount = 0.0
            )
        )
    }

    private fun processIncomingLocation(location: Location) {
        if (!isActivelyRecording || currentTripId == null) return

        if (!locationFilter.shouldAcceptLocation(location)) {
            return
        }

        // Vehicle is moving: reset dwelling cooldown
        dwellingJob?.cancel()
        dwellingJob = null

        val previous = lastRecordedLocation
        if (previous != null) {
            val deltaMeters = location.distanceTo(previous).toDouble()
            accumulatedMeters += deltaMeters
        }
        lastRecordedLocation = location
        activeCoordinates.add(Pair(location.latitude, location.longitude))

        val currentMiles = TaxCalculator.metersToMiles(accumulatedMeters)
        val currentDeduction = TaxCalculator.calculateDeduction(currentMiles)
        val currentSpeed = if (location.hasSpeed()) location.speed else 0.0f
        val elapsedSeconds = (System.currentTimeMillis() - tripStartTime) / 1000

        val stats = LiveDriveStats(
            tripId = currentTripId,
            state = EngineState.RECORDING_DRIVE,
            distanceMiles = currentMiles,
            deductionAmount = currentDeduction,
            currentSpeedMps = currentSpeed,
            durationSeconds = elapsedSeconds,
            waypointCount = activeCoordinates.size
        )

        updateStats(stats)

        // Asynchronously persist waypoint to local Room DB
        val tripId = currentTripId ?: return
        serviceScope.launch(Dispatchers.IO) {
            val db = (applicationContext as MileageTrackerApp).database
            db.tripDao().insertWaypoint(
                WaypointEntity(
                    tripId = tripId,
                    latitude = location.latitude,
                    longitude = location.longitude,
                    speedMps = currentSpeed,
                    accuracyMeters = location.accuracy,
                    timestamp = location.time
                )
            )
        }
    }

    private fun scheduleTripFinalization() {
        if (!isActivelyRecording || dwellingJob != null) return

        updateStats(
            _liveStats.value.copy(state = EngineState.DWELLING_COOLDOWN)
        )

        // Wait 4 minutes (or 30s during testing) of inactivity before finalizing
        dwellingJob = serviceScope.launch {
            delay(STATIONARY_DWELL_TIMEOUT_MS)
            finalizeTripNow()
        }
    }

    private fun finalizeTripNow() {
        if (!isActivelyRecording || currentTripId == null) return

        val tripId = currentTripId!!
        val endTime = System.currentTimeMillis()
        val totalMiles = TaxCalculator.metersToMiles(accumulatedMeters)
        val deduction = TaxCalculator.calculateDeduction(totalMiles)

        // Stop GPS location updates
        fusedLocationClient.removeLocationUpdates(locationCallback)
        isActivelyRecording = false
        dwellingJob?.cancel()
        dwellingJob = null

        // Only save trips with meaningful distance (> 0.1 miles) to avoid false driveway shifts
        if (totalMiles >= 0.1) {
            // Encode GeoJSON polyline
            val coordinatesJson = JSONArray()
            activeCoordinates.forEach { (lat, lng) ->
                val point = JSONObject().apply {
                    put("lat", lat)
                    put("lng", lng)
                }
                coordinatesJson.put(point)
            }

            val completedTrip = TripEntity(
                id = tripId,
                startTimestamp = tripStartTime,
                endTimestamp = endTime,
                distanceMiles = totalMiles,
                deductionRate = TaxCalculator.CURRENT_IRS_RATE,
                deductionAmount = deduction,
                classification = TripClassification.UNCLASSIFIED,
                polylineJson = coordinatesJson.toString(),
                isAutoDetected = true
            )

            serviceScope.launch(Dispatchers.IO) {
                val db = (applicationContext as MileageTrackerApp).database
                db.tripDao().insertTrip(completedTrip)

                // Show instant actionable notification to classify
                withContext(Dispatchers.Main) {
                    NotificationHelper.showTripCompletedNotification(
                        applicationContext,
                        tripId,
                        totalMiles,
                        deduction
                    )
                }
            }
        }

        currentTripId = null
        accumulatedMeters = 0.0
        activeCoordinates.clear()

        updateStats(
            LiveDriveStats(
                state = EngineState.IDLE_STANDBY,
                distanceMiles = 0.0,
                deductionAmount = 0.0
            )
        )
    }

    private fun updateStats(stats: LiveDriveStats) {
        _liveStats.value = stats
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(NOTIFICATION_ID, NotificationHelper.buildForegroundNotification(this, stats))
    }

    override fun onDestroy() {
        super.onDestroy()
        fusedLocationClient.removeLocationUpdates(locationCallback)
        serviceScope.cancel()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        private const val NOTIFICATION_ID = 1001
        private const val LOCATION_INTERVAL_MS = 5000L      // 5 seconds
        private const val FASTEST_INTERVAL_MS = 2500L       // 2.5 seconds
        private const val MIN_DISTANCE_METERS = 15.0f       // 15 meters
        private const val STATIONARY_DWELL_TIMEOUT_MS = 240000L // 4 minutes

        const val ACTION_START_STANDBY = "com.softwarecompany.mileagetracker.ACTION_START_STANDBY"
        const val ACTION_START_RECORDING = "com.softwarecompany.mileagetracker.ACTION_START_RECORDING"
        const val ACTION_VEHICLE_STOPPED = "com.softwarecompany.mileagetracker.ACTION_VEHICLE_STOPPED"
        const val ACTION_STOP_RECORDING = "com.softwarecompany.mileagetracker.ACTION_STOP_RECORDING"

        private val _liveStats = MutableStateFlow(LiveDriveStats())
        val liveStats: StateFlow<LiveDriveStats> = _liveStats.asStateFlow()

        fun startRecording(context: Context, reason: String = "AUTO") {
            val intent = Intent(context, LocationTrackingService::class.java).apply {
                action = ACTION_START_RECORDING
                putExtra("EXTRA_REASON", reason)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun onVehicleStopped(context: Context) {
            val intent = Intent(context, LocationTrackingService::class.java).apply {
                action = ACTION_VEHICLE_STOPPED
            }
            context.startService(intent)
        }

        fun stopRecordingManual(context: Context) {
            val intent = Intent(context, LocationTrackingService::class.java).apply {
                action = ACTION_STOP_RECORDING
            }
            context.startService(intent)
        }
    }
}
