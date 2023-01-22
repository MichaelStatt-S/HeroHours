var dataSheet = SpreadsheetApp.getActive().getSheetByName("Data Log");
var userSheet = SpreadsheetApp.getActive().getSheetByName("Users");

function findOrphanedCheckIn(userID) {
  let values = dataSheet.getDataRange().getValues();
  for (let i = 0; i < values.length; i++) {
    if (i > 0) {
      if (
        values[i][0].toString() === userID.toString() &&
        values[i][2].toString() === "" &&
        values[i][1]
      ) {
        return i;
      }
    }
  }
  return null;
}

function userHasPastCheckin(userID) {
  let values = dataSheet.getDataRange().getValues();
  for (let i = 0; i < values.length; i++) {
    if (i > 0) {
      if (
        values[i][0].toString() === userID.toString() &&
        values[i][1].toString() != ""
      ) {
        return i;
      }
    }
  }
  return null;
}

function userExists(userID) {
  let values = userSheet.getDataRange().getValues();
  for (let i = 0; i < values.length; i++) {
    if (i > 0) {
      if (values[i][0].toString() === userID.toString()) {
        return true;
      }
    }
  }
  return false;
}

function myFunction() {}

function doGet(e) {
  if (e.parameter.operation.toString() === "getUsersData") {
    return ContentService.createTextOutput(
      JSON.stringify(userSheet.getDataRange().getValues())
    ).setMimeType(ContentService.MimeType.JSON);
  }
  if (userExists(e.parameter.userID)) {
    if (e.parameter.operation.toString() === "checkIn") {
      if (findOrphanedCheckIn(e.parameter.userID)) {
        return ContentService.createTextOutput(
          JSON.stringify({
            status: "error",
            message: "User already checked in",
          })
        ).setMimeType(ContentService.MimeType.JSON);
      } else {
        dataSheet.appendRow([e.parameter.userID, new Date()]);
        return ContentService.createTextOutput(
          JSON.stringify({ status: "success", message: "User checked in" })
        ).setMimeType(ContentService.MimeType.JSON);
      }
    }
    if (e.parameter.operation.toString() === "checkOut") {
      if (
        findOrphanedCheckIn(e.parameter.userID) &&
        userHasPastCheckin(e.parameter.userID)
      ) {
        row = findOrphanedCheckIn(e.parameter.userID) + 1;
        dataSheet
          .getRange(row, 3, 1, 2)
          .setValues([[new Date(), `=C${row}-B${row}`]]);
        return ContentService.createTextOutput(
          JSON.stringify({ status: "success", message: "User checked out" })
        ).setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(
          JSON.stringify({ status: "error", message: "User not checked in" })
        ).setMimeType(ContentService.MimeType.JSON);
      }
    }
  } else {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: "User does not exist" })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
