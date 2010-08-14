// lugext.js
// main script for the LUG extension
// NOTE: name every function or global variable with a unique prefix,
// since everything is in the same namespace

// Firefox services
const lug_prefs = Components.classes["@mozilla.org/preferences-service;1"]
		  .getService(Components.interfaces.nsIPrefBranch);

// globals
var lug_loadedOptions = false;

const LUG_CUBES   = "extensions.lugext.cubes";
const LUG_CONFIRM = "extensions.lugext.confirm";
const LUG_CEILING = "extensions.lugext.ceiling";
const LUG_METHOD  = "extensions.lugext.method";

// say hello
function lug_hello()
{
  alert("Hello world of Firefox!");
}

// ----- helper functions -----

// returns the value of the argument preference
function lug_getPreference(pref_name)
{
  var pref_type = lug_prefs.getPrefType(pref_name);

  if (pref_type == lug_prefs.PREF_STRING)
      return lug_prefs.getCharPref(pref_name);
  else if (pref_type == lug_prefs.PREF_INT)
      return lug_prefs.getIntPref(pref_name);
  else if (pref_type == lug_prefs.PREF_BOOL)
      return lug_prefs.getBoolPref(pref_name);
  else  // fallback on error
    return lug_prefs.PREF_INVALID;
}

// validates the user-input value for the number to add up to
function lug_validateCeiling()
{
  // get XUL element
  var ceiling_textbox = document.getElementById(LUG_CEILING);
  // get its value
  var ceiling_entered = window.parseInt(ceiling_textbox.value);
  // check for negative
  if (ceiling_entered <= 0) {
    alert("The number to add up to has to be greater than zero!");
    ceiling_textbox.value = lug_getPreference(LUG_CEILING);
  }
}

// formatted alert
function lug_alert(ceiling, sum) 
{
  alert("The sum of numbers 1 to " + ceiling + " is " + sum);
}

// for debugging output to the console
function lug_console(msg) 
{
  var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                         .getService(Components.interfaces.nsIConsoleService);

  consoleService.logStringMessage(msg);
}

// ----- end helper functions -----
 
// performs the calculation and shows an alert with the result
function lug_addThemUp()
{
  // ask for confirmation?
  if (lug_getPreference(LUG_CONFIRM)) {
    var answer = confirm("Do you really want to perform this calculation?");
    if (!answer)
      return;     
  }

  // which way should we do it?
  var ceiling = lug_getPreference(LUG_CEILING);
  var method  = lug_getPreference(LUG_METHOD);
  var sum;
  switch (method) {
    case "hard":
      sum = lug_hardWay(ceiling);
      break;   
    case "easy":
      sum = lug_easyWay(ceiling);
      break;  
    case "map_reduce":
      sum = lug_mapReduceWay(ceiling);
      break;   
    default:
      sum = lug_hardWay(ceiling);
      break;   
  }
  lug_alert(ceiling, sum); 
}

// performs the calculation with a loop
function lug_hardWay(ceiling)
{
  var sum = 0;
  for (var i = 1; i <= ceiling; i++) {
    if (!lug_getPreference(LUG_CUBES))
      sum += i;
    else
      sum += Math.pow(i, 3);
  }

  return sum;
}

// performs the calculation with a mathematical formula
function lug_easyWay(ceiling)
{
  // 1 + .. + N = N(N+1)/2
  var sum = ceiling * (ceiling + 1) /2;

  // 1^3 + .. + N^3 = (N(N+1)/2)^2
  if (lug_getPreference(LUG_CUBES))
    sum = Math.pow(sum, 2);

  return sum;
}

// performs the calculation with map-reduce
function lug_mapReduceWay(ceiling)
{
  // define range() and reduce() functions, which are not found in JavaScript
  function range(upper) { 
    var arr = [];
    for (var i = 0; i < upper; i++)
      arr.push(i);
    return arr;
  }

  function reduce(fun, sequence, init) {
    var result = (typeof(init) != "undefined") ? init : 0;
    for (var i = 0; i < sequence.length; i++)
      result = fun(result, sequence[i]);
    return result;
  }

  // create array of numbers 0..ceiling
  var number_array = range(ceiling + 1);

  // cube the numbers in the array if needed with a map operation
  if (lug_getPreference(LUG_CUBES)) {
    number_array.forEach(
      function (element, index, arr) { arr[index] = Math.pow(element, 3); }
    );
  }
  
  // add up all the numbers in the array with a reduce operation
  var sum = reduce(
    function (sumSoFar, number) { return sumSoFar + number; },
    number_array);

  return sum;
}


