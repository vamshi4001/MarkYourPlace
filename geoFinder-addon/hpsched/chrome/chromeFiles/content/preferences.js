/* 
 * Gain access to the Prefences service.
 */
var prefManager = Components.classes["@mozilla.org/preferences-service;1"]
                            .getService(Components.interfaces.nsIPrefBranch);



/*
 * Called when the preference window loads.  Populates the Schedules List
 * based on the "extensions.hpsched.schedules" preference.
 */
function populateSchedulesList() {
	var prefString = prefManager.getCharPref("extensions.hpsched.schedules");
	if(prefString == "")
		return;

	var schedules = prefString.split(".NEXT.");
	var schedulesList = document.getElementById("schedulesList");

	for (var i=0; i < schedules.length; i++) {
		var pieces = schedules[i].split(".ITEM.");

		var newItem = document.createElement("treeitem");
		var newRow = document.createElement("treerow");
		newItem.appendChild(newRow);

            var date = document.createElement("treecell");
		date.setAttribute("label", pieces[0]);
		newRow.appendChild(date);

	      var start_time = document.createElement("treecell");
		start_time.setAttribute("label", pieces[1]);
		newRow.appendChild(start_time);

	      var end_time = document.createElement("treecell");
		end_time.setAttribute("label", pieces[2]);
		newRow.appendChild(end_time);

 	      var url = document.createElement("treecell");
		url.setAttribute("label", pieces[3]);
		newRow.appendChild(url);

		schedulesList.appendChild(newItem);
      }
}



/*
 * Save the Schedules List to the "extensions.hpsched.schedules" preference.
 * This is called by the pref's system when the GUI element is altered.
 */
function saveSchedulesList() {
	var schedulesList = document.getElementById("schedulesList").childNodes;
	var prefString = "";

	for (var i=0; i < schedulesList.length; i++) {
		var columns = schedulesList[i].childNodes[0].childNodes;
		var str = columns[0].getAttribute("label") + ".ITEM."
                      + columns[1].getAttribute("label") + ".ITEM."
			    + columns[2].getAttribute("label") + ".ITEM."
			    + columns[3].getAttribute("label");
		if(prefString == "")
			prefString = str;
		else
			prefString += ".NEXT." + str;
      }

	/* return the new prefString to be stored by pref system */
	return prefString;
}



/*
 * Populates the edit page with the given info
 */
function populateEdit(date, start, end, locationsStr, editIndexStr) {
	var locations = document.getElementById("locationsField");
	var timeStart = document.getElementById("startTimeField");
	var timeEnd = document.getElementById("endTimeField");
	var dateMonth = document.getElementById("dateMonth");
	var dateDay = document.getElementById("dateDay");
	var dateYear = document.getElementById("dateYear");
	var editIndex = document.getElementById("editIndex");

	editIndex.value = "" + editIndexStr;
	locations.value = "" + locationsStr;

	if(date == "Daily") {
		radioDate("daily", true);
	} else {
		radioDate("once", true);

		var str = date.split("/");
		dateMonth.selectedIndex = parseInt(str[0]) - 1;
		dateDay.selectedIndex = parseInt(str[1]) - 1;
		dateYear.selectedIndex = parseInt(str[2]) - 2005;
	}
	
	timeStart.value = start;
	timeEnd.value = end;
	if(start == "12:00 AM" && end == "11:59 PM")
		radioTime("allday", true);
	else
		radioTime("range", true);

	locations.focus();
}



/*
 * Edits the currently selected schedule
 */
function editSchedule() {
	var schedulesTree = document.getElementById("schedulesTree");
	var selectedIndex = schedulesTree.currentIndex;

	/* Ignore the button if no schedule selected */
	if(selectedIndex == -1)
		return;

	var schedulesList = document.getElementById("schedulesList");
	var entry = schedulesList.childNodes[selectedIndex].childNodes[0].childNodes;

	populateEdit(entry[0].getAttribute("label"),
		       entry[1].getAttribute("label"),
		       entry[2].getAttribute("label"),
		       entry[3].getAttribute("label"),
			 selectedIndex);

	flipView("edit");
}



/*
 * Deletes the currently selected schedule
 */
function deleteSchedule() {
	var schedulesTree = document.getElementById("schedulesTree");
	var index = schedulesTree.currentIndex;

	if(index != -1) {
		var schedulesList = document.getElementById("schedulesList");
		var toRemove = schedulesList.childNodes.item(index);
		schedulesList.removeChild(toRemove);
	      document.getElementById("hpschedPane").userChangedValue(schedulesTree);
	}
}



/*
 * Flips the view from/to informational/edit modes
 */
