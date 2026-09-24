package com.softwarecompany.mileagetracker.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

enum class TripClassification {
    UNCLASSIFIED,
    BUSINESS,
    PERSONAL
}

@Entity(tableName = "trips")
data class TripEntity(
    @PrimaryKey
    val id: String, // UUID
    val userId: String = "local_driver",
    val startTimestamp: Long,
    val endTimestamp: Long,
    val startAddress: String? = null,
    val endAddress: String? = null,
    val distanceMiles: Double,
    val deductionRate: Double, // e.g. 0.67 for standard IRS rate
    val deductionAmount: Double, // distanceMiles * deductionRate
    val classification: TripClassification = TripClassification.UNCLASSIFIED,
    val polylineJson: String, // Array of lat/lng waypoints encoded as JSON string
    val isAutoDetected: Boolean = true,
    val syncedToCloud: Boolean = false
)
