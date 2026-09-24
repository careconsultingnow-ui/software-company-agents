package com.softwarecompany.mileagetracker.ui

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.softwarecompany.mileagetracker.data.local.entity.TripClassification
import com.softwarecompany.mileagetracker.data.local.entity.TripEntity
import com.softwarecompany.mileagetracker.engine.EngineState
import com.softwarecompany.mileagetracker.engine.LiveDriveStats
import com.softwarecompany.mileagetracker.utils.TaxCalculator
import java.text.SimpleDateFormat
import java.util.*

val DarkBackground = Color(0xFF0B132B)
val CardBackground = Color(0xFF1C2541)
val EmeraldGreen = Color(0xFF10B981)
val AmberWarning = Color(0xFFF59E0B)
val CrimsonRed = Color(0xFFEF4444)
val SlateGray = Color(0xFF64748B)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    viewModel: DashboardViewModel,
    isIgnoringBattery: Boolean,
    onRequestDisableBatteryOptimization: () -> Unit
) {
    val liveStats by viewModel.liveStats.collectAsState()
    val totalDeduction by viewModel.totalDeduction.collectAsState()
    val totalMiles by viewModel.totalMiles.collectAsState()
    val unclassifiedCount by viewModel.unclassifiedCount.collectAsState()
    val recentTrips by viewModel.recentTrips.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(10.dp)
                                .clip(CircleShape)
                                .background(
                                    if (liveStats.state == EngineState.RECORDING_DRIVE) EmeraldGreen else SlateGray
                                )
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Auto-Mileage Logger",
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = DarkBackground
                )
            )
        },
        containerColor = DarkBackground
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // 1. Battery Optimization Warning Banner (If not exempted)
            if (!isIgnoringBattery) {
                item {
                    BatteryWarningBanner(onRequestDisable = onRequestDisableBatteryOptimization)
                }
            }

            // 2. Real-Time ROI Tax Savings Summary Card
            item {
                RoiSummaryCard(
                    totalDeductions = totalDeduction,
                    totalMiles = totalMiles,
                    unclassifiedCount = unclassifiedCount
                )
            }

            // 3. Live Drive Recording Banner (Dynamic State)
            item {
                LiveDriveBanner(
                    stats = liveStats,
                    onStartDrive = { viewModel.startManualDrive() },
                    onStopDrive = { viewModel.stopManualDrive() }
                )
            }

            // 4. Recent Drives Header
            item {
                Text(
                    text = "Recent Drives",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }

            // 5. Trip Classification List
            if (recentTrips.isEmpty()) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = CardBackground),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(24.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "No drives recorded yet.\nStart your vehicle or tap 'Simulate Drive' to test.",
                                color = SlateGray,
                                fontSize = 14.sp
                            )
                        }
                    }
                }
            } else {
                items(recentTrips, key = { it.id }) { trip ->
                    TripCard(
                        trip = trip,
                        onClassify = { classification ->
                            viewModel.classifyTrip(trip.id, classification)
                        }
                    )
                }
            }

            item {
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

@Composable
fun BatteryWarningBanner(onRequestDisable: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF3B2A1A)),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.Warning,
                contentDescription = "Warning",
                tint = AmberWarning,
                modifier = Modifier.size(28.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Background Protection Required",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = Color.White
                )
                Text(
                    text = "Grant exemption so your phone doesn't kill trip tracking.",
                    fontSize = 12.sp,
                    color = Color(0xFFD1D5DB)
                )
            }
            TextButton(onClick = onRequestDisable) {
                Text("FIX", fontWeight = FontWeight.Bold, color = AmberWarning)
            }
        }
    }
}

