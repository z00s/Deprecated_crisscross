/**
 * Created by z00s on 14-4-19.
 */

var centerLatitude = 31.4829;
var centerLangitude = 120.2776;
var centerLatLng;
var startZoom = 13;
//全局变量才能有效果
var markers;            //标记数组
var myMap;              //地图变量
var myGeocoder;         //地理编码服务
var myResults;
var mapDiv;
var lastInfWnd;

var directionsDisplay;
var directionsService;

var xmlHttp;    //ajax
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//初始化
function initialize() {
    markers = new Array();

    mapDiv = document.getElementById("map_canvas");

    //初始化
    centerLatLng = new google.maps.LatLng(centerLatitude, centerLangitude);
    //地图导航
    directionsDisplay = new google.maps.DirectionsRenderer();

    directionsService = new google.maps.DirectionsService();

    var mapOptions = {
        center: centerLatLng,
        zoom: startZoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    myMap = new google.maps.Map(mapDiv,
        mapOptions);
    directionsDisplay.setMap(myMap);
    directionsDisplay.setPanel(document.getElementById("routes-result"));

    createMarker(myMap,centerLatLng,"江南大学");

}

//搜索地址主函数
function searchPlace() {
    //先从输入框中取出要搜的地名
    var address = $("#address").val();

    //检查是否为空
    if ("" == address) {
        alert("请输入要定位的地名！");
        return false;
    } else {
        //
        myGeocoder = new google.maps.Geocoder();

        if (myGeocoder) {
            //解析函数，只传了地址
            myGeocoder.geocode({'address': address}, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    myResults = results;
                    createPanels(results);
                    focusMarker(0);
                } else {
                    alert("谷歌地图没有找到的原因是:" + status);
                }
            });
        }
    }
}
//搜索导航函数
function searchNavigation() {
    //两点
    var origin = document.getElementById("origin").value;
    var destination = document.getElementById("destination").value;

//    alert(origin + "-->" + destination);

    var request = {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.TRANSIT,
        provideRouteAlternatives: true //      返回多条备用线路
    };

    directionsService.route(request, function (result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
//            alert(result.length);
            directionsDisplay.setDirections(result);
        } else {
            alert(status);
        }
    });
}
//显示搜索结果
function createPanels(results) {
    var $pane = $("#places-result");
    $pane.empty();

    for (var i = 0; i < results.length; i++) {

        createPanel(results[i], i);
    }
}
//单列显示结果
function createPanel(result, index) {
    var title = result.address_components[index].short_name;
    var message = result.formatted_address;
    var $pane = $("#places-result");
    var panel = "<div id=\"panel_" + index + "\" class=\"panel panel-primary\" style=\"background-color: #333333\" onclick=\"focusMarker(" + index + ")\">" +
        "<div class=\"panel-heading\">" +
        "<h3 class=\"panel-title\" id=\"title_" + index + "\">" + title + "</h3>" +
        "</div>" +
        "<div class=\"panel-body\">" +
        "<div id=\"info_" + index + "\">" + message + "</div>" +
        "</div>" +
        "</div>";
    $pane.append(panel);
}

//水滴动画特效
function toggleBounce(marker) {
    if (marker.getAnimation() != null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }
}
//锁定标签
function focusMarker(index) {
    myMap.setCenter(myResults[index].geometry.location);
    //对搜索到的这个点进行标注
    createMarker(myMap, myResults[index].geometry.location, myResults[index].address_components[index].short_name);
//    createMarker(currentMap, recvResults[index].geometry.location, '123');
}
//创建标签并存储
function createMarker(map, location, title) {
    //关闭上个信息

    if (lastInfWnd)
        lastInfWnd.close();
    //检测标志
    var flag = 1;

    if (markers.length > 0){
        for (i=0; i<markers.length ; i++){
            if(markers[i].position == location){
                flag = -1;
            }
        }
    }

    if(flag == 1){
        var newMarker = new google.maps.Marker({
            map: map,
            position: location,
            title: title,
//            draggable: true,
            animation: google.maps.Animation.DROP
        });
        markers.push(newMarker);
        //调整中心
        map.setCenter(location);
        //特效监听
        google.maps.event.addListener(newMarker, 'click', function(){

            createInfoWindow(myMap, newMarker);
            toggleBounce(newMarker);
        });
    }
}

//创建提示
function createInfoWindow(map, marker) {
    //关闭上个信息
    if (lastInfWnd)
        lastInfWnd.close();
    //近似
    var coords = marker.position.lat().toFixed(6) + ',' + marker.position.lng().toFixed(6);
    //表格式
    var infoWindow = new google.maps.InfoWindow();
    infoWindow.setContent(marker.title);
    infoWindow.open(map, marker);
    lastInfWnd = infoWindow;
}

;
