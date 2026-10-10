# Dhenkanal RS Sub Post Office (SO) - Family Visit Consent Form
## Google Sheets & Apps Script Deployment Instructions

This guide provides instructions to connect the **Family Visit Consent Form** to your Google Spreadsheet using Google Apps Script.

---

### Spreadsheet Information
- **Target Spreadsheet ID:** `1xU9HNXdzmRAO3Em_ULDGgbhjEKAbEulRhGNznW8R208`
- **Spreadsheet URL:** [https://docs.google.com/spreadsheets/d/1xU9HNXdzmRAO3Em_ULDGgbhjEKAbEulRhGNznW8R208/edit](https://docs.google.com/spreadsheets/d/1xU9HNXdzmRAO3Em_ULDGgbhjEKAbEulRhGNznW8R208/edit)

### Spreadsheet Columns (8 Columns)
1. **Sl. No.** – Sequential serial number
2. **Applicant Name** – Full name of postal agent
3. **Gender** – Male, Female, or Other
4. **Age** – Age of the applicant in years *(Placed after Gender)*
5. **Mobile Number** – 10-digit Indian mobile number
6. **Family Members** – Accompanying members (comma-separated)
7. **Total Persons** – Applicant + Family Members
8. **Submission Date & Time** – Timestamp in Indian Standard Time (IST)

---

### Step 1: Open the Google Spreadsheet
1. Open your web browser and navigate to the Google Spreadsheet:
   [https://docs.google.com/spreadsheets/d/1xU9HNXdzmRAO3Em_ULDGgbhjEKAbEulRhGNznW8R208/edit](https://docs.google.com/spreadsheets/d/1xU9HNXdzmRAO3Em_ULDGgbhjEKAbEulRhGNznW8R208/edit)
2. Log into your Google account (the account that owns or has edit access to the sheet).

---

### Step 2: Open Extensions → Apps Script
1. In the Google Sheets top menu bar, click on **Extensions**.
2. From the dropdown menu, select **Apps Script**.
3. A new browser tab will open showing the Apps Script editor.
4. Rename the project to **Dhenkanal RS SO - Visit Form Backend**.

---

### Step 3: Add and Save the Backend Code
1. In the editor, select and delete any existing default code in `Code.gs`.
2. Copy the entire contents of the updated `Code.gs` file provided in this project (or click **Copy Code.gs** in the web form's Setup Guide).
3. Paste the code into the editor.
4. Click the **Save** disk icon (or press `Ctrl + S` / `Cmd + S`).

*(Tip: In the function dropdown, select `testSetup` and click **Run**. Grant permissions if prompted. This will automatically format the columns in your spreadsheet!)*

---

### Step 4: Deploy the Script as a Web App (CRITICAL)
For the web form to save submissions to your Google Sheet, the deployment settings must be exact:
1. In the top right corner of the Apps Script editor, click the blue **Deploy** button.
2. Select **New deployment** (or **Manage deployments** → edit pencil icon → **New version** if updating an existing deployment).
3. Click the gear icon next to "Select type" and choose **Web app**.
4. Configure the settings **exactly** as follows:
   - **Description**: `Dhenkanal RS SO Family Visit v2`
   - **Execute as**: **Me (`your-email@...`)**
     *(Crucial: This ensures submissions write to the sheet even when applicants are not logged into Google).*
   - **Who has access**: **Anyone**
     *(Crucial: Allows the postal web form to deliver responses without permission errors).*
5. Click **Deploy**.
6. If prompted, click **Authorize access**, select your Google account, click **Advanced**, and then click **Go to Dhenkanal RS SO - Visit Form Backend (unsafe)** to allow it to edit your spreadsheet.

---

### Step 5: Copy the Web App URL into the Web Form
1. Google Apps Script will display the **Web App URL** (format: `https://script.google.com/macros/s/AKfycb.../exec`).
2. Click **Copy** to copy this URL.
3. Return to the **Family Visit Consent Form** web application.
4. Paste the URL into the **Google Apps Script Web App URL** input (either in the top banner or via Settings).
5. Click **Test Connection** to confirm connectivity.
6. Click **Save Configuration**.

---

### Step 6: Test a Submission and Verify
1. Enter:
   - Name of Applicant: `Sri Rajesh Kumar Nayak`
   - Gender: `Male`
   - Age: `38`
   - Mobile Number: `9876543210`
   - Add accompanying family members.
2. Click **Submit Consent** → review in the dialog → click **Confirm & Submit**.
3. Open your Google Spreadsheet:
   A new row will be appended with:
   - Column A: **Sl. No.**
   - Column B: **Applicant Name**
   - Column C: **Gender**
   - Column D: **Age**
   - Column E: **Mobile Number**
   - Column F: **Family Members**
   - Column G: **Total Persons**
   - Column H: **Submission Date & Time**
