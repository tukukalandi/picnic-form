/**
 * DHENKANAL RS SUB POST OFFICE (SO)
 * Family Visit – Consent and Participant Details Backend
 * 
 * Target Google Spreadsheet ID: 1xU9HNXdzmRAO3Em_ULDGgbhjEKAbEulRhGNznW8R208
 * 
 * Columns (8 Columns - Age added after Gender):
 * 1. Sl. No.
 * 2. Applicant Name
 * 3. Gender
 * 4. Age                <-- Added after Gender
 * 5. Mobile Number
 * 6. Family Members
 * 7. Total Persons
 * 8. Submission Date & Time
 */

var SPREADSHEET_ID = "1xU9HNXdzmRAO3Em_ULDGgbhjEKAbEulRhGNznW8R208";
var SHEET_NAME = "Visit Consents";

var HEADERS = [
  "Sl. No.",
  "Applicant Name",
  "Gender",
  "Age",
  "Mobile Number",
  "Family Members",
  "Total Persons",
  "Submission Date & Time"
];

/**
 * Handles HTTP POST submissions from the web form.
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Wait for up to 30 seconds for concurrent requests
    lock.waitLock(30000);

    // 1. Parse incoming payload safely
    var payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    var applicantName = (payload.applicantName || "").toString().trim();
    var gender = (payload.gender || "").toString().trim();
    var age = (payload.age || "").toString().trim();
    var mobileNumber = (payload.mobileNumber || "").toString().trim();
    
    // Family members parsing (array or comma-delimited string)
    var familyMembers = [];
    if (Array.isArray(payload.familyMembers)) {
      familyMembers = payload.familyMembers
        .map(function(m) { 
          if (typeof m === 'object' && m !== null) {
            var details = [];
            if (m.gender) details.push(m.gender);
            if (m.age) details.push(m.age + " yrs");
            var detailsStr = details.length > 0 ? " (" + details.join(", ") + ")" : "";
            return m.name ? (m.name + detailsStr) : "";
          }
          return (m || "").toString().trim(); 
        })
        .filter(function(m) { return m.length > 0; });
    } else if (typeof payload.familyMembers === "string" && payload.familyMembers.trim().length > 0) {
      familyMembers = payload.familyMembers.split(",")
        .map(function(m) { return m.trim(); })
        .filter(function(m) { return m.length > 0; });
    }

    // 2. Validate input fields
    if (!applicantName) {
      return createJsonResponse({
        status: "error",
        message: "Applicant Name is required."
      });
    }

    if (!gender || ["Male", "Female", "Other"].indexOf(gender) === -1) {
      return createJsonResponse({
        status: "error",
        message: "Valid Gender (Male, Female, or Other) is required."
      });
    }

    if (!age || isNaN(parseInt(age, 10)) || parseInt(age, 10) < 1 || parseInt(age, 10) > 120) {
      return createJsonResponse({
        status: "error",
        message: "A valid Age (1-120) is required."
      });
    }

    // Indian mobile number validation (10 digits starting with 6, 7, 8, or 9)
    var mobileClean = mobileNumber.replace(/[\s\-\+]/g, "");
    if (mobileClean.length > 10 && mobileClean.indexOf("91") === 0) {
      mobileClean = mobileClean.substring(2);
    }
    var mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobileClean)) {
      return createJsonResponse({
        status: "error",
        message: "A valid 10-digit Indian mobile number is required."
      });
    }

    // 3. Connect to the Google Spreadsheet (Try container-bound first, then openById)
    var ss;
    try {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    } catch (e1) {
      ss = null;
    }
    if (!ss) {
      try {
        ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      } catch (ssErr) {
        return createJsonResponse({
          status: "error",
          message: "Unable to open Google Spreadsheet. Verify spreadsheet ID (" + SPREADSHEET_ID + "). Details: " + ssErr.message
        });
      }
    }

    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.getSheets()[0];
      if (!sheet) {
        sheet = ss.insertSheet(SHEET_NAME);
      }
    }

    // 4. Ensure header row is set up & auto-migrate if "Age" column is missing
    ensureOrMigrateHeaders(sheet);

    // 5. Generate Safe Serial Number (Sl. No.)
    var nextSlNo = 1;
    var dataRows = sheet.getLastRow() - 1; // excluding header
    if (dataRows > 0) {
      var lastSlVal = sheet.getRange(sheet.getLastRow(), 1).getValue();
      var parsedLast = parseInt(lastSlVal, 10);
      if (!isNaN(parsedLast) && parsedLast > 0) {
        nextSlNo = parsedLast + 1;
      } else {
        nextSlNo = dataRows + 1;
      }
    }

    // 6. Format Values & Append Row
    var familyMembersString = familyMembers.length > 0 ? familyMembers.join(", ") : "None";
    var totalPersons = 1 + familyMembers.length; // Applicant (1) + Accompanying members
    var timestampStr = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd/MM/yyyy, hh:mm:ss a (IST)");

    var newRow = [
      nextSlNo,
      applicantName,
      gender,
      parseInt(age, 10), // Age column right after Gender
      "'" + mobileClean,
      familyMembersString,
      totalPersons,
      timestampStr
    ];

    sheet.appendRow(newRow);

    // Format new row
    var currentRowIndex = sheet.getLastRow();
    var rowRange = sheet.getRange(currentRowIndex, 1, 1, HEADERS.length);
    rowRange.setVerticalAlignment("middle");
    rowRange.setBorder(true, true, true, true, true, true, "#E2E8F0", SpreadsheetApp.BorderStyle.SOLID);
    
    // Centered columns: Sl. No., Gender, Age, Mobile, Total Persons
    sheet.getRange(currentRowIndex, 1).setHorizontalAlignment("center");
    sheet.getRange(currentRowIndex, 3).setHorizontalAlignment("center");
    sheet.getRange(currentRowIndex, 4).setHorizontalAlignment("center");
    sheet.getRange(currentRowIndex, 5).setHorizontalAlignment("center");
    sheet.getRange(currentRowIndex, 7).setHorizontalAlignment("center");

    return createJsonResponse({
      status: "success",
      slNo: nextSlNo,
      applicantName: applicantName,
      gender: gender,
      age: age,
      sheetName: sheet.getName(),
      totalPersons: totalPersons,
      submissionTime: timestampStr,
      message: "Your consent and participant details have been submitted successfully."
    });

  } catch (err) {
    return createJsonResponse({
      status: "error",
      message: "Server error occurred: " + err.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Handles HTTP GET requests (Health check, submission count, and ping)
 */
