package com.softwarecompany.mileagetracker.ui

import android.content.Context
import android.widget.Toast
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.softwarecompany.mileagetracker.data.local.entity.TripClassification
import com.softwarecompany.mileagetracker.data.local.entity.TripEntity
import com.softwarecompany.mileagetracker.engine.EngineState
import com.softwarecompany.mileagetracker.engine.LiveDriveStats
import com.softwarecompany.mileagetracker.ui.components.SwipeableTripCardStack
import com.softwarecompany.mileagetracker.ui.components.TripDetailSheet
import com.softwarecompany.mileagetracker.utils.CsvExportHelper
import com.softwarecompany.mileagetracker.utils.TaxCalculator
import java.text.SimpleDateFormat
import java.util.*

val DarkBackground = Color(0xFF0B132B)
val CardBackground = Color(0xFF1C2541)
val EmeraldGreen = Color(0xFF10B981)
val AmberWarning = Color(0xFFF59E0B)
val CrimsonRed = Color(0xFFEF4444)
val SlateGray = Color(0xFF94A3B8)
val LightText = Color(0xFFF8FAFC)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    viewModel: DashboardViewModel,
    isIgnoringBattery: Boolean,
    onRequestDisableBatteryOptimization: () -> Unit
) {
    val context = LocalContext.current
    val liveStats by viewModel.liveStats.collectAsState()
    val totalDeduction by viewModel.timeframeDeduction.collectAsState()
    val totalMiles by viewModel.timeframeMiles.collectAsState()
    val unclassifiedTrips by viewModel.unclassifiedTrips.collectAsState()
    val unclassifiedCount by viewModel.unclassifiedCount.collectAsState()
    val filteredTrips by viewModel.filteredTrips.collectAsState()
    val selectedTimeframe by viewModel.selectedTimeframe.collectAsState()
    val selectedStatus by viewModel.selectedStatus.collectAsState()
    val lastUndoAction by viewModel.lastUndoAction.collectAsState()

    var selectedTripForDetails by remember { mutableStateOf<TripEntity?>(null) }

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
                            color = Color.White,
                            fontSize = 18.sp
                        )
                    }
                },
                actions = {
                    // Quick seed mock drive button for instant testing
                    IconButton(onClick = {
                        viewModel.seedSimulatedTrip()
                        Toast.makeText(context, "Mock drive added to classification queue", Toast.LENGTH_SHORT).show()
                    }) {
                        Icon(
                            imageVector = Icons.Default.AddLocationAlt,
                            contentDescription = "Simulate Drive",
                            tint = Color(0xFF38BDF8)
                        )
                    }

                    // Export IRS CSV Report
                    IconButton(onClick = {
                        val allTripsList = viewModel.allTrips.value
                        if (allTripsList.isEmpty()) {
                            Toast.makeText(context, "No drives to export yet.", Toast.LENGTH_SHORT).show()
                        } else {
                            val shareIntent = CsvExportHelper.createShareIntent(context, allTripsList)
                            context.startActivity(android.content.Intent.createChooser(shareIntent, "Export IRS Mileage Log"))
                        }
                    }) {
                        Icon(
                            imageVector = Icons.Default.Share,
                            contentDescription = "Export Report",
                            tint = EmeraldGreen
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
                    unclassifiedCount = unclassifiedCount,
                    selectedTimeframe = selectedTimeframe,
                    onSelectTimeframe = { viewModel.setTimeframe(it) }
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

            // 4. Tinder-Style Swipeable Card Stack for Backlog Classification
            item {
                SwipeableTripCardStack(
                    unclassifiedTrips = unclassifiedTrips,
                    onClassify = { trip, classification ->
                        viewModel.classifyTrip(trip.id, classification)
                    },
                    canUndo = lastUndoAction != null,
                    onUndoLastClassification = {
                        viewModel.undoLastClassification()
                        Toast.makeText(context, "Reverted last classification", Toast.LENGTH_SHORT).show()
                    },
                    onViewDetails = { trip ->
                        selectedTripForDetails = trip
                    }
                )
            }

            // 5. Trip History Filter Header & Tabs
            item {
                Column(modifier = Modifier.padding(top = 8.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Drives History (${filteredTrips.size})",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Status Filter Chips
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        items(StatusFilter.values()) { filter ->
                            FilterChip(
                                selected = selectedStatus == filter,
                                onClick = { viewModel.setStatusFilter(filter) },
                                label = { Text(filter.label) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = EmeraldGreen,
                                    selectedLabelColor = Color.Black,
                                    containerColor = CardBackground,
                                    labelColor = SlateGray
                                )
                            )
                        }
                    }
                }
            }

            // 6. Trip History Cards
            if (filteredTrips.isEmpty()) {
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
                                text = "No drives found matching the selected filters.",
                                color = SlateGray,
                                fontSize = 14.sp
                            )
                        }
                    }
                }
            } else {
                items(filteredTrips, key = { it.id }) { trip ->
                    TripCard(
                        trip = trip,
                        onClassify = { classification ->
                            viewModel.classifyTrip(trip.id, classification)
                        },
                        onClick = {
                            selectedTripForDetails = trip
                        }
                    )
                }
            }

            item {
                Spacer(modifier = Modifier.height(32.dp))
            }
        }
    }

    // Modal Bottom Sheet for inspecting Route Map & full telemetry
    selectedTripForDetails?.let { trip ->
        TripDetailSheet(
            trip = trip,
            onDismiss = { selectedTripForDetails = null },
            onClassify = { classification ->
                viewModel.classifyTrip(trip.id, classification)
                selectedTripForDetails = trip.copy(classification = classification)
            },
            onDeleteTrip = {
                viewModel.deleteTrip(it)
                selectedTripForDetails = null
                Toast.makeText(context, "Trip deleted", Toast.LENGTH_SHORT).show()
            }
        )
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
                    text = "Grant exemption so Android doesn't kill trip tracking.",
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
    unclassifiedCount: Int,
    selectedTimeframe: TimeframeFilter,
    onSelectTimeframe: (TimeframeFilter) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = CardBackground),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "TAX SAVINGS (SCHEDULE C)",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = SlateGray,
                    letterSpacing = 1.sp
                )

                // Timeframe Selector Chips
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    TimeframeFilter.values().forEach { tf ->
                        val isSelected = selectedTimeframe == tf
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(if (isSelected) EmeraldGreen else Color(0xFF2E3856))
                                .clickable { onSelectTimeframe(tf) }
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = tf.label.replace("Time", "").trim(),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSelected) Color.Black else SlateGray
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))
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
                    Text(text = "Business Miles (${selectedTimeframe.label})", fontSize = 12.sp, color = SlateGray)
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
                        text = if (isRecording) "Stop" else "Manual Drive",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isRecording) Color.White else Color.Black
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
    onClassify: (TripClassification) -> Unit,
    onClick: () -> Unit
) {
    val dateFormat = remember { SimpleDateFormat("EEE, MMM d • h:mm a", Locale.getDefault()) }
    val dateString = remember(trip.startTimestamp) { dateFormat.format(Date(trip.startTimestamp)) }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
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
