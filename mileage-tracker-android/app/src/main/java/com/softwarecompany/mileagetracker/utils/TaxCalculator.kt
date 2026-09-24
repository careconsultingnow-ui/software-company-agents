package com.softwarecompany.mileagetracker.utils

import java.text.NumberFormat
import java.util.Locale

object TaxCalculator {

    // Current standard IRS mileage deduction rate for business use ($0.67 per mile)
    const val CURRENT_IRS_RATE = 0.67

    /**
     * Calculates dollar tax deduction for a given mileage.
     */
    fun calculateDeduction(miles: Double, rate: Double = CURRENT_IRS_RATE): Double {
        if (miles <= 0.0) return 0.0
        return miles * rate
    }

    /**
     * Converts meters to statute miles.
     */
    fun metersToMiles(meters: Double): Double {
        return meters * 0.000621371
    }

    /**
     * Formats currency with standard dollar notation (e.g. $14.25).
     */
    fun formatCurrency(amount: Double): String {
        val format = NumberFormat.getCurrencyInstance(Locale.US)
        return format.format(amount)
    }

    /**
     * Formats mileage to 1 decimal place (e.g. 12.4 mi).
     */
    fun formatMiles(miles: Double): String {
        return String.format(Locale.US, "%.1f mi", miles)
    }
}
