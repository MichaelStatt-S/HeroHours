const sheet = SpreadsheetApp.getActiveSpreadsheet();
const users = sheet.getSheetByName("User Logs");
const logs = sheet.getSheetByName("Activity Logs");
const test = sheet.getSheetByName("test");

//insertAll is very slow and should not be run from or during the request, apps script does not yet support async functions properly

function doPost(e) {
let data = e.postData.contents.toString();
test.appendRow([data,new Date()]);
console.log(data);
 return ContentService.createTextOutput(JSON.stringify({"result": "success"}));
}

function addAll(){
  // Clear the sheets
  users.clear();
  logs.clear();

  // Fetch the last row and the data
  const last = test.getLastRow();
  const data = JSON.parse(test.getRange(`A${last}`).getValue());

  const userHeaders = [["Id", "Name", "Total Seconds", "Total Hours", "Last Check In", "Last Check Out", "Is Checked In?"]];
  const logHeaders = [["Log #", "ID", "operation", "status", "message", "timestamp"]];

  // Prepare data for the 'users' sheet
  const userRows = JSON.parse(data[0]).map(row => {
    const info = row.fields;
    return [row.pk, `${info.First_Name} ${info.Last_Name}`, info.Total_Seconds, info.Total_Hours, info.Last_In, info.Last_Out, info.Checked_In];
  });

  // Prepare data for the 'logs' sheet
  const logRows = JSON.parse(data[1]).map(row => {
    const info = row.fields;
    return [row.pk, info.userID, info.operation, info.status, info.message, info.timestamp];
  });

  // Write all data at once
  users.getRange(1, 1, userHeaders.length, userHeaders[0].length).setValues(userHeaders);
  if (userRows.length > 0) {
    users.getRange(2, 1, userRows.length, userRows[0].length).setValues(userRows);
  }

  logs.getRange(1, 1, logHeaders.length, logHeaders[0].length).setValues(logHeaders);
  if (logRows.length > 0) {
    logs.getRange(2, 1, logRows.length, logRows[0].length).setValues(logRows);
  }
}

function onOpen() {
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
      .createMenu('Custom Functionality').addItem("Update Logs","addAll")
      .addToUi();
}
