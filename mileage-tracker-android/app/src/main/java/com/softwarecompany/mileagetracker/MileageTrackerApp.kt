package com.softwarecompany.mileagetracker

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import com.softwarecompany.mileagetracker.data.local.AppDatabase

class MileageTrackerApp : Application() {

    val database: AppDatabase by lazy {
        AppDatabase.getDatabase(this)
    }

    override fun onCreate() {
        super.onCreate()
        instance = this
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            // Low-priority, silent channel for ongoing foreground tracking (No annoying sound/vibration)
            val trackingChannel = NotificationChannel(
                CHANNEL_TRACKING_ID,
                getString(R.string.channel_tracking_name),
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = getString(R.string.channel_tracking_description)
                setShowBadge(false)
            }

            // High-priority channel for trip completion & classification reminders
            val tripsChannel = NotificationChannel(
                CHANNEL_TRIPS_ID,
                getString(R.string.channel_trips_name),
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = getString(R.string.channel_trips_description)
                enableVibration(true)
                setShowBadge(true)
            }

            notificationManager.createNotificationChannel(trackingChannel)
            notificationManager.createNotificationChannel(tripsChannel)
        }
    }

    companion object {
        const val CHANNEL_TRACKING_ID = "tracking_service_channel"
        const val CHANNEL_TRIPS_ID = "trip_classification_channel"

        lateinit var instance: MileageTrackerApp
            private set
    }
}
