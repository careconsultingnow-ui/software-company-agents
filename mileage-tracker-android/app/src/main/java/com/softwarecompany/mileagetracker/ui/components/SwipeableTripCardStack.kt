package com.softwarecompany.mileagetracker.ui.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.softwarecompany.mileagetracker.data.local.entity.TripClassification
import com.softwarecompany.mileagetracker.data.local.entity.TripEntity
import com.softwarecompany.mileagetracker.utils.TaxCalculator
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*
import kotlin.math.roundToInt

private val EmeraldGreen = Color(0xFF10B981)
private val CrimsonRed = Color(0xFFEF4444)
private val DarkCardBg = Color(0xFF1C2541)
private val DeepNavyBg = Color(0xFF0F172A)
private val SlateGray = Color(0xFF94A3B8)
private val LightText = Color(0xFFF8FAFC)

/**
 * Tinder-Style Swipeable Card Stack for rapid one-handed backlog classification.
 */
@Composable
fun SwipeableTripCardStack(
    unclassifiedTrips: List<TripEntity>,
    onClassify: (trip: TripEntity, classification: TripClassification) -> Unit,
    onUndoLastClassification: (() -> Unit)? = null,
    canUndo: Boolean = false,
    onViewDetails: (TripEntity) -> Unit,
    modifier: Modifier = Modifier
) {
    if (unclassifiedTrips.isEmpty()) {
        Card(
            modifier = modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            colors = CardDefaults.cardColors(containerColor = DarkCardBg),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(32.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Icon(
                    imageVector = Icons.Default.CheckCircle,
                    contentDescription = "All Caught Up",
                    tint = EmeraldGreen,
                    modifier = Modifier.size(48.dp)
                )
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = "All Drives Classified!",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = LightText
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Great job! All your recorded drives are accounted for Schedule C tax deductions.",
                    fontSize = 13.sp,
                    color = SlateGray,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )
            }
        }
        return
    }

    val coroutineScope = rememberCoroutineScope()
    val topTrip = unclassifiedTrips.first()
    val nextTrip = unclassifiedTrips.getOrNull(1)

    val offsetX = remember(topTrip.id) { Animatable(0f) }
    val offsetY = remember(topTrip.id) { Animatable(0f) }

    val swipeThreshold = 240f

    Column(
        modifier = modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Section Header with Counter
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = "Quick Swipe Classification",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = LightText
                )
                Spacer(modifier = Modifier.width(8.dp))
                Surface(
                    color = Color(0xFFF59E0B).copy(alpha = 0.2f),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = "${unclassifiedTrips.size} Pending",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFF59E0B),
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                    )
                }
            }
            Text(
                text = "Swipe or Tap",
                fontSize = 12.sp,
                color = SlateGray
            )
        }

        // Swipeable Stack Container
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(290.dp),
            contentAlignment = Alignment.Center
        ) {
            // Background Card Preview (Depth illusion)
            if (nextTrip != null) {
                SwipeCardContent(
                    trip = nextTrip,
                    modifier = Modifier
                        .scale(0.93f)
                        .offset(y = 16.dp)
                        .alpha(0.6f)
                )
            }

            // Top Interactive Swipeable Card
            SwipeCardContent(
                trip = topTrip,
                modifier = Modifier
                    .offset { IntOffset(offsetX.value.roundToInt(), offsetY.value.roundToInt()) }
                    .rotate((offsetX.value / 25f).coerceIn(-20f, 20f))
                    .pointerInput(topTrip.id) {
                        detectDragGestures(
                            onDragEnd = {
                                coroutineScope.launch {
                                    if (offsetX.value > swipeThreshold) {
                                        // Swipe Right -> Business
                                        offsetX.animateTo(
                                            targetValue = 1200f,
                                            animationSpec = spring(stiffness = Spring.StiffnessMedium)
                                        )
                                        onClassify(topTrip, TripClassification.BUSINESS)
                                    } else if (offsetX.value < -swipeThreshold) {
                                        // Swipe Left -> Personal
                                        offsetX.animateTo(
                                            targetValue = -1200f,
                                            animationSpec = spring(stiffness = Spring.StiffnessMedium)
                                        )
                                        onClassify(topTrip, TripClassification.PERSONAL)
                                    } else {
                                        // Snap Back
                                        launch { offsetX.animateTo(0f, spring(dampingRatio = 0.7f)) }
                                        launch { offsetY.animateTo(0f, spring(dampingRatio = 0.7f)) }
                                    }
                                }
                            },
                            onDrag = { change, dragAmount ->
                                change.consume()
                                coroutineScope.launch {
                                    offsetX.snapTo(offsetX.value + dragAmount.x)
                                    offsetY.snapTo(offsetY.value + dragAmount.y * 0.4f)
                                }
                            }
                        )
                    },
                swipeProgress = offsetX.value / swipeThreshold,
                onCardClick = { onViewDetails(topTrip) }
            )
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Action Buttons Row: Quick one-tap controls
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Personal Button (Swipe Left Action)
            FilledIconButton(
                onClick = {
                    coroutineScope.launch {
                        offsetX.animateTo(-1200f, spring(stiffness = Spring.StiffnessMedium))
                        onClassify(topTrip, TripClassification.PERSONAL)
                    }
                },
                modifier = Modifier.size(52.dp),
                colors = IconButtonDefaults.filledIconButtonColors(
                    containerColor = CrimsonRed.copy(alpha = 0.18f),
                    contentColor = CrimsonRed
                )
            ) {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = "Personal (Swipe Left)",
                    modifier = Modifier.size(26.dp)
                )
            }

            // Undo Button (Revert previous action)
            OutlinedButton(
                onClick = { onUndoLastClassification?.invoke() },
                enabled = canUndo,
                shape = RoundedCornerShape(20.dp),
                border = BorderStroke(
                    1.dp,
                    if (canUndo) SlateGray.copy(alpha = 0.5f) else Color.Transparent
                ),
                colors = ButtonDefaults.outlinedButtonColors(
                    containerColor = if (canUndo) DeepNavyBg else Color.Transparent,
                    contentColor = if (canUndo) LightText else SlateGray.copy(alpha = 0.3f)
                ),
                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Undo,
                    contentDescription = "Undo",
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text("Undo", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            }

            // Business Button (Swipe Right Action)
            FilledIconButton(
                onClick = {
                    coroutineScope.launch {
                        offsetX.animateTo(1200f, spring(stiffness = Spring.StiffnessMedium))
                        onClassify(topTrip, TripClassification.BUSINESS)
                    }
                },
                modifier = Modifier.size(52.dp),
                colors = IconButtonDefaults.filledIconButtonColors(
                    containerColor = EmeraldGreen.copy(alpha = 0.22f),
                    contentColor = EmeraldGreen
                )
            ) {
                Icon(
                    imageVector = Icons.Default.Check,
                    contentDescription = "Business (Swipe Right)",
                    modifier = Modifier.size(26.dp)
                )
            }
        }
    }
}

