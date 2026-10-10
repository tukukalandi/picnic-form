export const SPREADSHEET_ID = "1xU9HNXdzmRAO3Em_ULDGgbhjEKAbEulRhGNznW8R208";
export const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`;

export const HEADERS_LIST = [
  "Sl. No.",
  "Applicant Name",
  "Gender",
  "Age",
  "Mobile Number",
  "Family Members",
  "Total Persons",
  "Submission Date & Time"
];

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * DHENKANAL RS SUB POST OFFICE (SO)
 * Family Visit – Consent and Participant Details Backend
 * Target Spreadsheet ID: 1xU9HNXdzmRAO3Em_ULDGgbhjEKAbEulRhGNznW8R208
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

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);

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

    // Validation
    if (!applicantName) {
      return createJsonResponse({ status: "error", message: "Applicant Name is required." });
    }
    if (!gender || ["Male", "Female", "Other"].indexOf(gender) === -1) {
      return createJsonResponse({ status: "error", message: "Valid Gender is required." });
    }
    if (!age || isNaN(parseInt(age, 10)) || parseInt(age, 10) < 1 || parseInt(age, 10) > 120) {
      return createJsonResponse({ status: "error", message: "A valid Age (1-120) is required." });
    }

    var mobileClean = mobileNumber.replace(/[\\s\\-\\+]/g, "");
    if (mobileClean.length > 10 && mobileClean.indexOf("91") === 0) {
      mobileClean = mobileClean.substring(2);
    }
    var mobileRegex = /^[6-9]\\d{9}$/;
    if (!mobileRegex.test(mobileClean)) {
      return createJsonResponse({ status: "error", message: "A valid 10-digit Indian mobile number is required." });
    }

    // Connect to spreadsheet (container-bound or openById)
    var ss;
    try {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    } catch (e1) {}
    if (!ss) {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    }

    var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    // Ensure header row exists and has the Age column
    ensureOrMigrateHeaders(sheet);

    // Calculate next Sl. No. safely
    var nextSlNo = 1;
    var dataRows = sheet.getLastRow() - 1;
    if (dataRows > 0) {
      var lastSlVal = sheet.getRange(sheet.getLastRow(), 1).getValue();
      var parsedLast = parseInt(lastSlVal, 10);
      if (!isNaN(parsedLast) && parsedLast > 0) {
        nextSlNo = parsedLast + 1;
      } else {
        nextSlNo = dataRows + 1;
      }
    }

    var familyMembersString = familyMembers.length > 0 ? familyMembers.join(", ") : "None";
    var totalPersons = 1 + familyMembers.length;
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

    var currentRow = sheet.getLastRow();
    var range = sheet.getRange(currentRow, 1, 1, HEADERS.length);
    range.setVerticalAlignment("middle");
    sheet.getRange(currentRow, 1).setHorizontalAlignment("center");
    sheet.getRange(currentRow, 3).setHorizontalAlignment("center");
    sheet.getRange(currentRow, 4).setHorizontalAlignment("center");
    sheet.getRange(currentRow, 5).setHorizontalAlignment("center");
    sheet.getRange(currentRow, 7).setHorizontalAlignment("center");

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
    return createJsonResponse({ status: "error", message: "Server error: " + err.toString() });
  } finally {
    lock.releaseLock();
  }
}

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
      service: "Dhenkanal RS SO Consent Backend",
      spreadsheetId: SPREADSHEET_ID,
      sheetName: sheet ? sheet.getName() : "Unknown",
      totalSubmissions: count,
      nextSlNo: count + 1,
      columns: HEADERS,
      serverTime: Utilities.formatDate(new Date(), "Asia/Kolkata", "dd/MM/yyyy, hh:mm:ss a (IST)")
    });
  } catch (err) {
    return createJsonResponse({ status: "error", message: "Spreadsheet check failed: " + err.message });
  }
}

function ensureOrMigrateHeaders(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow === 0) {
    sheet.appendRow(HEADERS);
    formatHeaderRow(sheet);
    return;
  }
  var colDValue = sheet.getRange(1, 4).getValue().toString().trim().toLowerCase();
  if (colDValue === "mobile number" || colDValue === "phone" || colDValue === "contact") {
    sheet.insertColumnBefore(4);
    sheet.getRange(1, 4).setValue("Age");
    formatHeaderRow(sheet);
  } else if (!sheet.getRange(1, 1).getValue()) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    formatHeaderRow(sheet);
  }
}

function createJsonResponse(data) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function formatHeaderRow(sheet) {
  var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setBackground("#C8102E");
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment("center");
  sheet.setRowHeight(1, 35);
  sheet.setFrozenRows(1);
}
`;
