package com.softwarecompany.mileagetracker.engine

enum class EngineState {
    IDLE_STANDBY,        // Passive Activity Recognition listening, GPS off
    MOTION_VERIFYING,    // In-vehicle activity detected, checking speed threshold (>15mph)
    RECORDING_DRIVE,     // High-accuracy GPS active, logging waypoints & accumulating distance
    DWELLING_COOLDOWN    // Vehicle stopped or still detected, counting down before trip finalization
}

data class LiveDriveStats(
    val tripId: String? = null,
    val state: EngineState = EngineState.IDLE_STANDBY,
    val distanceMiles: Double = 0.0,
    val deductionAmount: Double = 0.0,
    val currentSpeedMps: Float = 0.0f,
    val durationSeconds: Long = 0L,
    val waypointCount: Int = 0
)