@Composable
fun RoiSummaryCard(
    totalDeductions: Double,
    totalMiles: Double,
    unclassifiedCount: Int
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = CardBackground),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Text(
                text = "ESTIMATED TAX SAVINGS (SCHEDULE C)",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = SlateGray,
                letterSpacing = 1.sp
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = TaxCalculator.formatCurrency(totalDeductions),
                fontSize = 36.sp,
                fontWeight = FontWeight.ExtraBold,
                color = EmeraldGreen
            )
            Spacer(modifier = Modifier.height(14.dp))
            Divider(color = Color(0xFF2E3856), thickness = 1.dp)
            Spacer(modifier = Modifier.height(14.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(text = "Business Miles", fontSize = 12.sp, color = SlateGray)
                    Text(
                        text = TaxCalculator.formatMiles(totalMiles),
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text(text = "Pending Classification", fontSize = 12.sp, color = SlateGray)
                    Text(
                        text = "$unclassifiedCount drives",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (unclassifiedCount > 0) AmberWarning else Color.White
                    )
                }
            }
        }
    }
}

@Composable
fun LiveDriveBanner(
    stats: LiveDriveStats,
    onStartDrive: () -> Unit,
    onStopDrive: () -> Unit
) {
    val isRecording = stats.state == EngineState.RECORDING_DRIVE

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (isRecording) Color(0xFF064E3B) else Color(0xFF1E293B)
        ),
        shape = RoundedCornerShape(14.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = if (isRecording) Icons.Default.DirectionsCar else Icons.Default.Sensors,
                        contentDescription = "Car",
                        tint = if (isRecording) EmeraldGreen else SlateGray
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (isRecording) "RECORDING DRIVE IN PROGRESS" else "AUTO-DETECTION STANDBY",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = Color.White
                    )
                }

                Button(
                    onClick = if (isRecording) onStopDrive else onStartDrive,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isRecording) CrimsonRed else EmeraldGreen
                    ),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = if (isRecording) "Stop" else "Simulate Drive",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            if (isRecording) {
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceAround
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Current Distance", fontSize = 11.sp, color = Color(0xFFA7F3D0))
                        Text(
                            text = TaxCalculator.formatMiles(stats.distanceMiles),
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Deduction Accrued", fontSize = 11.sp, color = Color(0xFFA7F3D0))
                        Text(
                            text = TaxCalculator.formatCurrency(stats.deductionAmount),
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Waypoints", fontSize = 11.sp, color = Color(0xFFA7F3D0))
                        Text(
                            text = "${stats.waypointCount}",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun TripCard(
    trip: TripEntity,
    onClassify: (TripClassification) -> Unit
) {
    val dateFormat = remember { SimpleDateFormat("EEE, MMM d • h:mm a", Locale.getDefault()) }
    val dateString = remember(trip.startTimestamp) { dateFormat.format(Date(trip.startTimestamp)) }

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = CardBackground),
        shape = RoundedCornerShape(14.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column {
                    Text(
                        text = dateString,
                        fontSize = 12.sp,
                        color = SlateGray
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = TaxCalculator.formatMiles(trip.distanceMiles),
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }

                // Deduction Tag
                Surface(
                    color = EmeraldGreen.copy(alpha = 0.15f),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        text = "+${TaxCalculator.formatCurrency(trip.deductionAmount)}",
                        color = EmeraldGreen,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Action Classification Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = { onClassify(TripClassification.BUSINESS) },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.outlinedButtonColors(
                        containerColor = if (trip.classification == TripClassification.BUSINESS) EmeraldGreen.copy(alpha = 0.2f) else Color.Transparent
                    ),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Work,
                        contentDescription = "Business",
                        tint = EmeraldGreen,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Business ($)", color = EmeraldGreen, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }

                OutlinedButton(
                    onClick = { onClassify(TripClassification.PERSONAL) },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.outlinedButtonColors(
                        containerColor = if (trip.classification == TripClassification.PERSONAL) Color(0xFF334155) else Color.Transparent
                    ),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = "Personal",
                        tint = SlateGray,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Personal", color = Color.White, fontSize = 12.sp)
                }
            }
        }
    }
}
