# Privacy Policy for AutoMileage: 1099 Tax Tracker
**Last Updated:** September 25, 2026  
**Effective Date:** September 25, 2026  

At **Software Company LLC** ("we", "us", or "our"), we built **AutoMileage: 1099 Tax Tracker** with a fundamental commitment: **your location, driving habits, and financial data belong to you, not us or third-party advertisers.**

This Privacy Policy explains how our mobile application handles your information.

---

### 1. Zero Cloud Data Collection
AutoMileage is architected as an **offline-first application**:
- We **do not** operate user tracking servers.
- We **do not** sell, rent, or monetize your personal or telemetry data.
- We **do not** include third-party advertising SDKs, tracking pixels, or data brokers.
- No account registration, email, or password is required to use the app.

---

### 2. Information Handled On Your Device
All data is stored exclusively on your device in a secure, local Room SQLite database (`mileagetracker.db`):

- **Location Data (GPS Telemetry):** AutoMileage requests `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, and `ACCESS_BACKGROUND_LOCATION` solely to log driving routes, measure trip distances, and calculate standard mileage deductions when vehicular movement is detected. Location breadcrumbs are processed and saved locally on your device.
- **Physical Activity Data:** AutoMileage requests `ACTIVITY_RECOGNITION` to detect when you enter a vehicle. This enables stationary sleep modes to preserve your phone's battery life.
- **Financial & Expense Records:** Expense amounts, receipt dates, vendor names, vehicle profiles, and gross earnings entered into the True Net Calculator are stored strictly in local storage.

---

### 3. Background Location & Foreground Service Notice
To automatically detect drives without requiring you to manually open your phone while operating a motor vehicle:
- AutoMileage utilizes an Android Foreground Service with type `location` accompanied by a persistent status bar notification ("AutoMileage Standby" or "Recording Drive").
- Background location access is utilized **only** during active drives to accurately map business mileage for IRS audit compliance.

---

### 4. Data Sharing & Exporting
- **User-Initiated Exports:** You can export your data at any time via CSV (IRS Schedule C format) or encrypted JSON backup. These files are saved to your device's local storage and are transmitted only when you deliberately share them (e.g., emailing to your CPA or saving to Google Drive).
- **No Third-Party Access:** We do not transmit or sync your data to any external cloud database.

---

### 5. Data Retention & Deletion
You maintain complete control over your data:
- You may delete individual drives or expenses directly within the app at any time.
- You can wipe all data permanently by navigating to **Settings > Clear All Data** or by uninstalling the application from your device.

---

### 6. Children's Privacy
AutoMileage is intended for self-employed individuals, independent contractors, and gig workers aged 18 and older. We do not knowingly collect information from children under 13.

---

### 7. Changes to this Privacy Policy
If we make any modifications to our privacy practices, we will update this document and post notice within the application release notes.

---

### 8. Contact Us
If you have questions regarding this Privacy Policy or your data privacy, contact our team:
- **Email:** `privacy@softwarecompany.example.com`
- **Developer:** Software Company LLC
