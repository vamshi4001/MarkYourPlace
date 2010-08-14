/* 
 * Gain access to the Prefences service.
 */
var prefManager = Components.classes["@mozilla.org/preferences-service;1"]
                            .getService(Components.interfaces.nsIPrefBranch);



/*
 * Called when a Firefox Window opens.  Sets current homepage and
 * sets an alarm of when the homepage will change next.
 *
 * Note that this should only run on the first browser window that is opened.
 *
 * Since this is a new window load, immediately refresh window.
 */
function HPsched_init(event) {
	var windowManager = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService();
	var windowManagerInterface = windowManager.QueryInterface(Components.interfaces.nsIWindowMediator);
	var windowEnumerator = windowManagerInterface.getEnumerator("navigator:browser");
	
	if(windowEnumerator.hasMoreElements()) {
		var oldestWindow = windowEnumerator.getNext();
		if(window == oldestWindow) {
			HPsched_update(event, true, window);
		}
	}
}



/*
 * Called when alarm goes off to update.  Sets current homepage and
 * sets an alarm of when the homepage will change next.
 *
 * Must get the first window that was opened - as that is where hpsched runs.
 */
function HPsched_alarm(event) {
	var windowManager = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService();
	var windowManagerInterface = windowManager.QueryInterface(Components.interfaces.nsIWindowMediator);
	var windowEnumerator = windowManagerInterface.getEnumerator("navigator:browser");
	
	if(windowEnumerator.hasMoreElements()) {
		var oldestWindow = windowEnumerator.getNext();
		HPsched_update(event, false, oldestWindow);
	}
}



/*
 * Sets the current homepage and sets a timer for the next update.
 */
function HPsched_update(event, immediate, hpschedWindow) {
	var prefString = prefManager.getCharPref("extensions.hpsched.schedules");
	if(prefString == "")
		return;

	/* Convert the schedules string to javascript objects */
	var schedulesList = prefString.split(".NEXT.");
	var schedules = buildSchedules(schedulesList);

	/* set browser.startup.homepage to the current schedule's URL */
	var currentUrl = getCurrentSchedule(schedules);
	prefManager.setCharPref("browser.startup.homepage", currentUrl);
	if(immediate)
		hpschedWindow.loadURI(currentUrl);

	/* detemine when the next schedule change is, and set a timer */
	var changeTime = createTimer(schedules, hpschedWindow);

	/* update tooltip of all browser windows to show next update */
	updateTooltips("Next Change: " + changeTime);
}



/*
 * Sets the tooltiptext on all open browser windows
 */
function updateTooltips(text) {
	var windowManager = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService();
	var windowManagerInterface = windowManager.QueryInterface(Components.interfaces.nsIWindowMediator);
	var windowEnumerator = windowManagerInterface.getEnumerator("navigator:browser");
	
	while(windowEnumerator.hasMoreElements()) {
		var doc = windowEnumerator.getNext().document;
		if(doc != null) {
			var icon = doc.getElementById("hpsched_sbi");
			if(icon != null) {
				icon.setAttribute("tooltiptext", text);
			}
		}
	}
}



/*
 * A single schedule object
 */
function Schedule(date, start, end, location) {
	this.isDaily = (date == "Daily") ? true : false;
	this.dateStr = date;
	this.start = start;
	this.end = end;
	this.startDate = toDate("start", date, start, end);
	this.endDate = toDate("end", date, start, end);
	this.location = location;
}



/*
 * Converts the preference strings into actual Schedule objects
 */
function buildSchedules(scheduleStrings) {
	var schedules = new Array();

	for(var i=0; i < scheduleStrings.length; i++) {
		var pieces = scheduleStrings[i].split(".ITEM.");
		schedules.push(new Schedule(pieces[0], pieces[1], pieces[2], pieces[3]));
	}
	
	return schedules;
}



/*
 * Returns the current schedule's location, falls back to default if needed.
 */
function getCurrentSchedule(schedules) {
	var now = new Date();
	var currents = new Array();

	for(var i=0; i < schedules.length; i++) {
		if(schedules[i].startDate - now <= 0) 
			if(schedules[i].endDate - now > 0)
				currents.push(schedules[i]);
	}

	if(currents.length > 0)
		return currents[0].location;
	else
		return prefManager.getCharPref("extensions.hpsched.defaultHomepage");
}



/*
 * Sets a timer on the window for the next update
 */
function createTimer(schedules, hpschedWindow) {
	var min = -1;
	var time = null;
	var now = new Date();

	/* No scheduled items */
	if(schedules.length == 0)
		return null;

	/* find min time change (3 second smudge) */
	for(var i=0; i < schedules.length; i++) {
		var startDist = schedules[i].startDate - now;
		var endDist = schedules[i].endDate - now;

		now.setSeconds(0);
		if(startDist > 0 && (min == -1 || startDist < min)) {
			min = startDist;
			time = schedules[i].startDate;
		}

		now.setSeconds(0);
		if(endDist > 0 && (min == -1 || endDist < min)) {
			min = endDist;
			time = schedules[i].endDate;
		}
	}

	if(min > 0) {
		/* create timer to go off at next time change */
		hpschedWindow.setTimeout(HPsched_alarm, min);

		/* return timeChange to set the tooltiptext */
		return time.toLocaleString();
	}
	
	return "Nothing Scheduled";
}



/*
 * Converts strings to date object
 */
function toDate(getStr, dateStr, start, end) {
	var now = new Date();

	/* create the start time */
	var hourStart = parseInt(start.split(":")[0]);
	var minuteStart = parseInt(start.split(":")[1]);

	start = start.toLowerCase();
	if(hourStart == 12 && start.indexOf("a") != -1)
		hourStart = 0;
	else if(hourStart != 12 && start.indexOf("p") != -1)
		hourStart += 12;


	/* create the end time */
	var hourEnd = parseInt(end.split(":")[0]);
	var minuteEnd = parseInt(end.split(":")[1]);

	end = end.toLowerCase();
	if(hourEnd == 12 && end.indexOf("a") != -1)
		hourEnd = 0;
	else if(hourEnd != 12 && end.indexOf("p") != -1)
		hourEnd += 12;

	/* Handle the daily events */
	if(dateStr == "Daily") {
		var eventStart = new Date();
		eventStart.setHours(hourStart);
		eventStart.setMinutes(minuteStart);
		eventStart.setSeconds(0);
		eventStart.setMilliseconds(0);

		var eventEnd = new Date();
		eventEnd.setHours(hourEnd);
		eventEnd.setMinutes(minuteEnd);
		eventEnd.setSeconds(0);
		eventEnd.setMilliseconds(0);

		/* If event has passed completely, use tomorrow's date */
		if(eventEnd.getTime() < now.getTime()) {
			eventEnd = new Date(eventEnd.getTime() + 24 * 60 * 60 * 1000);
			eventStart = new Date(eventStart.getTime() + 24 * 60 * 60 * 1000);
		}

		if(getStr == "end")
			return eventEnd;
		else
			return eventStart;
	} else {
		var month = parseInt(dateStr.split("/")[0]) - 1;
		var day = parseInt(dateStr.split("/")[1]);
		var year = parseInt(dateStr.split("/")[2]);
		
		if(getStr == "end")
			return new Date(year, month, day, hourEnd, minuteEnd, 0);
		else
			return new Date(year, month, day, hourStart, minuteStart, 0);
	}
}


