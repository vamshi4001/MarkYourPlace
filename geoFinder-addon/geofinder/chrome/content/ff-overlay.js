geofinder.onFirefoxLoad = function(event) {
  document.getElementById("contentAreaContextMenu")
          .addEventListener("popupshowing", function (e){ geofinder.showFirefoxContextMenu(e); }, false);
};

geofinder.showFirefoxContextMenu = function(event) {
  // show or hide the menuitem based on what the context menu is on
  document.getElementById("context-geofinder").hidden = gContextMenu.onImage;
};

window.addEventListener("load", geofinder.onFirefoxLoad, false);
