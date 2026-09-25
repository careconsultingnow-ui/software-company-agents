package com.softwarecompany.mileagetracker.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AttachMoney
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.softwarecompany.mileagetracker.utils.TaxCalculator

private val CardBg = Color(0xFF1C2541)
private val DeepNavyBg = Color(0xFF0F172A)
private val EmeraldGreen = Color(0xFF10B981)
private val AmberWarning = Color(0xFFF59E0B)
private val SlateGray = Color(0xFF94A3B8)
private val LightText = Color(0xFFF8FAFC)

/**
 * 1099 Gig Income & Tax Shield Reconciliation Card.
 * Compares gross platform earnings (Uber, Lyft, DoorDash) against total tax write-offs.
 */
@Composable
fun TrueNetIncomeCard(
    totalMileageDeductions: Double,
    totalExpenses: Double,
    grossEarnings: Double,
    onGrossEarningsChanged: (Double) -> Unit
) {
    var inputEarnings by remember(grossEarnings) {
        mutableStateOf(if (grossEarnings > 0) String.format("%.2f", grossEarnings) else "")
    }

    val totalDeductionShield = totalMileageDeductions + totalExpenses
    // Estimated direct tax liability reduction (approx 25% self-employment + income tax bracket)
    val estimatedCashTaxShield = totalDeductionShield * 0.25
    val netTaxableIncome = (grossEarnings - totalDeductionShield).coerceAtLeast(0.0)

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = CardBg),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "1099 TAX SHIELD & TRUE NET",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = SlateGray,
                    letterSpacing = 1.sp
                )
                Icon(
                    imageVector = Icons.Default.Shield,
                    contentDescription = "Tax Shield",
                    tint = EmeraldGreen,
                    modifier = Modifier.size(18.dp)
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Gross Payout Input
            OutlinedTextField(
                value = inputEarnings,
                onValueChange = {
                    inputEarnings = it
                    val parsed = it.toDoubleOrNull() ?: 0.0
                    onGrossEarningsChanged(parsed)
                },
                label = { Text("Gross Platform Payout (Uber/DoorDash/Lyft)", color = SlateGray, fontSize = 12.sp) },
                placeholder = { Text("e.g. 1250.00", color = SlateGray) },
                leadingIcon = {
                    Icon(imageVector = Icons.Default.AttachMoney, contentDescription = "Dollar", tint = EmeraldGreen)
                },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = LightText,
                    unfocusedTextColor = LightText,
                    focusedBorderColor = EmeraldGreen,
                    unfocusedBorderColor = Color(0xFF2E3856),
                    focusedContainerColor = DeepNavyBg,
                    unfocusedContainerColor = DeepNavyBg
                ),
                singleLine = true,
                shape = RoundedCornerShape(10.dp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Financial Breakdown Grid
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Total Tax Write-off Card
                Surface(
                    modifier = Modifier.weight(1f),
                    color = DeepNavyBg,
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("Total Deductions", fontSize = 11.sp, color = SlateGray)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = TaxCalculator.formatCurrency(totalDeductionShield),
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = EmeraldGreen
                        )
                        Text(
                            text = "Miles + Expenses",
                            fontSize = 10.sp,
                            color = Color(0xFF64748B)
                        )
                    }
                }

                // Estimated Cash Tax Saved
                Surface(
                    modifier = Modifier.weight(1f),
                    color = DeepNavyBg,
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("IRS Cash Shield", fontSize = 11.sp, color = SlateGray)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = TaxCalculator.formatCurrency(estimatedCashTaxShield),
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF38BDF8)
                        )
                        Text(
                            text = "Estimated cash saved",
                            fontSize = 10.sp,
                            color = Color(0xFF64748B)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            Divider(color = Color(0xFF2E3856), thickness = 1.dp)

            Spacer(modifier = Modifier.height(14.dp))

            // Bottom Net Profit Summary
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Net Taxable Profit", fontSize = 12.sp, color = SlateGray)
                    Text(
                        text = TaxCalculator.formatCurrency(netTaxableIncome),
                        fontSize = 18.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = LightText
                    )
                }

                Surface(
                    color = EmeraldGreen.copy(alpha = 0.15f),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    val shieldPercent = if (grossEarnings > 0) {
                        ((totalDeductionShield / grossEarnings) * 100).coerceAtMost(100.0)
                    } else 0.0
                    Text(
                        text = String.format("%.0f%% Income Shielded", shieldPercent),
                        color = EmeraldGreen,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }
        }
    }
}
