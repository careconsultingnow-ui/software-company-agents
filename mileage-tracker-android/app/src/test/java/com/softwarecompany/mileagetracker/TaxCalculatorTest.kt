package com.softwarecompany.mileagetracker

import com.softwarecompany.mileagetracker.utils.TaxCalculator
import org.junit.Assert.assertEquals
import org.junit.Test

class TaxCalculatorTest {

    @Test
    fun testDeductionCalculation() {
        val miles = 100.0
        val deduction = TaxCalculator.calculateDeduction(miles, 0.67)
        assertEquals(67.0, deduction, 0.001)
    }

    @Test
    fun testMetersToMilesConversion() {
        val meters = 1609.344 // Exactly 1 mile in meters
        val miles = TaxCalculator.metersToMiles(meters)
        assertEquals(1.0, miles, 0.01)
    }

    @Test
    fun testCurrencyFormatting() {
        val formatted = TaxCalculator.formatCurrency(14.25)
        assertEquals("$14.25", formatted)
    }
}
