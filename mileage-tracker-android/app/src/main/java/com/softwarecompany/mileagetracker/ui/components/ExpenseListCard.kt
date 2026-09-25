package com.softwarecompany.mileagetracker.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.softwarecompany.mileagetracker.data.local.entity.ExpenseEntity
import com.softwarecompany.mileagetracker.utils.TaxCalculator
import java.text.SimpleDateFormat
import java.util.*

private val CardBg = Color(0xFF1C2541)
private val EmeraldGreen = Color(0xFF10B981)
private val CrimsonRed = Color(0xFFEF4444)
private val SlateGray = Color(0xFF94A3B8)
private val LightText = Color(0xFFF8FAFC)

@Composable
fun ExpenseListCard(
    expense: ExpenseEntity,
    onDelete: (ExpenseEntity) -> Unit
) {
    val dateFormat = remember { SimpleDateFormat("MMM d, yyyy", Locale.getDefault()) }
    val dateString = remember(expense.dateTimestamp) { dateFormat.format(Date(expense.dateTimestamp)) }

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = CardBg),
        shape = RoundedCornerShape(14.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Icon
            Surface(
                modifier = Modifier.size(42.dp),
                shape = CircleShape,
                color = EmeraldGreen.copy(alpha = 0.15f)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = getCategoryIcon(expense.category),
                        contentDescription = null,
                        tint = EmeraldGreen,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.width(14.dp))

            // Details
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = expense.merchantName ?: getCategoryDisplayName(expense.category),
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = LightText
                )
                Spacer(modifier = Modifier.height(2.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "$dateString • ${getCategoryDisplayName(expense.category)}",
                        fontSize = 12.sp,
                        color = SlateGray
                    )
                    if (expense.receiptLocalPath != null) {
                        Spacer(modifier = Modifier.width(6.dp))
                        Icon(
                            imageVector = Icons.Default.Receipt,
                            contentDescription = "Receipt",
                            tint = Color(0xFF38BDF8),
                            modifier = Modifier.size(12.dp)
                        )
                    }
                }
                if (!expense.notes.isNullOrBlank()) {
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = expense.notes,
                        fontSize = 11.sp,
                        color = Color(0xFF64748B),
                        maxLines = 1
                    )
                }
            }

            // Amount
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = TaxCalculator.formatCurrency(expense.amount),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = LightText
                )
                IconButton(
                    onClick = { onDelete(expense) },
                    modifier = Modifier.size(28.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.DeleteOutline,
                        contentDescription = "Delete",
                        tint = CrimsonRed.copy(alpha = 0.7f),
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }
    }
}
