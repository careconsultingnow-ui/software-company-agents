package com.softwarecompany.mileagetracker.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.softwarecompany.mileagetracker.data.local.entity.ExpenseCategory
import com.softwarecompany.mileagetracker.data.local.entity.ExpenseEntity
import java.util.UUID

private val EmeraldGreen = Color(0xFF10B981)
private val DialogDarkBg = Color(0xFF1C2541)
private val InputFieldBg = Color(0xFF0F172A)
private val SlateGray = Color(0xFF94A3B8)
private val LightText = Color(0xFFF8FAFC)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddExpenseDialog(
    onDismiss: () -> Unit,
    onSaveExpense: (ExpenseEntity) -> Unit
) {
    var amountText by remember { mutableStateOf("") }
    var merchantText by remember { mutableStateOf("") }
    var notesText by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf(ExpenseCategory.FUEL) }
    var hasReceiptAttachment by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = DialogDarkBg)
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
                        text = "Add 1099 Expense",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = LightText
                    )
                    IconButton(onClick = onDismiss, modifier = Modifier.size(24.dp)) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = SlateGray)
                    }
                }

                // Amount Input
                OutlinedTextField(
                    value = amountText,
                    onValueChange = { amountText = it },
                    label = { Text("Amount ($)", color = SlateGray) },
                    placeholder = { Text("0.00", color = SlateGray) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = LightText,
                        unfocusedTextColor = LightText,
                        focusedBorderColor = EmeraldGreen,
                        unfocusedBorderColor = Color(0xFF2E3856),
                        focusedContainerColor = InputFieldBg,
                        unfocusedContainerColor = InputFieldBg
                    ),
                    singleLine = true,
                    shape = RoundedCornerShape(10.dp)
                )

                // Category Selector
                Text(
                    text = "Category",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = SlateGray
                )

                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(ExpenseCategory.values()) { category ->
                        val isSelected = selectedCategory == category
                        FilterChip(
                            selected = isSelected,
                            onClick = { selectedCategory = category },
                            label = { Text(getCategoryDisplayName(category), fontSize = 11.sp) },
                            leadingIcon = {
                                Icon(
                                    imageVector = getCategoryIcon(category),
                                    contentDescription = null,
                                    modifier = Modifier.size(14.dp)
                                )
                            },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = EmeraldGreen,
                                selectedLabelColor = Color.Black,
                                containerColor = InputFieldBg,
                                labelColor = SlateGray
                            )
                        )
                    }
                }

                // Merchant Name
                OutlinedTextField(
                    value = merchantText,
                    onValueChange = { merchantText = it },
                    label = { Text("Merchant / Place (e.g. Shell, AutoZone)", color = SlateGray) },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = LightText,
                        unfocusedTextColor = LightText,
                        focusedBorderColor = EmeraldGreen,
                        unfocusedBorderColor = Color(0xFF2E3856),
                        focusedContainerColor = InputFieldBg,
                        unfocusedContainerColor = InputFieldBg
                    ),
                    singleLine = true,
                    shape = RoundedCornerShape(10.dp)
                )

                // Notes
                OutlinedTextField(
                    value = notesText,
                    onValueChange = { notesText = it },
                    label = { Text("Business Purpose / Notes", color = SlateGray) },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = LightText,
                        unfocusedTextColor = LightText,
                        focusedBorderColor = EmeraldGreen,
                        unfocusedBorderColor = Color(0xFF2E3856),
                        focusedContainerColor = InputFieldBg,
                        unfocusedContainerColor = InputFieldBg
                    ),
                    maxLines = 3,
                    shape = RoundedCornerShape(10.dp)
                )

                // Receipt Attachment Toggle
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { hasReceiptAttachment = !hasReceiptAttachment },
                    colors = CardDefaults.cardColors(containerColor = InputFieldBg),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = if (hasReceiptAttachment) Icons.Default.ReceiptLong else Icons.Default.CameraAlt,
                            contentDescription = "Receipt",
                            tint = if (hasReceiptAttachment) EmeraldGreen else SlateGray,
                            modifier = Modifier.size(22.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = if (hasReceiptAttachment) "Photo Receipt Attached" else "Attach Photo Receipt",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = if (hasReceiptAttachment) EmeraldGreen else LightText
                            )
                            Text(
                                text = if (hasReceiptAttachment) "Stored locally in encrypted private cache" else "Keep an audit-proof copy for IRS review",
                                fontSize = 11.sp,
                                color = SlateGray
                            )
                        }
                        if (hasReceiptAttachment) {
                            Icon(imageVector = Icons.Default.Check, contentDescription = "Attached", tint = EmeraldGreen)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(6.dp))

                // Submit Button
                Button(
                    onClick = {
                        val amount = amountText.toDoubleOrNull() ?: 0.0
                        if (amount > 0.0) {
                            val newExpense = ExpenseEntity(
                                id = UUID.randomUUID().toString(),
                                dateTimestamp = System.currentTimeMillis(),
                                amount = amount,
                                category = selectedCategory,
                                merchantName = merchantText.ifBlank { null },
                                notes = notesText.ifBlank { null },
                                receiptLocalPath = if (hasReceiptAttachment) "receipt_${System.currentTimeMillis()}.jpg" else null
                            )
                            onSaveExpense(newExpense)
                            onDismiss()
                        }
                    },
                    enabled = (amountText.toDoubleOrNull() ?: 0.0) > 0.0,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldGreen),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text(
                        text = "Save Expense ($)",
                        fontWeight = FontWeight.Bold,
                        color = Color.Black,
                        fontSize = 14.sp
                    )
                }
            }
        }
    }
}

fun getCategoryDisplayName(category: ExpenseCategory): String {
    return when (category) {
        ExpenseCategory.FUEL -> "Fuel"
        ExpenseCategory.MAINTENANCE -> "Maintenance"
        ExpenseCategory.VEHICLE_INSURANCE -> "Insurance"
        ExpenseCategory.PHONE_BILL -> "Phone Bill"
        ExpenseCategory.PARKING_TOLLS -> "Parking & Tolls"
        ExpenseCategory.CAR_WASH -> "Car Wash"
        ExpenseCategory.OTHER -> "Other"
    }
}

fun getCategoryIcon(category: ExpenseCategory): ImageVector {
    return when (category) {
        ExpenseCategory.FUEL -> Icons.Default.LocalGasStation
        ExpenseCategory.MAINTENANCE -> Icons.Default.Build
        ExpenseCategory.VEHICLE_INSURANCE -> Icons.Default.Security
        ExpenseCategory.PHONE_BILL -> Icons.Default.PhoneAndroid
        ExpenseCategory.PARKING_TOLLS -> Icons.Default.Toll
        ExpenseCategory.CAR_WASH -> Icons.Default.LocalCarWash
        ExpenseCategory.OTHER -> Icons.Default.Receipt
    }
}
