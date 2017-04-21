function createHomePage() {
  // create a new site
  var site = SitesApp.createSite("wildcodeschool.fr", "trip", "Saisie des déplacements", "Cet outil sert à saisir les déplacements comme notes de frais");

  // Get latest events from calendar
  var eventPage = site.createAnnouncementsPage("Events", "events", "");
  var d1 = new Date("1/1/2017");
  var d2 = new Date("3/2/2017");
  var events = CalendarApp.getOwnedCalendarById("romain@wildcodeschool.fr").getEvents(d1, d2);
  for (var i = 0; i < events.length; i++) {
    var message = "There will be a soccer match from " + events[i].getStartTime() + " until " + events[i].getEndTime() + "!";
    eventPage.createAnnouncement("Soccer Match #" + (i + 1), message);
  }
}

function newSheet(ss_id, sheet_name) {

  // Debug values
  // var ss_id = '1qareee3-2PmdenZ2AAGinrv-MG7t1hDQMduI7kTywGw';
  // var sheet_name = 'avril 2016';

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

  // Debug values
  // var sheet = SpreadsheetApp.openById('1qareee3-2PmdenZ2AAGinrv-MG7t1hDQMduI7kTywGw').getSheets()[3];
  // var str_date = 'Salut';

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