@Composable
private fun SwipeCardContent(
    trip: TripEntity,
    modifier: Modifier = Modifier,
    swipeProgress: Float = 0f,
    onCardClick: (() -> Unit)? = null
) {
    val dateFormat = remember { SimpleDateFormat("EEE, MMM d • h:mm a", Locale.getDefault()) }
    val dateString = remember(trip.startTimestamp) { dateFormat.format(Date(trip.startTimestamp)) }
    val durationMins = remember(trip.startTimestamp, trip.endTimestamp) {
        ((trip.endTimestamp - trip.startTimestamp) / 60000).coerceAtLeast(1)
    }

    Card(
        modifier = modifier
            .fillMaxWidth()
            .height(260.dp),
        colors = CardDefaults.cardColors(containerColor = DarkCardBg),
        shape = RoundedCornerShape(20.dp),
        border = BorderStroke(1.dp, Color(0xFF2E3856)),
        onClick = { onCardClick?.invoke() }
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(20.dp),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                // Top Info Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = dateString,
                            fontSize = 13.sp,
                            color = SlateGray,
                            fontWeight = FontWeight.Medium
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "Auto-Logged Drive ($durationMins mins)",
                            fontSize = 11.sp,
                            color = Color(0xFF38BDF8)
                        )
                    }

                    // Schedule C Tax Tag
                    Surface(
                        color = EmeraldGreen.copy(alpha = 0.15f),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = "+${TaxCalculator.formatCurrency(trip.deductionAmount)}",
                            color = EmeraldGreen,
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 15.sp,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                        )
                    }
                }

                // Center Highlight: Distance & Icon
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(54.dp)
                            .clip(CircleShape)
                            .background(
                                Brush.linearGradient(
                                    listOf(Color(0xFF2563EB), Color(0xFF0284C7))
                                )
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.DirectionsCar,
                            contentDescription = "Car Drive",
                            tint = Color.White,
                            modifier = Modifier.size(28.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(16.dp))
                    Column {
                        Text(
                            text = TaxCalculator.formatMiles(trip.distanceMiles),
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Black,
                            color = LightText
                        )
                        Text(
                            text = "Standard IRS Rate @ $0.67/mi",
                            fontSize = 12.sp,
                            color = SlateGray
                        )
                    }
                }

                // Bottom Visual Clue
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Left",
                            tint = CrimsonRed,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Personal", fontSize = 11.sp, color = CrimsonRed, fontWeight = FontWeight.Bold)
                    }

                    Text(
                        text = "Tap for Route Map",
                        fontSize = 11.sp,
                        color = SlateGray
                    )

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("Business", fontSize = 11.sp, color = EmeraldGreen, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(
                            imageVector = Icons.Default.ArrowForward,
                            contentDescription = "Right",
                            tint = EmeraldGreen,
                            modifier = Modifier.size(14.dp)
                        )
                    }
                }
            }

            // Swipe Stamp Overlays
            if (swipeProgress > 0.1f) {
                // BUSINESS STAMP (Swiping Right)
                val alpha = (swipeProgress * 1.5f).coerceIn(0f, 1f)
                Box(
                    modifier = Modifier
                        .padding(24.dp)
                        .align(Alignment.TopStart)
                        .rotate(-15f)
                        .alpha(alpha)
                        .border(3.dp, EmeraldGreen, RoundedCornerShape(8.dp))
                        .padding(horizontal = 14.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = "BUSINESS ($)",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black,
                        color = EmeraldGreen
                    )
                }
            } else if (swipeProgress < -0.1f) {
                // PERSONAL STAMP (Swiping Left)
                val alpha = (-swipeProgress * 1.5f).coerceIn(0f, 1f)
                Box(
                    modifier = Modifier
                        .padding(24.dp)
                        .align(Alignment.TopEnd)
                        .rotate(15f)
                        .alpha(alpha)
                        .border(3.dp, CrimsonRed, RoundedCornerShape(8.dp))
                        .padding(horizontal = 14.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = "PERSONAL",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black,
                        color = CrimsonRed
                    )
                }
            }
        }
    }
}
