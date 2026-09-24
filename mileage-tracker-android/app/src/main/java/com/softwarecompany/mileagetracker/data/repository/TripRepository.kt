package com.softwarecompany.mileagetracker.data.repository

import com.softwarecompany.mileagetracker.data.local.dao.ExpenseDao
import com.softwarecompany.mileagetracker.data.local.dao.TripDao
import com.softwarecompany.mileagetracker.data.local.entity.ExpenseEntity
import com.softwarecompany.mileagetracker.data.local.entity.TripClassification
import com.softwarecompany.mileagetracker.data.local.entity.TripEntity
import com.softwarecompany.mileagetracker.data.local.entity.WaypointEntity
import kotlinx.coroutines.flow.Flow

class TripRepository(
    private val tripDao: TripDao,
    private val expenseDao: ExpenseDao
) {

    // Trips
    val allTrips: Flow<List<TripEntity>> = tripDao.getAllTrips()
    val totalBusinessMiles: Flow<Double> = tripDao.getTotalBusinessMiles()
    val totalBusinessDeduction: Flow<Double> = tripDao.getTotalBusinessDeduction()
    val unclassifiedTripsCount: Flow<Int> = tripDao.getUnclassifiedTripsCount()

    suspend fun saveTrip(trip: TripEntity) = tripDao.insertTrip(trip)

    suspend fun classifyTrip(tripId: String, classification: TripClassification) {
        tripDao.updateClassification(tripId, classification)
    }

    suspend fun deleteTrip(trip: TripEntity) = tripDao.deleteTrip(trip)

    // Waypoints during active drive
    suspend fun recordWaypoint(waypoint: WaypointEntity) = tripDao.insertWaypoint(waypoint)

    suspend fun getWaypointsForTrip(tripId: String): List<WaypointEntity> =
        tripDao.getWaypointsForTrip(tripId)

    suspend fun clearActiveWaypoints(tripId: String) = tripDao.clearWaypointsForTrip(tripId)

    // Expenses
    val allExpenses: Flow<List<ExpenseEntity>> = expenseDao.getAllExpenses()
    val totalExpensesAmount: Flow<Double> = expenseDao.getTotalExpensesAmount()

    suspend fun saveExpense(expense: ExpenseEntity) = expenseDao.insertExpense(expense)
}
