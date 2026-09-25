package com.softwarecompany.mileagetracker.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.softwarecompany.mileagetracker.utils.TaxCalculator

private val CardBg = Color(0xFF1C2541)
private val DeepNavyBg = Color(0xFF0F172A)
private val EmeraldGreen = Color(0xFF10B981)
private val CrimsonRed = Color(0xFFEF4444)
private val SlateGray = Color(0xFF94A3B8)
private val LightText = Color(0xFFF8FAFC)

@Composable
fun SettingsDialog(
    onDismiss: () -> Unit,
    onShowOnboarding: () -> Unit
) {
    var vehicleName by remember { mutableStateOf("2023 Toyota Camry") }
    var standardRate by remember { mutableStateOf(TaxCalculator.CURRENT_IRS_RATE.toString()) }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = CardBg)
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Driver & Vehicle Settings",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = LightText
                    )
                    IconButton(onClick = onDismiss, modifier = Modifier.size(24.dp)) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = SlateGray)
                    }
                }

                // Vehicle Profile Section
                Text(
                    text = "VEHICLE PROFILE",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = SlateGray,
                    letterSpacing = 1.sp
                )

                OutlinedTextField(
                    value = vehicleName,
                    onValueChange = { vehicleName = it },
                    label = { Text("Primary Vehicle (Year Make Model)", color = SlateGray) },
                    leadingIcon = {
                        Icon(Icons.Default.DirectionsCar, contentDescription = null, tint = EmeraldGreen)
                    },
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

                Spacer(modifier = Modifier.height(6.dp))

                // IRS Rate Configuration
                Text(
                    text = "TAX RATE CONFIGURATION",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = SlateGray,
                    letterSpacing = 1.sp
                )

                OutlinedTextField(
                    value = standardRate,
                    onValueChange = { standardRate = it },
                    label = { Text("IRS Standard Deduction Rate ($/mi)", color = SlateGray) },
                    leadingIcon = {
                        Icon(Icons.Default.AttachMoney, contentDescription = null, tint = EmeraldGreen)
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

                Text(
                    text = "Standard rate set by the IRS is currently $0.67 per business mile.",
                    fontSize = 11.sp,
                    color = SlateGray
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Help & Guided Tour
                OutlinedButton(
                    onClick = {
                        onDismiss()
                        onShowOnboarding()
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = LightText)
                ) {
                    Icon(Icons.Default.HelpOutline, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Replay App Features Tour", fontSize = 13.sp)
                }

                Spacer(modifier = Modifier.height(6.dp))

                // App Version info
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Mileage & Expense Logger v1.0.0 (Production Candidate)",
                        fontSize = 11.sp,
                        color = SlateGray
                    )
                    Text(
                        text = "Android 14+ Fused Engine • Schedule C Compliant",
                        fontSize = 10.sp,
                        color = Color(0xFF64748B)
                    )
                }
            }
        }
    }
}
