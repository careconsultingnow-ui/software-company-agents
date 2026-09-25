package com.softwarecompany.mileagetracker.ui.components

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties

private val DeepNavyBg = Color(0xFF0F172A)
private val CardBg = Color(0xFF1C2541)
private val EmeraldGreen = Color(0xFF10B981)
private val SlateGray = Color(0xFF94A3B8)
private val LightText = Color(0xFFF8FAFC)

data class OnboardingStep(
    val title: String,
    val description: String,
    val icon: ImageVector,
    val badge: String
)

@Composable
fun OnboardingDialog(
    onDismiss: () -> Unit
) {
    val steps = remember {
        listOf(
            OnboardingStep(
                title = "Zero-Drain Auto Tracking",
                description = "Our 3-tier motion co-processor automatically starts recording only when you drive and sleeps when parked. Zero GPS battery drain.",
                icon = Icons.Default.DirectionsCar,
                badge = "Hardware Motion Co-Processor"
            ),
            OnboardingStep(
                title = "Tinder-Fast Classification",
                description = "Swipe right to claim your $0.67/mile IRS business deduction. Swipe left for personal trips. Clear an entire week's drives in under 30 seconds.",
                icon = Icons.Default.Swipe,
                badge = "One-Handed Workflow"
            ),
            OnboardingStep(
                title = "IRS Schedule C Shield",
                description = "Log gas, tolls, and maintenance alongside mileage. Compare your gross payouts to see your True Net take-home pay and export audit-ready CSV reports.",
                icon = Icons.Default.Shield,
                badge = "Audit-Ready Tax Write-Offs"
            )
        )
    }

    var currentStepIndex by remember { mutableStateOf(0) }
    val step = steps[currentStepIndex]

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.92f)
                .wrapContentHeight(),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = CardBg)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Header Badge
                Surface(
                    color = EmeraldGreen.copy(alpha = 0.15f),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = step.badge.uppercase(),
                        color = EmeraldGreen,
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp,
                        letterSpacing = 1.sp,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Animated Center Icon
                AnimatedContent(
                    targetState = step.icon,
                    transitionSpec = { fadeIn() togetherWith fadeOut() },
                    label = "iconTransition"
                ) { targetIcon ->
                    Box(
                        modifier = Modifier
                            .size(80.dp)
                            .clip(CircleShape)
                            .background(
                                Brush.linearGradient(
                                    listOf(Color(0xFF2563EB), Color(0xFF10B981))
                                )
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = targetIcon,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(42.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Title & Description
                AnimatedContent(
                    targetState = step,
                    transitionSpec = { fadeIn() togetherWith fadeOut() },
                    label = "textTransition"
                ) { targetStep ->
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = targetStep.title,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = LightText,
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = targetStep.description,
                            fontSize = 13.sp,
                            color = SlateGray,
                            textAlign = TextAlign.Center,
                            lineHeight = 18.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Progress Dots
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    steps.indices.forEach { i ->
                        Box(
                            modifier = Modifier
                                .height(6.dp)
                                .width(if (i == currentStepIndex) 20.dp else 6.dp)
                                .clip(RoundedCornerShape(3.dp))
                                .background(if (i == currentStepIndex) EmeraldGreen else Color(0xFF2E3856))
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    if (currentStepIndex > 0) {
                        OutlinedButton(
                            onClick = { currentStepIndex-- },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = SlateGray)
                        ) {
                            Text("Back")
                        }
                    }

                    Button(
                        onClick = {
                            if (currentStepIndex < steps.size - 1) {
                                currentStepIndex++
                            } else {
                                onDismiss()
                            }
                        },
                        modifier = Modifier.weight(if (currentStepIndex > 0) 1.5f else 1f),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldGreen)
                    ) {
                        Text(
                            text = if (currentStepIndex < steps.size - 1) "Next" else "Start Tracking",
                            fontWeight = FontWeight.Bold,
                            color = Color.Black
                        )
                    }
                }
            }
        }
    }
}
