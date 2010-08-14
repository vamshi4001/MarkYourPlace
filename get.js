var arr=new Array();
var lines=[];
var Obj={};
var x=document.createElement("div");
	x.setAttribute("id","content");
var page_request = false;
var locs=new Array();

function WriteToFile() {
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	var s = fso.CreateTextFile("test.txt", true);
	s.WriteLine("This is a test");
	s.Close();
}
Obj.make=function(name,la,lo){
		var p={}
		p.name=name;
		p.la=la;
		p.lo=lo;
		return p;
	}
function setLatLon()
{
	var name = document.setLatLon.name.value
	var lat = document.setLatLon.lat.value
	var lon = document.setLatLon.lon.value
	var q=Obj.make(name,lat,lon);
	locs.push(q);
	var generate = "Lat Lon for\"" + name + "\"has been Added" 
	document.setLatLon.generate.value = generate
}

function mapping() {
      if (GBrowserIsCompatible()) {
        var map = new GMap2(document.getElementById("map_canvas"));
        map.setCenter(new GLatLng(17.379299, 78.497314), 5);
        map.setUIToDefault();

	  var bounds = map.getBounds();
        for (var i = 0; i < locs.length; i++) {
          var point = new GLatLng(locs[i].la,locs[i].lo);
          map.addOverlay(new GMarker(point));
		  setLinks();
		}
      }
    }

function setLinks()
{
	var str= "http://maps.google.com/maps/api/staticmap?center=17.379299,78.497314&zoom=5&size=800x512&";
	var end="sensor=false";
	var i;
	for(i=0;i<locs.length;i++){
		str=str+"markers="+locs[i].la+","+locs[i].lo+"&";
	}
	str=str+end;
	document.getElementById("url").value=str;
}
var getContent=function(url){
	
			if (window.XMLHttpRequest) // if Mozilla, Safari etc
			page_request = new XMLHttpRequest()
			else if (window.ActiveXObject){ // if IE
			try {page_request = new ActiveXObject("Msxml2.XMLHTTP")} 
			catch (e){
				try{page_request = new ActiveXObject("Microsoft.XMLHTTP")}	
				catch (e){}}
			}
			else
			return false
			page_request.open('GET', url, false) //get page synchronously 
			page_request.send(null)
			return page_request;	
}
    
var setArrayObject=function(text){
			if (window.location.href.indexOf("http")==-1 || text.status==200)
			x.innerHTML=text.responseText;
			document.body.appendChild(x);
			var n=document.getElementById("name").innerHTML
			var cat=document.getElementById("category").innerHTML
			var lt=document.getElementById("lat").innerHTML
			var ln=document.getElementById("lon").innerHTML
			var q=Obj.make(n,cat,lt,ln);
			arr.push(q);
			x.innerHTML=""
}

var getNames=function(){
	names=new Array();
	for(var i=0;i<arr.length;i++){
	document.write(arr[i].name);
	document.write("<br>");
	}
}

var getLat=function(){
	latitudes=new Array();
	for(var i=0;i<arr.length;i++)
		latitudes.push(arr[i].la);
		return latitudes;
}

var getLong=function(){
	longitudes=new Array();
	for(var i=0;i<arr.length;i++)
		longitudes.push(arr[i].lo);
		return longitudes;
}
