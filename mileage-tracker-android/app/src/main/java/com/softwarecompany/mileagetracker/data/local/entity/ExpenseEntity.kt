package com.softwarecompany.mileagetracker.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

enum class ExpenseCategory {
    FUEL,
    MAINTENANCE,
    VEHICLE_INSURANCE,
    PHONE_BILL,
    PARKING_TOLLS,
    CAR_WASH,
    OTHER
}

@Entity(tableName = "expenses")
data class ExpenseEntity(
    @PrimaryKey
    val id: String,
    val userId: String = "local_driver",
    val dateTimestamp: Long,
    val amount: Double,
    val category: ExpenseCategory,
    val merchantName: String? = null,
    val receiptLocalPath: String? = null,
    val receiptCloudUrl: String? = null,
    val notes: String? = null,
    val syncedToCloud: Boolean = false
)
