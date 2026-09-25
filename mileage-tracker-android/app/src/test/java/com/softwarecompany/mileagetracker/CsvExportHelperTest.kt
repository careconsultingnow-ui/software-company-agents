package com.softwarecompany.mileagetracker

import com.softwarecompany.mileagetracker.data.local.entity.TripClassification
import com.softwarecompany.mileagetracker.data.local.entity.TripEntity
import com.softwarecompany.mileagetracker.utils.CsvExportHelper
import org.junit.Assert.assertTrue
import org.junit.Test

class CsvExportHelperTest {

    @Test
    fun testCsvHeaderAndRowGeneration() {
        val sampleTrip = TripEntity(
            id = "test-trip-uuid-1",
            startTimestamp = 1716382800000L, // Specific timestamp
            endTimestamp = 1716384600000L,   // 30 mins later
            distanceMiles = 15.5,
            deductionRate = 0.67,
            deductionAmount = 10.385,
            classification = TripClassification.BUSINESS,
            polylineJson = "[]",
            startAddress = "123 Market St, Suite 4",
            endAddress = "Airport Terminal",
            isAutoDetected = true
        )

        val csv = CsvExportHelper.generateCsv(listOf(sampleTrip))

        // Assert CSV Header contains IRS compliance keys
        assertTrue(csv.contains("Trip ID,Date,Start Time,End Time,Duration (Mins),Classification,Miles Driven,IRS Rate ($/mi),Tax Deduction ($)"))

        // Assert CSV row contains classification and correctly escaped address
        assertTrue(csv.contains("test-trip-uuid-1"))
        assertTrue(csv.contains("BUSINESS"))
        assertTrue(csv.contains("15.50"))
        assertTrue(csv.contains("\"123 Market St, Suite 4\"")) // Escaped quotes due to comma
        assertTrue(csv.contains("Airport Terminal"))
    }
}