function flipView(mode) {
	var defaultGroupBox = document.getElementById("defaultGroupBox");
	var schedulesListGroupBox = document.getElementById("schedulesListGroupBox");
	var scheduleEditorGroupBox = document.getElementById("scheduleEditorGroupBox");

	if(mode == "edit") {
		defaultGroupBox.setAttribute("hidden", "true");
		schedulesListGroupBox.setAttribute("hidden", "true");
		scheduleEditorGroupBox.setAttribute("hidden", "false");
	} else {
		defaultGroupBox.setAttribute("hidden", "false");
		schedulesListGroupBox.setAttribute("hidden", "false");
		scheduleEditorGroupBox.setAttribute("hidden", "true");
	}
}



/*
 * Creates a new schedule
 */
function newSchedule() {
	flipView("edit");

	var now = new Date();
	if(now.getHours() == 0)
		start = "12:00 AM";	
	else if(now.getHours() == 12)
		start = "12:00 PM";	
	else if(now.getHours() > 12)
		start = (now.getHours() - 12) + ":00 PM";
	else
		start = now.getHours() + ":00 AM";

	var nextHour = new Date(now.getTime() + 60 * 60 * 1000).getHours();
	if(nextHour == 0)
		end = "12:00 AM";	
	else if(nextHour == 12)
		end = "12:00 PM";	
	else if(nextHour > 12)
		end = (nextHour - 12) + ":00 PM";
	else
		end = nextHour + ":00 AM";

	populateEdit((now.getMonth() + 1)
			 + "/" + now.getDate()
			 + "/" + now.getFullYear(),
			 start, end, "", "");
}



/*
 * Called when a schedule has been created/modified
 */
function saveSchedule() {
	var locations = document.getElementById("locationsField");
	var timeStart = document.getElementById("startTimeField");
	var timeEnd = document.getElementById("endTimeField");
	var dateMonth = document.getElementById("dateMonth");
	var dateDay = document.getElementById("dateDay");
	var dateYear = document.getElementById("dateYear");
	var timeRange = document.getElementById("timeRange");
	var dateOnce = document.getElementById("dateOnce");
	var editIndex = document.getElementById("editIndex");	
	var schedulesList = document.getElementById("schedulesList");

	/* sanity checks, should check times, too */
	if(locations.value == "") {
		alert("You must enter a location!");
		return;
	}

	var newRow = document.createElement("treerow");
	var newItem = document.createElement("treeitem");
	newItem.appendChild(newRow);

      var date = document.createElement("treecell");
	if(dateOnce.selected)
		date.setAttribute("label", 
      	                  (parseInt(dateMonth.value) + 1)
            	            + "/" + dateDay.label
                  	      + "/" + dateYear.label);
	else
		date.setAttribute("label", "Daily");
	newRow.appendChild(date);

	var start_time = document.createElement("treecell");
	if(timeRange.selected)
		start_time.setAttribute("label", timeStart.value);
	else
		start_time.setAttribute("label", "12:00 AM");
	newRow.appendChild(start_time);

	var end_time = document.createElement("treecell");
	if(timeRange.selected)
		end_time.setAttribute("label", timeEnd.value);
	else
		end_time.setAttribute("label", "11:59 PM");
	newRow.appendChild(end_time);

 	var url = document.createElement("treecell");
	url.setAttribute("label", locations.value);
	newRow.appendChild(url);

	if(editIndex.value == "") {
		schedulesList.appendChild(newItem);
	} else {
		var oldItem = schedulesList.childNodes[parseInt(editIndex.value)];
		schedulesList.replaceChild(newItem, oldItem);
	}

	var schedulesTree = document.getElementById("schedulesTree");
      document.getElementById("hpschedPane").userChangedValue(schedulesTree);

	flipView("normal");
}



/*
 * Called when a schedule that has been created/modified is cancelled.
 */
function cancelSchedule() {
	flipView("normal");
}



/*
 * Set To Current Page - allows user to select url based on current locations
 * Code modified from chrome://browser/content/preferences/general.xul.
 */
function setToCurrentPage(element) {
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
				.getService(Components.interfaces.nsIWindowMediator);
	var win = wm.getMostRecentWindow("navigator:browser");
	if (win) {
		var homePageField = document.getElementById(element);
	      var newVal = "";

	      var tabbrowser = win.document.getElementById("content");
      	var l = tabbrowser.browsers.length;
	      for (var i = 0; i < l; i++) {
      	  if (i)
	          newVal += "|";
      	  newVal += tabbrowser.getBrowserAtIndex(i).webNavigation.currentURI.spec;
	      }
      
      	homePageField.value = newVal;
	      document.getElementById("hpschedPane").userChangedValue(homePageField);
	}
}



