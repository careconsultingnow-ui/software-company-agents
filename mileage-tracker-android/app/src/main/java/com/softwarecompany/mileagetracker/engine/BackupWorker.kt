package com.softwarecompany.mileagetracker.engine

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.softwarecompany.mileagetracker.MileageTrackerApp
import com.softwarecompany.mileagetracker.utils.CsvExportHelper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.FileWriter
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Background WorkManager worker responsible for generating periodic
 * audit archives and SQLite database snapshots.
 */
class BackupWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            val app = applicationContext as MileageTrackerApp
            val db = app.database

            val trips = db.tripDao().getAllTrips().first()
            val expenses = db.expenseDao().getAllExpenses().first()

            val backupDir = File(applicationContext.filesDir, "backups")
            if (!backupDir.exists()) {
                backupDir.mkdirs()
            }

            val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
            val backupFile = File(backupDir, "mileage_backup_$timestamp.json")

            val rootJson = JSONObject().apply {
                put("version", 1)
                put("exportTimestamp", System.currentTimeMillis())
                put("totalTrips", trips.size)
                put("totalExpenses", expenses.size)

                val tripsArray = JSONArray()
                for (t in trips) {
                    val tripObj = JSONObject().apply {
                        put("id", t.id)
                        put("startTimestamp", t.startTimestamp)
                        put("endTimestamp", t.endTimestamp)
                        put("distanceMiles", t.distanceMiles)
                        put("deductionRate", t.deductionRate)
                        put("deductionAmount", t.deductionAmount)
                        put("classification", t.classification.name)
                        put("polylineJson", t.polylineJson)
                        put("isAutoDetected", t.isAutoDetected)
                    }
                    tripsArray.put(tripObj)
                }
                put("trips", tripsArray)

                val expensesArray = JSONArray()
                for (e in expenses) {
                    val expObj = JSONObject().apply {
                        put("id", e.id)
                        put("dateTimestamp", e.dateTimestamp)
                        put("amount", e.amount)
                        put("category", e.category.name)
                        put("merchantName", e.merchantName)
                        put("notes", e.notes)
                        put("receiptLocalPath", e.receiptLocalPath)
                    }
                    expensesArray.put(expObj)
                }
                put("expenses", expensesArray)
            }

            FileWriter(backupFile).use { writer ->
                writer.write(rootJson.toString(2))
            }

            // Also refresh latest IRS CSV report
            val csvContent = CsvExportHelper.generateCsv(trips)
            val csvReportFile = File(backupDir, "latest_irs_schedule_c.csv")
            FileWriter(csvReportFile).use { writer ->
                writer.write(csvContent)
            }

            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}
