package com.softwarecompany.mileagetracker.utils

import android.app.Notification
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.softwarecompany.mileagetracker.MileageTrackerApp
import com.softwarecompany.mileagetracker.R
import com.softwarecompany.mileagetracker.engine.ActivityTransitionReceiver
import com.softwarecompany.mileagetracker.engine.LiveDriveStats
import com.softwarecompany.mileagetracker.ui.MainActivity

object NotificationHelper {

    private const val TRACKING_NOTIFICATION_ID = 1001

    /**
     * Builds the persistent, non-intrusive notification required for the Android 14 Foreground Service.
     */
    fun buildForegroundNotification(context: Context, stats: LiveDriveStats): Notification {
        val launchIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntentFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }
        val contentPendingIntent = PendingIntent.getActivity(context, 0, launchIntent, pendingIntentFlags)

        val contentText = if (stats.distanceMiles > 0.05) {
            "Active drive: ${TaxCalculator.formatMiles(stats.distanceMiles)} • ${TaxCalculator.formatCurrency(stats.deductionAmount)} tax savings"
        } else {
            context.getString(R.string.tracking_status_idle)
        }

        return NotificationCompat.Builder(context, MileageTrackerApp.CHANNEL_TRACKING_ID)
            .setContentTitle(context.getString(R.string.app_name))
            .setContentText(contentText)
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setContentIntent(contentPendingIntent)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }

    /**
     * Sends an actionable notification when a drive finishes, allowing instant 1-tap classification.
     */
    fun showTripCompletedNotification(
        context: Context,
        tripId: String,
        distanceMiles: Double,
        deductionAmount: Double
    ) {
        val launchIntent = Intent(context, MainActivity::class.java).apply {
            putExtra("EXTRA_CLASSIFY_TRIP_ID", tripId)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }

        val pendingFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }

        val contentPendingIntent = PendingIntent.getActivity(
            context,
            tripId.hashCode(),
            launchIntent,
            pendingFlags
        )

        // Quick action: Classify as Business
        val businessIntent = Intent(context, ActivityTransitionReceiver::class.java).apply {
            action = "com.softwarecompany.mileagetracker.ACTION_QUICK_CLASSIFY"
            putExtra("EXTRA_TRIP_ID", tripId)
            putExtra("EXTRA_CLASSIFICATION", "BUSINESS")
        }
        val businessPendingIntent = PendingIntent.getBroadcast(
            context,
            tripId.hashCode() + 1,
            businessIntent,
            pendingFlags
        )

        // Quick action: Classify as Personal
        val personalIntent = Intent(context, ActivityTransitionReceiver::class.java).apply {
            action = "com.softwarecompany.mileagetracker.ACTION_QUICK_CLASSIFY"
            putExtra("EXTRA_TRIP_ID", tripId)
            putExtra("EXTRA_CLASSIFICATION", "PERSONAL")
        }
        val personalPendingIntent = PendingIntent.getBroadcast(
            context,
            tripId.hashCode() + 2,
            personalIntent,
            pendingFlags
        )

        val notification = NotificationCompat.Builder(context, MileageTrackerApp.CHANNEL_TRIPS_ID)
            .setContentTitle("Drive Completed: ${TaxCalculator.formatMiles(distanceMiles)}")
            .setContentText("Potential tax deduction: ${TaxCalculator.formatCurrency(deductionAmount)}. Tap to classify.")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentIntent(contentPendingIntent)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .addAction(
                android.R.drawable.checkbox_on_background,
                "Business ($)",
                businessPendingIntent
            )
            .addAction(
                android.R.drawable.ic_delete,
                "Personal",
                personalPendingIntent
            )
            .build()

        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as android.app.NotificationManager
        manager.notify(tripId.hashCode(), notification)
    }
}
