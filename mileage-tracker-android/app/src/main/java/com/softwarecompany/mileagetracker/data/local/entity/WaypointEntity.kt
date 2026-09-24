package com.softwarecompany.mileagetracker.data.local.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "active_waypoints",
    indices = [Index(value = ["tripId"])]
)
data class WaypointEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val tripId: String,
    val latitude: Double,
    val longitude: Double,
    val speedMps: Float, // Speed in meters per second
    val accuracyMeters: Float,
    val timestamp: Long
)
