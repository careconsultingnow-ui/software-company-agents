package com.softwarecompany.mileagetracker.engine

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent?) {
        val action = intent?.action ?: return
        if (action == Intent.ACTION_BOOT_COMPLETED || action == "android.intent.action.QUICKBOOT_POWERON") {
            // Re-register low-power activity transitions
            CoroutineScope(Dispatchers.IO).launch {
                val transitionManager = ActivityTransitionManager(context)
                transitionManager.registerTransitions()
            }

            // Start foreground standby service to maintain high process priority
            val serviceIntent = Intent(context, LocationTrackingService::class.java).apply {
                this.action = LocationTrackingService.ACTION_START_STANDBY
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }
        }
    }
}
