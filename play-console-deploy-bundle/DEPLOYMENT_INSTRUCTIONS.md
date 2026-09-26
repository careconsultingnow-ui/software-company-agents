# AutoMileage: Google Play Console Step-By-Step Deployment Walkthrough

Everything required to launch **AutoMileage: 1099 Tax Tracker** on Google Play is organized inside this folder.

---

## 5-Minute Quick Launch Steps

### Step 1: Open Google Play Console
1. Navigate to [https://play.google.com/console](https://play.google.com/console).
2. Click **Create app**:
   - **App name:** `AutoMileage: 1099 Tax Tracker`
   - **Default language:** `English (United States) - en-US`
   - **App or game:** `App`
   - **Free or paid:** `Free`
   - Check the declaration checkboxes and click **Create app**.

---

### Step 2: Upload Release Bundle (AAB) to Internal Testing
1. In the left sidebar, navigate to **Testing > Internal testing**.
2. Click **Create new release**.
3. Drag & drop [`app-release.aab`](./app-release.aab) into the upload area.
4. **Release name:** Set to `1.0.0 (1)`.
5. Under **Release notes**, copy the notes from [`ONE_CLICK_METADATA.txt`](./ONE_CLICK_METADATA.txt).
6. Click **Next** > **Save and publish** to Internal Testing.

---

### Step 3: Set Up Store Listing & Graphics
In the left sidebar, navigate to **Grow > Store presence > Main store listing**:
1. **App details:**
   - Copy **Short description** and **Full description** from [`ONE_CLICK_METADATA.txt`](./ONE_CLICK_METADATA.txt).
2. **Graphics:**
   - **App icon:** Upload [`playstore-app-icon.jpg`](./playstore-app-icon.jpg) (512x512).
   - **Feature graphic:** Upload [`playstore-feature-graphic.jpg`](./playstore-feature-graphic.jpg) (1024x500).
   - **Phone screenshots:** Upload all 6 images from the [`screenshots/`](./screenshots/) folder.
3. Click **Save**.

---

### Step 4: Complete Policy Questionnaires (1-Time Setup)
In the left sidebar, navigate to **Policy and programs > App content**:
1. **Privacy Policy:** Paste your policy URL (or link to `privacy.html`).
2. **Location Permissions:** Copy and paste the explanation from [`DATA_SAFETY_ANSWERS.txt`](./DATA_SAFETY_ANSWERS.txt).
3. **Data Safety:** Follow the questions using [`DATA_SAFETY_ANSWERS.txt`](./DATA_SAFETY_ANSWERS.txt) (Select "No data collected or shared").
4. **Target Audience:** Select **18 and older**.
5. **Financial features:** Select **Personal Finance / Tax management**.

---

### Step 5: Promote to Closed or Production Track
Once the Internal Testing build is saved, you can add internal testers by email or click **Promote release > Production** whenever you're ready for public Google Play Store indexing!
