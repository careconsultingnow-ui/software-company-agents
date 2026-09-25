package com.softwarecompany.mileagetracker.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.softwarecompany.mileagetracker.data.local.entity.TripClassification
import com.softwarecompany.mileagetracker.data.local.entity.TripEntity
import com.softwarecompany.mileagetracker.utils.TaxCalculator
import java.text.SimpleDateFormat
import java.util.*

private val DarkSheetBg = Color(0xFF0F172A)
private val CardInnerBg = Color(0xFF1E293B)
private val EmeraldGreen = Color(0xFF10B981)
private val CrimsonRed = Color(0xFFEF4444)
private val SlateGray = Color(0xFF94A3B8)
private val LightText = Color(0xFFF8FAFC)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TripDetailSheet(
    trip: TripEntity,
    onDismiss: () -> Unit,
    onClassify: (TripClassification) -> Unit,
    onDeleteTrip: (TripEntity) -> Unit
) {
    val modalBottomSheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val dateFormat = remember { SimpleDateFormat("EEEE, MMMM d, yyyy", Locale.getDefault()) }
    val timeFormat = remember { SimpleDateFormat("h:mm a", Locale.getDefault()) }

    val dateFormatted = remember(trip.startTimestamp) { dateFormat.format(Date(trip.startTimestamp)) }
    val startTimeFormatted = remember(trip.startTimestamp) { timeFormat.format(Date(trip.startTimestamp)) }
    val endTimeFormatted = remember(trip.endTimestamp) { timeFormat.format(Date(trip.endTimestamp)) }
    val durationMins = remember(trip.startTimestamp, trip.endTimestamp) {
        ((trip.endTimestamp - trip.startTimestamp) / 60000).coerceAtLeast(1)
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = modalBottomSheetState,
        containerColor = DarkSheetBg,
        dragHandle = { BottomSheetDefaults.DragHandle(color = SlateGray) }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .padding(bottom = 32.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = dateFormatted,
                        fontSize = 13.sp,
                        color = SlateGray,
                        fontWeight = FontWeight.Medium
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "Trip Telemetry & Audit Log",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = LightText
                    )
                }

                IconButton(onClick = onDismiss) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Close",
                        tint = SlateGray
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 1. Route Map Preview
            RouteMapCanvas(
                polylineJson = trip.polylineJson,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(16.dp))

            // 2. Metrics Summary Grid
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Distance Card
                Card(
                    modifier = Modifier.weight(1f),
                    colors = CardDefaults.cardColors(containerColor = CardInnerBg),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text("Distance", fontSize = 11.sp, color = SlateGray)
                        Text(
                            text = TaxCalculator.formatMiles(trip.distanceMiles),
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = LightText
                        )
                    }
                }

                // Deduction Card
                Card(
                    modifier = Modifier.weight(1f),
                    colors = CardDefaults.cardColors(containerColor = CardInnerBg),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text("Tax Deduction", fontSize = 11.sp, color = SlateGray)
                        Text(
                            text = TaxCalculator.formatCurrency(trip.deductionAmount),
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = EmeraldGreen
                        )
                    }
                }

                // Duration Card
                Card(
                    modifier = Modifier.weight(1f),
                    colors = CardDefaults.cardColors(containerColor = CardInnerBg),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text("Duration", fontSize = 11.sp, color = SlateGray)
                        Text(
                            text = "$durationMins min",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = LightText
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // 3. Timestamps & Audit Details Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = CardInnerBg),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Start Time", fontSize = 12.sp, color = SlateGray)
                        Text(startTimeFormatted, fontSize = 12.sp, color = LightText, fontWeight = FontWeight.SemiBold)
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("End Time", fontSize = 12.sp, color = SlateGray)
                        Text(endTimeFormatted, fontSize = 12.sp, color = LightText, fontWeight = FontWeight.SemiBold)
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("IRS Rate Applied", fontSize = 12.sp, color = SlateGray)
                        Text("$${trip.deductionRate}/mile (Standard)", fontSize = 12.sp, color = EmeraldGreen, fontWeight = FontWeight.SemiBold)
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Detection Engine", fontSize = 12.sp, color = SlateGray)
                        Text(
                            if (trip.isAutoDetected) "Fused Motion Co-Processor" else "Manual Session",
                            fontSize = 12.sp,
                            color = LightText,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // 4. Classification Action Switcher
            Text(
                text = "Classification",
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = SlateGray
            )
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Button(
                    onClick = { onClassify(TripClassification.BUSINESS) },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (trip.classification == TripClassification.BUSINESS) EmeraldGreen else CardInnerBg
                    ),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Work,
                        contentDescription = "Business",
                        modifier = Modifier.size(16.dp),
                        tint = if (trip.classification == TripClassification.BUSINESS) Color.Black else EmeraldGreen
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        "Business ($)",
                        color = if (trip.classification == TripClassification.BUSINESS) Color.Black else LightText,
                        fontWeight = FontWeight.Bold
                    )
                }

                Button(
                    onClick = { onClassify(TripClassification.PERSONAL) },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (trip.classification == TripClassification.PERSONAL) CrimsonRed else CardInnerBg
                    ),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = "Personal",
                        modifier = Modifier.size(16.dp),
                        tint = if (trip.classification == TripClassification.PERSONAL) Color.White else SlateGray
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        "Personal",
                        color = LightText,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // 5. Delete Trip Option
            OutlinedButton(
                onClick = { onDeleteTrip(trip) },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = CrimsonRed),
                shape = RoundedCornerShape(10.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.DeleteOutline,
                    contentDescription = "Delete",
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text("Delete Trip Record", fontSize = 13.sp)
            }
        }
    }
}