/*
 * Set To Bookmark button - allows user to select url from bookmarks.
 * Code modified from chrome://browser/content/preferences/general.xul.
 */
function setToBookmark(element) {
	var rv = { url: null };
	document.documentElement.openSubDialog("chrome://browser/content/bookmarks/selectBookmark.xul",
	                                           "resizable", rv);  
	if (rv.url) {
		var homePageField = document.getElementById(element);
		homePageField.value = rv.url;
      	document.getElementById("hpschedPane").userChangedValue(homePageField);
	}
}



/*
 * Set to Blank Page - allows user to set URL to 'about:blank' easily.
 * Code modified from chrome://browser/content/preferences/general.xul.
 */
function setToBlankPage(element) {
	var homePageField = document.getElementById(element);
	homePageField.value = "about:blank";
      document.getElementById("hpschedPane").userChangedValue(homePageField);
}



/*
 * GUI overhead: hides options when 'daily' is selected
 */
function radioDate(dest, select) {
	var a = document.getElementById("dateMonth");
	var b = document.getElementById("dateDay");
	var c = document.getElementById("dateYear");
	var dateChoice = document.getElementById("dateChoice");

	if(dest == "once") {
		a.setAttribute("disabled", "false");
		b.setAttribute("disabled", "false");
		c.setAttribute("disabled", "false");
		if(select) {
			dateChoice.selectedIndex = 0;
		}
	} else {
		a.setAttribute("disabled", "true");
		b.setAttribute("disabled", "true");
		c.setAttribute("disabled", "true");
		if(select) {
			dateChoice.selectedIndex = 1;
		}
	}
}



/*
 * GUI overhead: hides options when 'allday' is selected
 *
 * Firefox bug: disabling and then enabling the textbox doesn't work.
 */
function radioTime(dest, select) {
	var a = document.getElementById("startTimeField");
	var b = document.getElementById("endTimeField");
	var timeChoice = document.getElementById("timeChoice");

	if(dest == "range") {
		/* a.setAttribute("disabled", "false"); */
		/* b.setAttribute("disabled", "false"); */
		if(select) {
			timeChoice.selectedIndex = 0;
		}
	} else {
		/* a.setAttribute("disabled", "true"); */
		/* b.setAttribute("disabled", "true"); */
		if(select) {
			timeChoice.selectedIndex = 1;
		}
	}
}


/*
 * Moves the selected item up/down one place
 */
function move(dir) {
	var schedulesTree = document.getElementById("schedulesTree");
	var index = schedulesTree.currentIndex;

	if(index != -1) {
		var schedulesList = document.getElementById("schedulesList");
		if(dir == "up" && index > 0) {
			var nextIndex = index - 1;
			var top = schedulesList.childNodes[nextIndex];
			var bottom = schedulesList.childNodes[index];
		} else if(dir == "down" && index < schedulesList.childNodes.length - 1) {
			var nextIndex = index + 1;
			var top = schedulesList.childNodes[index];
			var bottom = schedulesList.childNodes[nextIndex];
		} else {
			return;
		}

		var oA = top.childNodes[0].childNodes[0].getAttribute("label");
		var oB = top.childNodes[0].childNodes[1].getAttribute("label");
		var oC = top.childNodes[0].childNodes[2].getAttribute("label");
		var oD = top.childNodes[0].childNodes[3].getAttribute("label");
	
		var iA = bottom.childNodes[0].childNodes[0].getAttribute("label");
		var iB = bottom.childNodes[0].childNodes[1].getAttribute("label");
		var iC = bottom.childNodes[0].childNodes[2].getAttribute("label");
		var iD = bottom.childNodes[0].childNodes[3].getAttribute("label");
			
		top.childNodes[0].childNodes[0].setAttribute("label", iA);
		top.childNodes[0].childNodes[1].setAttribute("label", iB);
		top.childNodes[0].childNodes[2].setAttribute("label", iC);
		top.childNodes[0].childNodes[3].setAttribute("label", iD);

		bottom.childNodes[0].childNodes[0].setAttribute("label", oA);
		bottom.childNodes[0].childNodes[1].setAttribute("label", oB);
		bottom.childNodes[0].childNodes[2].setAttribute("label", oC);
		bottom.childNodes[0].childNodes[3].setAttribute("label", oD);

		schedulesTree.currentIndex = nextIndex;
		schedulesTree.focus();
	      document.getElementById("hpschedPane").userChangedValue(schedulesTree);
	}
}





