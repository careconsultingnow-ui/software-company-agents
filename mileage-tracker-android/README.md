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
│   │   │   ├── LocationFilter.kt        # Jitter/noise filter to eliminate stationary GPS drift
│   │   │   └── BackupWorker.kt          # Scheduled WorkManager backup and archive generator
│   │   ├── utils/
│   │   │   ├── BatteryOptimizationHelper.kt # OEM-specific battery bypass handler
│   │   │   ├── TaxCalculator.kt         # IRS mileage calculations ($0.67/mile)
│   │   │   ├── NotificationHelper.kt    # Ongoing tracking banner & actionable classification alerts
│   │   │   └── CsvExportHelper.kt       # IRS Schedule C CSV export & Android share sheet integration
│   │   └── ui/                          # Jetpack Compose UI
│   │       ├── MainActivity.kt          # Runtime permissions orchestration & navigation
│   │       ├── DashboardViewModel.kt    # StateFlow bridge between engine, filters, and UI
│   │       ├── DashboardScreen.kt       # Material 3 Dark theme 3-tab dashboard
│   │       └── components/
│   │           ├── SwipeableTripCardStack.kt # Tinder-style card deck for backlog classification
│   │           ├── RouteMapCanvas.kt    # Native Canvas GPS telemetry & polyline visualizer
│   │           ├── TripDetailSheet.kt   # Modal bottom sheet for route & audit log inspection
│   │           ├── AddExpenseDialog.kt  # 1099 non-mileage expense & receipt logger
│   │           ├── ExpenseListCard.kt   # Logged expense item card
│   │           ├── TrueNetIncomeCard.kt # 1099 gig platform income reconciliation & tax shield
│   │           ├── OnboardingDialog.kt  # Interactive driver welcome & feature tour
│   │           └── SettingsDialog.kt    # Vehicle profile and custom IRS rate settings
```

---

## ⚡ Technical Capabilities Across All Phases

### Phase 1 (Sprint 1): Core Engine & Lifecycle
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

### Phase 2 (Sprint 2): Tinder-Style Classification & Route Telemetry
1. **Tinder-Style Swipeable Card Stack (`SwipeableTripCardStack.kt`):**
   - Natural gesture tracking with directional velocity & tilt rotation.
   - **Swipe Right:** Green stamp overlay for instant **Business** classification ($0.67/mile deduction).
   - **Swipe Left:** Crimson stamp overlay for **Personal** classification.
   - **One-Tap Action Buttons:** Dedicated buttons below the deck for accessibility and single-handed use.
   - **Instant Undo:** Reverts accidental swipes with a single tap.
2. **GPS Route Map Canvas (`RouteMapCanvas.kt`):**
   - High-performance vector rendering on Jetpack Compose `Canvas`.
   - Dynamic bounding-box calculation with aspect-ratio preservation and padding.
   - Gradient polyline strokes (Sky Blue to Emerald Green) with telemetry grid background and Start/Finish marker pins.
3. **Trip Telemetry & Audit Bottom Sheet (`TripDetailSheet.kt`):**
   - Inspect individual drive routes, duration, start/end timestamps, and IRS Schedule C tax deductions.
4. **Dynamic Timeframe & Status Filtering:**
   - Real-time recalculation of total deductions and business miles by timeframe: **All Time**, **This Week**, **This Month**, **2026 YTD**.
5. **IRS Schedule C CSV Export Engine (`CsvExportHelper.kt`):**
   - Generates audit-ready CSV reports containing Trip ID, Date, Start/End times, Duration, Distance, IRS Rate, and Total Deductions.

### Phase 3 (Sprint 3): 1099 Expense Logging & True Net Income
1. **1099 Non-Mileage Expense Logger (`AddExpenseDialog.kt`, `ExpenseListCard.kt`):**
   - Write off fuel, tolls, parking, vehicle maintenance, insurance, phone bills, and equipment.
   - Local photo receipt attachment support for audit proof.
2. **"True Net Take-Home" Calculator (`TrueNetIncomeCard.kt`):**
   - Reconciles weekly gross platform earnings (Uber, DoorDash, Lyft) against mileage depreciation and expenses.
   - Highlights IRS cash savings and percentage of income shielded from taxes.
3. **Scheduled WorkManager Backups (`BackupWorker.kt`):**
   - Periodic background worker creating encrypted JSON snapshots and updated CSV logs.

### Phase 4 (Final Phase): Driver Experience & Production Readiness
1. **Interactive Driver Onboarding Tour (`OnboardingDialog.kt`):**
   - Welcomes gig drivers, explaining background sensor tracking, fast swipe classification, and tax shielding.
2. **Driver Vehicle Profile & Settings (`SettingsDialog.kt`):**
   - Configure vehicle make/model and custom deduction rates.
3. **3-Tab Navigation Bar:**
   - Clean switching between **Drives**, **Expenses**, and **1099 Tax Shield**.
4. **Developer Simulation Mode:**
   - One-tap buttons in TopAppBar to seed realistic multi-waypoint mock drives and 1099 expenses for instant evaluation.
