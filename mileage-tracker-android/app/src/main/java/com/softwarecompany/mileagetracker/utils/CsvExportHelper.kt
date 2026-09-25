package com.softwarecompany.mileagetracker.utils

import android.content.Context
import android.content.Intent
import androidx.core.content.FileProvider
import com.softwarecompany.mileagetracker.data.local.entity.TripClassification
import com.softwarecompany.mileagetracker.data.local.entity.TripEntity
import java.io.File
import java.io.FileWriter
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object CsvExportHelper {

    private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.US)
    private val timeFormat = SimpleDateFormat("HH:mm:ss", Locale.US)

    /**
     * Generates standard IRS Schedule C compliant CSV content.
     */
    fun generateCsv(trips: List<TripEntity>): String {
        val sb = StringBuilder()
        // Standard IRS Mileage Log Header
        sb.append("Trip ID,Date,Start Time,End Time,Duration (Mins),Classification,Miles Driven,IRS Rate ($/mi),Tax Deduction ($),Start Address,End Address,Auto Detected\n")

        for (trip in trips) {
            val startDate = dateFormat.format(Date(trip.startTimestamp))
            val startTime = timeFormat.format(Date(trip.startTimestamp))
            val endTime = timeFormat.format(Date(trip.endTimestamp))
            val durationMinutes = ((trip.endTimestamp - trip.startTimestamp) / 60000).coerceAtLeast(0)
            val milesFormatted = String.format(Locale.US, "%.2f", trip.distanceMiles)
            val rateFormatted = String.format(Locale.US, "%.2f", trip.deductionRate)
            val deductionFormatted = String.format(Locale.US, "%.2f", trip.deductionAmount)
            val startAddrEscaped = escapeCsvField(trip.startAddress ?: "")
            val endAddrEscaped = escapeCsvField(trip.endAddress ?: "")

            sb.append(
                "${trip.id},$startDate,$startTime,$endTime,$durationMinutes," +
                "${trip.classification.name},$milesFormatted,$rateFormatted,$deductionFormatted," +
                "$startAddrEscaped,$endAddrEscaped,${trip.isAutoDetected}\n"
            )
        }
        return sb.toString()
    }

    /**
     * Creates a file in the app cache and returns a SEND Intent using FileProvider.
     */
    fun createShareIntent(context: Context, trips: List<TripEntity>): Intent {
        val csvContent = generateCsv(trips)
        val reportsDir = File(context.cacheDir, "reports")
        if (!reportsDir.exists()) {
            reportsDir.mkdirs()
        }

        val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
        val file = File(reportsDir, "Mileage_Report_$timestamp.csv")

        FileWriter(file).use { writer ->
            writer.write(csvContent)
        }

        val contentUri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            file
        )

        return Intent(Intent.ACTION_SEND).apply {
            type = "text/csv"
            putExtra(Intent.EXTRA_SUBJECT, "IRS Schedule C Mileage Log - $timestamp")
            putExtra(Intent.EXTRA_TEXT, "Attached is your automated mileage and tax deduction log.")
            putExtra(Intent.EXTRA_STREAM, contentUri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
    }

    private fun escapeCsvField(field: String): String {
        return if (field.contains(",") || field.contains("\"") || field.contains("\n")) {
            "\"" + field.replace("\"", "\"\"") + "\""
        } else {
            field
        }
    }
}
