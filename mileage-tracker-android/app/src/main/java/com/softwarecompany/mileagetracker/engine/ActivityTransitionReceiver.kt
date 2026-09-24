package com.softwarecompany.mileagetracker.engine

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.google.android.gms.location.ActivityTransitionResult
import com.google.android.gms.location.DetectedActivity
import com.softwarecompany.mileagetracker.MileageTrackerApp
import com.softwarecompany.mileagetracker.data.local.entity.TripClassification
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class ActivityTransitionReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent?) {
        if (intent == null) return

        // 1. Check for Quick Action Classification from Notification
        if (intent.action == "com.softwarecompany.mileagetracker.ACTION_QUICK_CLASSIFY") {
            val tripId = intent.getStringExtra("EXTRA_TRIP_ID") ?: return
            val classificationStr = intent.getStringExtra("EXTRA_CLASSIFICATION") ?: return

            val classification = if (classificationStr == "BUSINESS") {
                TripClassification.BUSINESS
            } else {
                TripClassification.PERSONAL
            }

            // Dismiss notification
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as android.app.NotificationManager
            notificationManager.cancel(tripId.hashCode())

            // Update in Room DB asynchronously
            CoroutineScope(Dispatchers.IO).launch {
                val db = (context.applicationContext as MileageTrackerApp).database
                db.tripDao().updateClassification(tripId, classification)
            }
            return
        }

        // 2. Check for Google Play Services Activity Transitions
        if (ActivityTransitionResult.hasResult(intent)) {
            val result = ActivityTransitionResult.extractResult(intent) ?: return

            for (event in result.transitionEvents) {
                when (event.activityType) {
                    DetectedActivity.IN_VEHICLE -> {
                        if (event.transitionType == com.google.android.gms.location.ActivityTransition.ACTIVITY_TRANSITION_ENTER) {
                            // User entered vehicle: promote service to active recording
                            LocationTrackingService.startRecording(context, "AUTO_VEHICLE_MOTION")
                        } else if (event.transitionType == com.google.android.gms.location.ActivityTransition.ACTIVITY_TRANSITION_EXIT) {
                            // Vehicle exit detected: trigger dwelling cooldown
                            LocationTrackingService.onVehicleStopped(context)
                        }
                    }
                    DetectedActivity.STILL, DetectedActivity.WALKING -> {
                        if (event.transitionType == com.google.android.gms.location.ActivityTransition.ACTIVITY_TRANSITION_ENTER) {
                            // User parked or walked away: trigger dwelling cooldown
                            LocationTrackingService.onVehicleStopped(context)
                        }
                    }
                }
            }
        }
    }
}
