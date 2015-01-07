function initialize(){markers=new Array,mapDiv=document.getElementById("map_canvas"),centerLatLng=new google.maps.LatLng(centerLatitude,centerLangitude),directionsDisplay=new google.maps.DirectionsRenderer,directionsService=new google.maps.DirectionsService;var e={center:centerLatLng,zoom:startZoom,mapTypeId:google.maps.MapTypeId.ROADMAP};myMap=new google.maps.Map(mapDiv,e),directionsDisplay.setMap(myMap),directionsDisplay.setPanel(document.getElementById("routes-result")),createMarker(myMap,centerLatLng,"\u6c5f\u5357\u5927\u5b66")}function searchPlace(){var e=$("#address").val();return""==e?(alert("\u8bf7\u8f93\u5165\u8981\u5b9a\u4f4d\u7684\u5730\u540d\uff01"),!1):(myGeocoder=new google.maps.Geocoder,void(myGeocoder&&myGeocoder.geocode({address:e},function(e,t){t==google.maps.GeocoderStatus.OK?(myResults=e,createPanels(e),focusMarker(0)):alert("\u8c37\u6b4c\u5730\u56fe\u6ca1\u6709\u627e\u5230\u7684\u539f\u56e0\u662f:"+t)})))}function searchNavigation(){var e=document.getElementById("origin").value,t=document.getElementById("destination").value,n={origin:e,destination:t,travelMode:google.maps.TravelMode.TRANSIT,provideRouteAlternatives:!0};directionsService.route(n,function(e,t){t==google.maps.DirectionsStatus.OK?directionsDisplay.setDirections(e):alert(t)})}function createPanels(e){var t=$("#places-result");t.empty();for(var n=0;n<e.length;n++)createPanel(e[n],n)}function createPanel(e,t){var n=e.address_components[t].short_name,a=e.formatted_address,o=$("#places-result"),i='<div id="panel_'+t+'" class="panel panel-primary" style="background-color: #333333" onclick="focusMarker('+t+')"><div class="panel-heading"><h3 class="panel-title" id="title_'+t+'">'+n+'</h3></div><div class="panel-body"><div id="info_'+t+'">'+a+"</div></div></div>";o.append(i)}function toggleBounce(e){e.setAnimation(null!=e.getAnimation()?null:google.maps.Animation.BOUNCE)}function focusMarker(e){myMap.setCenter(myResults[e].geometry.location),createMarker(myMap,myResults[e].geometry.location,myResults[e].address_components[e].short_name)}function createMarker(e,t,n){lastInfWnd&&lastInfWnd.close();var a=1;if(markers.length>0)for(i=0;i<markers.length;i++)markers[i].position==t&&(a=-1);if(1==a){var o=new google.maps.Marker({map:e,position:t,title:n,animation:google.maps.Animation.DROP});markers.push(o),e.setCenter(t),google.maps.event.addListener(o,"click",function(){createInfoWindow(myMap,o),toggleBounce(o)})}}function createInfoWindow(e,t){lastInfWnd&&lastInfWnd.close();var n=(t.position.lat().toFixed(6)+","+t.position.lng().toFixed(6),new google.maps.InfoWindow);n.setContent(t.title),n.open(e,t),lastInfWnd=n}var centerLatitude=31.4829,centerLangitude=120.2776,centerLatLng,startZoom=13,markers,myMap,myGeocoder,myResults,mapDiv,lastInfWnd,directionsDisplay,directionsService,xmlHttp;