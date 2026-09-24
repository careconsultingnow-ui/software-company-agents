package com.softwarecompany.mileagetracker.data.local.dao

import androidx.room.*
import com.softwarecompany.mileagetracker.data.local.entity.TripClassification
import com.softwarecompany.mileagetracker.data.local.entity.TripEntity
import com.softwarecompany.mileagetracker.data.local.entity.WaypointEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface TripDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTrip(trip: TripEntity)

    @Update
    suspend fun updateTrip(trip: TripEntity)

    @Delete
    suspend fun deleteTrip(trip: TripEntity)

    @Query("SELECT * FROM trips ORDER BY startTimestamp DESC")
    fun getAllTrips(): Flow<List<TripEntity>>

    @Query("SELECT * FROM trips WHERE classification = :classification ORDER BY startTimestamp DESC")
    fun getTripsByClassification(classification: TripClassification): Flow<List<TripEntity>>

    @Query("SELECT * FROM trips WHERE id = :id")
    suspend fun getTripById(id: String): TripEntity?

    @Query("UPDATE trips SET classification = :classification WHERE id = :tripId")
    suspend fun updateClassification(tripId: String, classification: TripClassification)

    // Statistics queries for real-time ROI dashboard
    @Query("SELECT COALESCE(SUM(distanceMiles), 0.0) FROM trips WHERE classification = 'BUSINESS'")
    fun getTotalBusinessMiles(): Flow<Double>

    @Query("SELECT COALESCE(SUM(deductionAmount), 0.0) FROM trips WHERE classification = 'BUSINESS'")
    fun getTotalBusinessDeduction(): Flow<Double>

    @Query("SELECT COUNT(*) FROM trips WHERE classification = 'UNCLASSIFIED'")
    fun getUnclassifiedTripsCount(): Flow<Int>

    // Active Waypoint tracking methods
    @Insert
    suspend fun insertWaypoint(waypoint: WaypointEntity)

    @Query("SELECT * FROM active_waypoints WHERE tripId = :tripId ORDER BY timestamp ASC")
    suspend fun getWaypointsForTrip(tripId: String): List<WaypointEntity>

    @Query("DELETE FROM active_waypoints WHERE tripId = :tripId")
    suspend fun clearWaypointsForTrip(tripId: String)
}