function doGet(e) {
  try {
    var ss;
    try {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    } catch (e1) {}
    if (!ss) {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    }

    var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    var lastRow = sheet ? sheet.getLastRow() : 0;
    var count = Math.max(0, lastRow - 1);

    return createJsonResponse({
      status: "online",
      service: "Dhenkanal RS Sub Post Office Consent Backend",
      spreadsheetId: SPREADSHEET_ID,
      sheetName: sheet ? sheet.getName() : "Unknown",
      totalSubmissions: count,
      nextSlNo: count + 1,
      columns: HEADERS,
      serverTime: Utilities.formatDate(new Date(), "Asia/Kolkata", "dd/MM/yyyy, hh:mm:ss a (IST)")
    });
  } catch (err) {
    return createJsonResponse({
      status: "error",
      message: "Spreadsheet check failed: " + err.message
    });
  }
}

/**
 * Ensures header row exists and contains the "Age" column after "Gender".
 * If an older 7-column header is present, it automatically migrates the sheet by inserting "Age" at Column D.
 */
function ensureOrMigrateHeaders(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow === 0) {
    sheet.appendRow(HEADERS);
    formatHeaderRow(sheet);
    return;
  }

  // Check row 1 column D
  var colDValue = sheet.getRange(1, 4).getValue().toString().trim().toLowerCase();
  if (colDValue === "mobile number" || colDValue === "phone" || colDValue === "contact") {
    // Old 7-column schema detected! Insert a new column at D for "Age"
    sheet.insertColumnBefore(4);
    sheet.getRange(1, 4).setValue("Age");
    formatHeaderRow(sheet);
  } else if (!sheet.getRange(1, 1).getValue()) {
    // Empty row 1
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    formatHeaderRow(sheet);
  }
}

/**
 * Helper to build CORS-compatible JSON text output
 */
function createJsonResponse(data) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

/**
 * Formats the header row with official India Post styling (Red background with white bold text)
 */
function formatHeaderRow(sheet) {
  var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setBackground("#C8102E"); // Official India Post Red
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");
  headerRange.setFontSize(11);
  headerRange.setHorizontalAlignment("center");
  headerRange.setVerticalAlignment("middle");
  sheet.setRowHeight(1, 35);
  sheet.setFrozenRows(1);
  
  for (var i = 1; i <= HEADERS.length; i++) {
    sheet.autoResizeColumn(i);
  }
}

/**
 * Manual test function to run inside Apps Script editor to initialize the spreadsheet.
 */
function testSetup() {
  var ss;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {}
  if (!ss) {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  ensureOrMigrateHeaders(sheet);
  Logger.log("Successfully connected and initialized sheet: " + sheet.getName());
}
