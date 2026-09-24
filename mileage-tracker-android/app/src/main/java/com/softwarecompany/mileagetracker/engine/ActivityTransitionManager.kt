package com.softwarecompany.mileagetracker.engine

import android.annotation.SuppressLint
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import com.google.android.gms.location.ActivityRecognition
import com.google.android.gms.location.ActivityTransition
import com.google.android.gms.location.ActivityTransitionRequest
import com.google.android.gms.location.DetectedActivity
import kotlinx.coroutines.tasks.await

class ActivityTransitionManager(private val context: Context) {

    private val activityRecognitionClient = ActivityRecognition.getClient(context)

    private fun getPendingIntent(): PendingIntent {
        val intent = Intent(context, ActivityTransitionReceiver::class.java).apply {
            action = "com.softwarecompany.mileagetracker.ACTION_ACTIVITY_TRANSITION"
        }
        val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }
        return PendingIntent.getBroadcast(context, 2001, intent, flags)
    }

    /**
     * Registers low-power transitions for IN_VEHICLE, STILL, and WALKING events.
     * Uses hardware sensor hub to consume virtually 0% battery while waiting for drives.
     */
    @SuppressLint("MissingPermission")
    suspend fun registerTransitions(): Boolean {
        val transitions = mutableListOf<ActivityTransition>()

        // 1. Vehicle Entered (User starts driving)
        transitions.add(
            ActivityTransition.Builder()
                .setActivityType(DetectedActivity.IN_VEHICLE)
                .setActivityTransition(ActivityTransition.ACTIVITY_TRANSITION_ENTER)
                .build()
        )

        // 2. Vehicle Exited (User parked or stepped out)
        transitions.add(
            ActivityTransition.Builder()
                .setActivityType(DetectedActivity.IN_VEHICLE)
                .setActivityTransition(ActivityTransition.ACTIVITY_TRANSITION_EXIT)
                .build()
        )

        // 3. Still (Vehicle stopped at delivery stop or destination)
        transitions.add(
            ActivityTransition.Builder()
                .setActivityType(DetectedActivity.STILL)
                .setActivityTransition(ActivityTransition.ACTIVITY_TRANSITION_ENTER)
                .build()
        )

        // 4. Walking (Driver exited car to drop off order or deliver package)
        transitions.add(
            ActivityTransition.Builder()
                .setActivityType(DetectedActivity.WALKING)
                .setActivityTransition(ActivityTransition.ACTIVITY_TRANSITION_ENTER)
                .build()
        )

        val request = ActivityTransitionRequest(transitions)

        return try {
            activityRecognitionClient.requestActivityTransitionUpdates(request, getPendingIntent()).await()
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    @SuppressLint("MissingPermission")
    suspend fun unregisterTransitions(): Boolean {
        return try {
            activityRecognitionClient.removeActivityTransitionUpdates(getPendingIntent()).await()
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }
}
