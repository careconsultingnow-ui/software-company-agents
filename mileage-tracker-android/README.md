# Automated Mileage & Expense Logger (Android MVP)

A high-accuracy, battery-optimized Android utility app designed for rideshare drivers, delivery couriers, and 1099 contractors. It automatically captures driving routes via hardware activity recognition and GPS geofencing, calculates real-time IRS Schedule C tax deductions, and facilitates instant one-tap trip classification.

---

## 🏗️ Architecture Overview

The codebase is organized into clean, decoupled layers following modern Android Jetpack & MVI/MVVM architecture:

```
mileage-tracker-android/
├── app/src/main/
│   ├── AndroidManifest.xml              # Android 14+ Foreground Service (location) & permissions
│   ├── java/com/softwarecompany/mileagetracker/
│   │   ├── MileageTrackerApp.kt         # Application instance & notification channel lifecycle
│   │   ├── data/
│   │   │   ├── local/
│   │   │   │   ├── AppDatabase.kt       # Room SQLite DB instance
│   │   │   │   ├── dao/                 # TripDao & ExpenseDao
│   │   │   │   └── entity/              # TripEntity, WaypointEntity, ExpenseEntity
│   │   │   └── repository/              # TripRepository (offline-first data layer)
│   │   ├── engine/                      # Core Background Tracking Engine
│   │   │   ├── TrackingEngineState.kt   # EngineState & LiveDriveStats models
│   │   │   ├── LocationTrackingService.kt # Sticky Foreground Service with GPS & Dwelling logic
│   │   │   ├── ActivityTransitionManager.kt # Low-power Google Play Services Activity Recognition
│   │   │   ├── ActivityTransitionReceiver.kt # BroadcastReceiver for motion & notification actions
│   │   │   ├── BootReceiver.kt          # Restores tracking upon device reboot
│   │   │   └── LocationFilter.kt        # Jitter/noise filter to eliminate stationary GPS drift
│   │   ├── utils/
│   │   │   ├── BatteryOptimizationHelper.kt # OEM-specific battery bypass handler
│   │   │   ├── TaxCalculator.kt         # IRS mileage calculations ($0.67/mile)
│   │   │   └── NotificationHelper.kt    # Ongoing tracking banner & actionable classification alerts
│   │   └── ui/                          # Jetpack Compose UI
│   │       ├── MainActivity.kt          # Runtime permissions orchestration & navigation
│   │       ├── DashboardViewModel.kt    # StateFlow bridge between engine and UI
│   │       └── DashboardScreen.kt       # Material 3 Dark theme dashboard & ROI counters
```

---

## ⚡ Key Technical Capabilities in Sprint 1

1. **Battery-Optimized 3-Tier State Machine:**
   - **IDLE_STANDBY:** Zero GPS polling. Hardware co-processor listens for `IN_VEHICLE` motion transitions.
   - **RECORDING_DRIVE:** `FusedLocationProviderClient` with distance-displacement triggers (15m threshold).
   - **DWELLING_COOLDOWN:** Stops GPS when vehicle parks or walking is detected; automatically finalizes the drive after 4 minutes of dwelling and triggers a classification notification.
2. **Android 14+ Compliant:**
   - Registered `foregroundServiceType="location"`.
   - Low-importance ongoing notification channel (silent, unobtrusive).
3. **Red-Light & Jitter Noise Filtering:**
   - Rejects GPS fixes with accuracy > 25m.
   - Prevents artificial distance inflation when stationary at red lights or in drive-thrus.
4. **Resilience to OEM Process Killers:**
   - Detects aggressive OEMs (Samsung, Xiaomi, OnePlus) and prompts users to whitelist the app from Android battery restrictions.
   - Listens to `BOOT_COMPLETED` to resume tracking automatically after device restarts.
5. **Real-Time ROI Counter:**
   - Displays accrued Schedule C tax deduction directly on the dashboard in real-time.
