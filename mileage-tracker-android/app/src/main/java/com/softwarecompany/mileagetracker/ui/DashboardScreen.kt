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
import com.softwarecompany.mileagetracker.data.local.entity.ExpenseEntity
import com.softwarecompany.mileagetracker.data.local.entity.TripClassification
import com.softwarecompany.mileagetracker.data.local.entity.TripEntity
import com.softwarecompany.mileagetracker.engine.EngineState
import com.softwarecompany.mileagetracker.engine.LiveDriveStats
import com.softwarecompany.mileagetracker.ui.components.*
import com.softwarecompany.mileagetracker.utils.CsvExportHelper
import com.softwarecompany.mileagetracker.utils.TaxCalculator
import java.text.SimpleDateFormat
import java.util.*

val DarkBackground = Color(0xFF0B132B)
val CardBackground = Color(0xFF1C2541)
val DeepNavy = Color(0xFF0F172A)
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
    val currentTab by viewModel.currentTab.collectAsState()
    val liveStats by viewModel.liveStats.collectAsState()
    val totalDeduction by viewModel.timeframeDeduction.collectAsState()
    val totalMiles by viewModel.timeframeMiles.collectAsState()
    val unclassifiedTrips by viewModel.unclassifiedTrips.collectAsState()
    val unclassifiedCount by viewModel.unclassifiedCount.collectAsState()
    val filteredTrips by viewModel.filteredTrips.collectAsState()
    val selectedTimeframe by viewModel.selectedTimeframe.collectAsState()
    val selectedStatus by viewModel.selectedStatus.collectAsState()
    val lastUndoAction by viewModel.lastUndoAction.collectAsState()

    val expenses by viewModel.allExpenses.collectAsState()
    val totalExpenses by viewModel.totalExpensesAmount.collectAsState()
    val grossEarnings by viewModel.grossEarnings.collectAsState()

    var selectedTripForDetails by remember { mutableStateOf<TripEntity?>(null) }
    var showAddExpenseDialog by remember { mutableStateOf(false) }
    var showSettingsDialog by remember { mutableStateOf(false) }
    var showOnboardingDialog by remember { mutableStateOf(false) }

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
                    // Seed mock drive button
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

                    // Seed mock expense button
                    IconButton(onClick = {
                        viewModel.seedSimulatedExpense()
                        Toast.makeText(context, "Sample 1099 expenses added", Toast.LENGTH_SHORT).show()
                    }) {
                        Icon(
                            imageVector = Icons.Default.PostAdd,
                            contentDescription = "Sample Expense",
                            tint = AmberWarning
                        )
                    }

                    // Settings & Vehicle Profile Button
                    IconButton(onClick = { showSettingsDialog = true }) {
                        Icon(
                            imageVector = Icons.Default.Settings,
                            contentDescription = "Settings",
                            tint = SlateGray
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = DarkBackground
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = DeepNavy,
                tonalElevation = 8.dp
            ) {
                NavigationBarItem(
                    selected = currentTab == AppDashboardTab.DRIVES,
                    onClick = { viewModel.setTab(AppDashboardTab.DRIVES) },
                    icon = {
                        BadgedBox(badge = {
                            if (unclassifiedCount > 0) {
                                Badge(containerColor = AmberWarning) {
                                    Text("$unclassifiedCount", color = Color.Black, fontWeight = FontWeight.Bold)
                                }
                            }
                        }) {
                            Icon(Icons.Default.DirectionsCar, contentDescription = "Drives")
                        }
                    },
                    label = { Text("Drives") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = EmeraldGreen,
                        selectedTextColor = EmeraldGreen,
                        unselectedIconColor = SlateGray,
                        unselectedTextColor = SlateGray,
                        indicatorColor = EmeraldGreen.copy(alpha = 0.15f)
                    )
                )

                NavigationBarItem(
                    selected = currentTab == AppDashboardTab.EXPENSES,
                    onClick = { viewModel.setTab(AppDashboardTab.EXPENSES) },
                    icon = {
                        Icon(Icons.Default.ReceiptLong, contentDescription = "Expenses")
                    },
                    label = { Text("Expenses") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = EmeraldGreen,
                        selectedTextColor = EmeraldGreen,
                        unselectedIconColor = SlateGray,
                        unselectedTextColor = SlateGray,
                        indicatorColor = EmeraldGreen.copy(alpha = 0.15f)
                    )
                )

                NavigationBarItem(
                    selected = currentTab == AppDashboardTab.TAX_INCOME,
                    onClick = { viewModel.setTab(AppDashboardTab.TAX_INCOME) },
                    icon = {
                        Icon(Icons.Default.Savings, contentDescription = "Tax Shield")
                    },
                    label = { Text("Tax Shield") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = EmeraldGreen,
                        selectedTextColor = EmeraldGreen,
                        unselectedIconColor = SlateGray,
                        unselectedTextColor = SlateGray,
                        indicatorColor = EmeraldGreen.copy(alpha = 0.15f)
                    )
                )
            }
        },
        floatingActionButton = {
            if (currentTab == AppDashboardTab.EXPENSES) {
                ExtendedFloatingActionButton(
                    onClick = { showAddExpenseDialog = true },
                    containerColor = EmeraldGreen,
                    contentColor = Color.Black,
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Icon(imageVector = Icons.Default.Add, contentDescription = "Add")
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Log Expense", fontWeight = FontWeight.Bold)
                }
            }
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
            // Battery Optimization Warning Banner
            if (!isIgnoringBattery) {
                item {
                    BatteryWarningBanner(onRequestDisable = onRequestDisableBatteryOptimization)
                }
            }

            when (currentTab) {
                AppDashboardTab.DRIVES -> {
                    // 1. Real-Time ROI Tax Savings Summary Card
                    item {
                        RoiSummaryCard(
                            totalDeductions = totalDeduction,
                            totalMiles = totalMiles,
                            unclassifiedCount = unclassifiedCount,
                            selectedTimeframe = selectedTimeframe,
                            onSelectTimeframe = { viewModel.setTimeframe(it) }
                        )
                    }

                    // 2. Live Drive Recording Banner (Dynamic State)
                    item {
                        LiveDriveBanner(
                            stats = liveStats,
                            onStartDrive = { viewModel.startManualDrive() },
                            onStopDrive = { viewModel.stopManualDrive() }
                        )
                    }

                    // 3. Tinder-Style Swipeable Card Stack
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

                    // 4. Trip History Header & Filters
                    item {
                        Column(modifier = Modifier.padding(top = 8.dp)) {
                            Text(
                                text = "Drives History (${filteredTrips.size})",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )

                            Spacer(modifier = Modifier.height(10.dp))

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

                    // 5. Trip History List
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
                }

                AppDashboardTab.EXPENSES -> {
                    // Total Expenses Summary Card
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = CardBackground),
                            shape = RoundedCornerShape(16.dp)
                        ) {
                            Column(modifier = Modifier.padding(20.dp)) {
                                Text(
                                    text = "1099 DEDUCTIBLE EXPENSES",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = SlateGray,
                                    letterSpacing = 1.sp
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = TaxCalculator.formatCurrency(totalExpenses),
                                    fontSize = 36.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = EmeraldGreen
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = "${expenses.size} receipts & out-of-pocket expenses logged",
                                    fontSize = 13.sp,
                                    color = SlateGray
                                )
                            }
                        }
                    }

                    // Expenses List Header
                    item {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "All Logged Expenses",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            TextButton(onClick = { showAddExpenseDialog = true }) {
                                Icon(Icons.Default.Add, contentDescription = null, tint = EmeraldGreen)
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Add", color = EmeraldGreen, fontWeight = FontWeight.Bold)
                            }
                        }
                    }

                    if (expenses.isEmpty()) {
                        item {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(containerColor = CardBackground),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(32.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                        Icon(
                                            imageVector = Icons.Default.ReceiptLong,
                                            contentDescription = null,
                                            tint = SlateGray,
                                            modifier = Modifier.size(40.dp)
                                        )
                                        Spacer(modifier = Modifier.height(8.dp))
                                        Text(
                                            text = "No expenses logged yet.\nTap 'Log Expense' to write off gas, tolls, or car maintenance.",
                                            color = SlateGray,
                                            fontSize = 13.sp,
                                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                                        )
                                    }
                                }
                            }
                        }
                    } else {
                        items(expenses, key = { it.id }) { expense ->
                            ExpenseListCard(
                                expense = expense,
                                onDelete = { viewModel.deleteExpense(it) }
                            )
                        }
                    }
                }

                AppDashboardTab.TAX_INCOME -> {
                    // True Net & 1099 Reconciliation Card
                    item {
                        TrueNetIncomeCard(
                            totalMileageDeductions = totalDeduction,
                            totalExpenses = totalExpenses,
                            grossEarnings = grossEarnings,
                            onGrossEarningsChanged = { viewModel.setGrossEarnings(it) }
                        )
                    }

                    // IRS Schedule C Audit Ready Card
                    item {
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
                                    Column {
                                        Text(
                                            text = "IRS SCHEDULE C SUMMARY",
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = SlateGray,
                                            letterSpacing = 1.sp
                                        )
                                        Text(
                                            text = "Audit-Ready Mileage & Receipts",
                                            fontSize = 16.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = LightText
                                        )
                                    }
                                    Icon(
                                        imageVector = Icons.Default.FactCheck,
                                        contentDescription = "Audit",
                                        tint = EmeraldGreen,
                                        modifier = Modifier.size(28.dp)
                                    )
                                }

                                Spacer(modifier = Modifier.height(14.dp))
                                Divider(color = Color(0xFF2E3856), thickness = 1.dp)
                                Spacer(modifier = Modifier.height(14.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text("Standard Mileage Write-off:", color = SlateGray, fontSize = 13.sp)
                                    Text(TaxCalculator.formatCurrency(totalDeduction), color = LightText, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                }
                                Spacer(modifier = Modifier.height(8.dp))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text("Non-Mileage Operating Expenses:", color = SlateGray, fontSize = 13.sp)
                                    Text(TaxCalculator.formatCurrency(totalExpenses), color = LightText, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                }
                                Spacer(modifier = Modifier.height(8.dp))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text("Combined Tax Write-Off:", color = EmeraldGreen, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                    Text(TaxCalculator.formatCurrency(totalDeduction + totalExpenses), color = EmeraldGreen, fontWeight = FontWeight.ExtraBold, fontSize = 16.sp)
                                }

                                Spacer(modifier = Modifier.height(16.dp))

                                Button(
                                    onClick = {
                                        val allTripsList = viewModel.allTrips.value
                                        if (allTripsList.isEmpty()) {
                                            Toast.makeText(context, "No drives to export yet.", Toast.LENGTH_SHORT).show()
                                        } else {
                                            val shareIntent = CsvExportHelper.createShareIntent(context, allTripsList)
                                            context.startActivity(android.content.Intent.createChooser(shareIntent, "Export IRS Report"))
                                        }
                                    },
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldGreen),
                                    shape = RoundedCornerShape(10.dp)
                                ) {
                                    Icon(Icons.Default.Download, contentDescription = null, tint = Color.Black)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Export Complete IRS Report (CSV)", color = Color.Black, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
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

    // Add Expense Dialog
    if (showAddExpenseDialog) {
        AddExpenseDialog(
            onDismiss = { showAddExpenseDialog = false },
            onSaveExpense = { newExpense ->
                viewModel.saveExpense(newExpense)
                Toast.makeText(context, "Expense saved", Toast.LENGTH_SHORT).show()
            }
        )
    }

    // Driver & Vehicle Settings Dialog
    if (showSettingsDialog) {
        SettingsDialog(
            onDismiss = { showSettingsDialog = false },
            onShowOnboarding = { showOnboardingDialog = true }
        )
    }

    // Driver Onboarding Guide Dialog
    if (showOnboardingDialog) {
        OnboardingDialog(
            onDismiss = { showOnboardingDialog = false }
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
