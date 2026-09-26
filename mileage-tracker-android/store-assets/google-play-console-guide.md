# Google Play Console Submission Runbook & Declarations Guide
**Application:** AutoMileage: 1099 Tax Tracker  
**Package:** `com.softwarecompany.mileagetracker`  
**Version:** `1.0.0` (`versionCode = 1`)  
**Production Artifact:** `app/build/outputs/bundle/release/app-release.aab` (3.28 MB)  

---

## 1. Google Play Console Setup Checklist

- [x] **Signed Production AAB Built:** `app-release.aab` compiled with R8 minification and RSA 2048-bit keystore.
- [x] **Store Listing Metadata Prepared:** Title, Short Description, Full Description, and Tags formatted in [`google-play-listing.md`](./google-play-listing.md).
- [x] **Graphic Assets Rendered:**
  - High-Res App Icon: 512 x 512 px (Adaptive vector source in `res/mipmap-anydpi-v26/ic_launcher.xml`)
  - Feature Graphic: 1024 x 500 px ([`playstore-feature-graphic.jpg`](./playstore-feature-graphic.jpg))
  - Screenshot Showcase: 6 high-resolution phone captures ([`screenshots/`](./screenshots/))
- [x] **Privacy Policy Published:** Documented in [`privacy-policy.md`](./privacy-policy.md) and hosted on the marketing web landing page.
- [x] **Permissions & Policy Declarations Formulated:** Exact answers for Play Console policy forms below.

---

## 2. Policy Declarations & Questionnaire Answers

### A. Location Permissions Declaration (`ACCESS_BACKGROUND_LOCATION`)
Google Play strictly audits apps requesting background location. Use the exact wording below for the review form:

* **Core Feature Purpose:**
  > *"AutoMileage is an automated mileage tracker engineered for gig workers (rideshare and delivery couriers). Drivers cannot safely interact with their mobile device while operating a motor vehicle. Background location enables hands-free detection and logging of driving routes when the user begins vehicular transit, ensuring accurate tax deduction records for IRS Schedule C compliance."*
* **Prominent In-App Disclosure:**
  > *"The app displays a dedicated onboarding disclosure dialog prior to requesting the location permission, clearly explaining that location data is accessed in the background only during drives, stored 100% locally on the device, and never transmitted to external cloud servers or third parties."*
* **Video Demonstration URL:**
  > *A 30-second screen capture demonstrating the permission prompt, drive detection, and local trip log in the emulator.*

---

### B. Foreground Service Permission Declaration (Android 14+ / API 34)
In accordance with Android 14 requirements for `FOREGROUND_SERVICE_LOCATION`:

* **Service Type:** `location`
* **User-Facing Notification:**
  - When in standby: *"AutoMileage Standby — Monitoring for driving motion"*
  - When tracking: *"AutoMileage Active — Recording drive for Schedule C deductions"*
* **Justification:**
  > *"The foreground service ensures continuous, uninterrupted GPS waypoint logging during an active business trip without being terminated by Android's low-memory killer, ensuring the driver does not lose tax write-off miles."*

---

### C. Financial Features Declaration
* **Does your app provide financial features?**
  > **Yes — Personal Finance & Tax Management**
* **Documentation category:**
  > *"The app provides tax calculation tools (Standard IRS mileage deduction rate) and expense logging for 1099 independent contractors. It does not provide banking, loans, or securities trading."*

---

### D. Data Safety Section Responses

| Section | Question | Answer |
|:---|:---|:---|
| **Data Collection** | Does your app collect or share user data? | **No** (All data stays in local Room database) |
| **Location Data** | Approximate & Precise Location | Collected locally only; **0% shared** |
| **Financial Info** | Purchase history / User earnings | Collected locally only; **0% shared** |
| **Data Security** | Is data encrypted in transit? | **Yes** (User-initiated exports use OS secure sharing) |
| **Account Deletion** | Do you offer account deletion? | **Yes / Not Applicable** (App requires no account; 1-tap Clear Data wipes device DB) |

---

## 3. Internal Testing Track Deployment Steps

1. Log into [Google Play Console](https://play.google.com/console).
2. Select **Create app** > Name: `AutoMileage: 1099 Tax Tracker` > Default language: `English (United States)` > Free.
3. Under **Release > Testing > Internal testing**:
   - Create a new release.
   - Upload `app/build/outputs/bundle/release/app-release.aab`.
   - Release name: `1.0.0 (1)`.
   - Release notes:
     ```text
     Initial release of AutoMileage: 1099 Tax Tracker.
     - Automatic hands-free drive detection with battery-conscious geofencing.
     - Tinder-style swipe classification (Right = Business, Left = Personal).
     - Vector GPS route visualizer with audit telemetry.
     - 1099 deductible receipt & expense logger.
     - True Net Take-Home income and IRS Cash Shield calculator.
     - 1-tap IRS Schedule C CSV export.
     ```
4. Under **Grow > Store presence > Main store listing**:
   - Paste copy from [`google-play-listing.md`](./google-play-listing.md).
   - Upload [`playstore-feature-graphic.jpg`](./playstore-feature-graphic.jpg).
   - Upload screenshots from [`store-assets/screenshots/`](./screenshots/).
5. Under **Policy > App content**:
   - Complete Data safety, Location permissions, and Privacy policy links using the answers provided in Section 2.
6. Click **Save and Rollout to Internal Testing**.
