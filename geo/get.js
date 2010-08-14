var arr=new Array();
var lines=[];
var Obj={};
var x=document.createElement("div");
	x.setAttribute("id","content");
var page_request = false;
var locs=new Array();
locs=[{name:"Sreenidhi", la:"17.456649", lo:"78.667431"}, {name:"Narayanamma", la:"17.402812", lo:"78.410733"}, {name:"Narayanamma", la:"16.552455", lo:"-95.677068"}, {name:"Sri vishnu", la:"16.546045", lo:"81.530410"}, {name:"Arjun College of technology & sciences", la:"17.325972", lo:"78.586235"}, {name:"Bharat Institute", la:"17.206842", lo:"78.600311"}, {name:"DVR College", la:"17.573623", lo:"78.110905"}, {name:"GRIET", la:"17.520265", lo:"78.367538"}, {name:"Sree Vasavi, tadepalligudem", la:"16.857689", lo:"81.496925"}, {name:"Sree Kavitha Engineering College", la:"17.516205", lo:"80.285339"}, {name:"VNR", la:"17.539613", lo:"78.386464"}, {name:"Nalla Malla Reddy", la:"17.406317", lo:"78.621340"}, {name:"CVR College of Engineering", la:"17.196205", lo:"78.598166"}, {name:"MLR IT", la:"17.588874", lo:"78.442383"}, {name:"Vignan Engineering College", la:"16.232124", lo:"80.547895"}];


function mapping() {
      if (GBrowserIsCompatible()) {
        var map = new GMap2(document.getElementById("map_canvas"));
        map.setCenter(new GLatLng(17.379299, 78.497314), 5);
        map.setUIToDefault();

	  var bounds = map.getBounds();
        for (var i = 0; i < locs.length; i++) {
          var point = new GLatLng(locs[i].la,locs[i].lo);
          map.addOverlay(new GMarker(point));

		}
      }
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
