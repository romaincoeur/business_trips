var SCOPES = [
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
];

$( document ).ready(function() {
    $('#link').attr('href', 'https://docs.google.com/spreadsheets/d/'+SPREADSHEET_ID);
});

/**
 * Check if current user has authorized this application.
 */
function checkAuth() {
    gapi.auth.authorize(
        {
            'client_id': CLIENT_ID,
            'scope': SCOPES.join(' '),
            'immediate': true
        }, handleAuthResult);
}

/**
 * Handle response from authorization server.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {
    var authorizeDiv = document.getElementById('authorize-div');
    console.log(authResult);
    if (authResult && !authResult.error) {
        // Hide auth UI, then load client library.
        authorizeDiv.style.display = 'none';
        loadCalendarApi();
    } else {
        // Show auth UI, allowing the user to initiate authorization by
        // clicking authorize button.
        authorizeDiv.style.display = 'inline';
    }
}

/**
 * Initiate auth flow in response to user clicking authorize button.
 *
 * @param {Event} event Button click event.
 */
function handleAuthClick(event) {
    gapi.auth.authorize(
        {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
        handleAuthResult);
    return false;
}

/**
 * Load Google Calendar client library. List upcoming events
 * once client library is loaded.
 */
function loadCalendarApi() {
    gapi.client.load('calendar', 'v3', listEvents);
}

function getLastWeek(){
    var today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
}

/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */
var events;
function listEvents() {
    var request = gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': getLastWeek().toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 40,
        'orderBy': 'startTime'
    });

    request.execute(function(resp) {
        events = resp.items;

        if (events.length > 0) {
            for (i = 0; i < events.length; i++) {
                var event = events[i];
                var when = event.start.dateTime;
                if (!when) {
                    when = event.start.date;
                }
                when = getDate(when, true);
                if (event.location) {
                    $('#output ul').append("" +
                        "<li class='list-group-item event strong' id='event-" + i + "'>" +
                        event.summary + ' (' + when + ')'
                    );
                    getDistance(event.location, i);
                } else {
                    $('#output ul').append("" +
                        "<li class='list-group-item event' id='event-" + i + "'>" +
                        event.summary + ' (' + when + ')'
                    );
                }
            }
        } else {
            appendPre('No upcoming events found.');
        }

    });
}

function getDistance(destination, eventId) {
    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
        {
            origins: ["La Loupe"],
            destinations: [destination],
            travelMode: google.maps.TravelMode.DRIVING
        }, callback);

    function callback(response, status) {
        if (status == google.maps.DistanceMatrixStatus.OK && response.rows[0].elements[0].status == 'OK') {
            var distance = response.rows[0].elements[0].distance
            $('#event-'+eventId).append("" +
                "<span class='badge'>"+distance.text+"</span>" +
                "<button class='btn btn-primary right' data-id='"+eventId+"' data-km='"+distance.value+"'>Nouveau déplacement</button>");
            $('#event-'+eventId+' button').click(function(){newTrip($(this).data('id'))});
            events[eventId].dist = (distance.value/1000)*2; // Convert to km and double for return
        } else {
            return "error";
        }
    }
}

/**
 * Append a pre element to the body containing the given message
 * as its text node.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
    var pre = document.getElementById('output');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
}

function getDate(str_date, full) {
    var now = new Date(str_date);
    var day = now.getDate();
    var month = now.getMonth();
    var year = now.getFullYear();
    var fr_months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    if (full) return day+' '+fr_months[month]+' '+year;
    else return fr_months[month]+' '+year;
}

function newTrip(eventId) {
    var discoveryUrl = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
    gapi.client.load(discoveryUrl).then(function () {
        console.log(eventId);
        gapi.client.sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID
        }).then(function(response) {
            var spreadSheet = response.result;
            spreadSheet.getSheetByName = function (name) {
                var result;
                for (var i=0; i<this.sheets.length; i++){
                    if (this.sheets[i].properties.title==name) return this.sheets[i];
                }
                return null;
            };
            var event = events[eventId];
            str_date = getDate(event.start.dateTime, true);
            sheet_name = getDate(event.start.dateTime, false);
            if (spreadSheet.getSheetByName(sheet_name) == null) newSheet(sheet_name, str_date, event.summary, event.dist);
            else newRow(SPREADSHEET_ID, sheet_name, str_date, event.summary, event.dist);

        }, function(response) {
            console.log('Error: ' + response.result.error.message);
        });
    });

}

function newSheet(title, str_date, summary, km) {
    // Create an execution request object.
    var request = {
        'function': 'newSheet',
        "parameters": [
            SPREADSHEET_ID, title
        ],
        "devMode":true
    };

    // Make the API request.
    var op = gapi.client.request({
        'root': 'https://script.googleapis.com',
        'path': 'v1/scripts/' + SCRIPT_ID + ':run',
        'method': 'POST',
        'body': request
    });

    op.execute(function(resp) {
        console.log(resp);
        if (resp.error && resp.error.status) {
            // The API encountered a problem before the script
            // started executing.
            console.log('Error calling API:');
            console.log(JSON.stringify(resp, null, 2));
        } else if (resp.error) {
            // The API executed, but the script returned an error.

            // Extract the first (and only) set of error details.
            // The values of this object are the script's 'errorMessage' and
            // 'errorType', and an array of stack trace elements.
            var error = resp.error.details[0];
            console.log('Script error message: ' + error.errorMessage);

            if (error.scriptStackTraceElements) {
                // There may not be a stacktrace if the script didn't start
                // executing.
                console.log('Script error stacktrace:');
                for (var i = 0; i < error.scriptStackTraceElements.length; i++) {
                    var trace = error.scriptStackTraceElements[i];
                    console.log('\t' + trace.function + ':' + trace.lineNumber);
                }
            }
        } else {
            console.log ('new created sheet : ' + title);
            newRow(SPREADSHEET_ID, sheet_name, str_date, summary, km);
        }
    });
}

function newRow(ss_id, sheet_name, str_date, summary, km) {
    // Create an execution request object.
    var request = {
        'function': 'addTrip',
        "parameters": [
            ss_id, sheet_name, str_date, summary, km
        ],
        "devMode":true
    };

    // Make the API request.
    var op = gapi.client.request({
        'root': 'https://script.googleapis.com',
        'path': 'v1/scripts/' + SCRIPT_ID + ':run',
        'method': 'POST',
        'body': request
    });

    op.execute(function(resp) {
        if (resp.error && resp.error.status) {
            // The API encountered a problem before the script
            // started executing.
            console.log('Error calling API:');
            console.log(JSON.stringify(resp, null, 2));
        } else if (resp.error) {
            // The API executed, but the script returned an error.

            // Extract the first (and only) set of error details.
            // The values of this object are the script's 'errorMessage' and
            // 'errorType', and an array of stack trace elements.
            var error = resp.error.details[0];
            console.log('Script error message: ' + error.errorMessage);

            if (error.scriptStackTraceElements) {
                // There may not be a stacktrace if the script didn't start
                // executing.
                console.log('Script error stacktrace:');
                for (var i = 0; i < error.scriptStackTraceElements.length; i++) {
                    var trace = error.scriptStackTraceElements[i];
                    console.log('\t' + trace.function + ':' + trace.lineNumber);
                }
            }
        } else {
            console.log ('new created trip in sheet : ' + sheet_name);
            console.log(resp);
            window.location.href = "https://docs.google.com/spreadsheets/d/"+SPREADSHEET_ID+"/edit#gid="+resp.response.result;
        }
    });
}
