function newSheet(ss_id, sheet_name) {

  // Get sheet
  var source = SpreadsheetApp.openById(ss_id);
  var sheet = source.getSheets()[0];

  // Copy NEW Sheet and rename it
  var destination = source;
  newSheet = sheet.copyTo(destination);
  newSheet.setName(sheet_name);

  // Set month and year
  var split = sheet_name.split(" ");
  newSheet.getRange("AF6").setValue(split[0]);
  newSheet.getRange("AI6").setValue(split[1]);

}

function addTrip(ss_id, sheet_name, str_date, title, km) {

  // Get sheet
  var source = SpreadsheetApp.openById(ss_id);
  var sheet = source.getSheetByName(sheet_name);

  var row = 15;
  while (sheet.getRange("A"+row).getValue() != '') row++;
  sheet.getRange("A"+row).setValue(str_date);
  sheet.getRange("B"+row).setValue(title);
  sheet.getRange("D"+row).setValue(km);

  return sheet.getSheetId();
}
