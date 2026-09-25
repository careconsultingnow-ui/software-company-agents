# Automated Mileage & Expense Logger (Android App)

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
│   │   │   ├── NotificationHelper.kt    # Ongoing tracking banner & actionable classification alerts
│   │   │   └── CsvExportHelper.kt       # IRS Schedule C CSV export & Android share sheet integration
│   │   └── ui/                          # Jetpack Compose UI
│   │       ├── MainActivity.kt          # Runtime permissions orchestration & navigation
│   │       ├── DashboardViewModel.kt    # StateFlow bridge between engine, filters, and UI
│   │       ├── DashboardScreen.kt       # Material 3 Dark theme dashboard & ROI counters
│   │       └── components/
│   │           ├── SwipeableTripCardStack.kt # Tinder-style card deck for backlog classification
│   │           ├── RouteMapCanvas.kt    # Native Canvas GPS telemetry & polyline visualizer
│   │           └── TripDetailSheet.kt   # Modal bottom sheet for route & audit log inspection
```

---

## ⚡ Technical Capabilities

### Sprint 1: Core Engine & Lifecycle
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

### Sprint 2: UX Polish, Tinder-Style Classification & IRS Export
1. **Tinder-Style Swipeable Card Stack (`SwipeableTripCardStack.kt`):**
   - Natural gesture tracking with directional velocity & tilt rotation.
   - **Swipe Right:** Green stamp overlay for instant **Business** classification.
   - **Swipe Left:** Crimson stamp overlay for **Personal** classification.
   - **One-Tap Action Buttons:** Dedicated buttons below the deck for accessibility and single-handed use.
   - **Instant Undo:** Reverts the previous swipe action with a single tap.
2. **GPS Route Map Canvas (`RouteMapCanvas.kt`):**
   - High-performance vector rendering on Jetpack Compose `Canvas`.
   - Dynamic bounding-box calculation with aspect-ratio preservation and padding.
   - Gradient polyline strokes (Sky Blue to Emerald Green) with telemetry grid background, waypoint counter, and Start/Finish marker pins.
3. **Trip Telemetry & Audit Bottom Sheet (`TripDetailSheet.kt`):**
   - Inspect individual drive routes, duration, start/end timestamps, and IRS Schedule C tax deductions.
   - Re-classify or delete trips on demand.
4. **Dynamic Timeframe & Status Filtering:**
   - Real-time recalculation of total deductions and business miles by timeframe: **All Time**, **This Week**, **This Month**, **2026 YTD**.
   - Filter trip list by status: **All**, **Pending**, **Business**, **Personal**.
5. **IRS Schedule C CSV Export (`CsvExportHelper.kt`):**
   - Generates audit-ready CSV reports containing Trip ID, Date, Start/End times, Duration, Distance, IRS Rate ($0.67/mi), and Total Deductions.
   - Shares via Android `FileProvider` with email, cloud drives, or accounting software.
6. **Developer Simulation Mode:**
   - One-tap button on TopAppBar to seed realistic multi-waypoint mock drives for instant UI testing without requiring vehicle motion.
