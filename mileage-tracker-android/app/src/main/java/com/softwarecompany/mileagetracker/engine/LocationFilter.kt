package com.softwarecompany.mileagetracker.engine

import android.location.Location

class LocationFilter(
    private val minAccuracyMeters: Float = 25.0f,
    private val minDisplacementMeters: Float = 20.0f
) {
    private var lastValidLocation: Location? = null

    /**
     * Determines whether a raw GPS location fix is valid to include in route distance.
     * Rejects low-accuracy fixes and red-light stationary jitter.
     */
    fun shouldAcceptLocation(candidate: Location): Boolean {
        // 1. Reject inaccurate fixes (e.g. cell tower triangulation or weak GPS satellite locks)
        if (!candidate.hasAccuracy() || candidate.accuracy > minAccuracyMeters) {
            return false
        }

        val previous = lastValidLocation ?: run {
            lastValidLocation = candidate
            return true
        }

        // 2. Reject older or out-of-order timestamps
        if (candidate.time <= previous.time) {
            return false
        }

        // 3. Compute distance between points
        val distance = candidate.distanceTo(previous)

        // 4. If distance is less than minimum displacement, check speed to avoid stationary jitter
        if (distance < minDisplacementMeters) {
            // If the vehicle is stationary (speed < 0.5 m/s or ~1.1 mph), ignore jitter
            if (candidate.hasSpeed() && candidate.speed < 0.5f) {
                return false
            }
        }

        lastValidLocation = candidate
        return true
    }

    fun reset() {
        lastValidLocation = null
    }
}
