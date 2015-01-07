/**
 * Created by z00s on 14-5-3.
 */
var map;
var polyline;
var polylinesArray = [];
//距离标记数组
var lenArray = [];
//默认经纬度  22.786607, 100.977316
var DefaultLat = 22.786607;
var DefaultLng = 100.977316;
//缩放级别
var DefaultZoom = 15; //默认情况下的zoom
var origin;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////
//地图初始化
function initialize() {
    var center = new google.maps.LatLng(DefaultLat, DefaultLng); //设置中心位置

    var myOptions = {
        zoom: DefaultZoom,
        center: center,
        //平移控件
        navigationControl: true,
        //比例尺控件
        scaleControl: true,
        //街道视图控件
        streetViewControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

    //为地图的缩放事件提供监听器
    //当地图缩放级别小于默认缩放级别时回到当前设定缩放级别和原点
    google.maps.event.addListener(map, 'zoom_changed', function () {
        if (this.getZoom() < DefaultZoom) {
//            CreateMarker(DefaultLat, DefaultLng, DefaultZoom);
        }
    });
    getDistance();
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Marker
//////
//距离
function getDistance() {
    google.maps.event.addListener(map, "click", function (event) {
        addMarker(event.latLng);
    });
}
///////////
//添加新标记
function addMarker(location) {
    var icon = "http://labs.google.com/ridefinder/images/mm_20_red.png";
    //标记选项
    var myOptions = {
        position: location,
        draggable: true,
        map: map,
        icon: icon
    };
    marker = new google.maps.Marker(myOptions);

    if (lenArray.length == 0) {
        var icon = "http://www.google.com/mapfiles/dd-start.png";
        marker.setIcon(icon);
        origin = location;
    } else {
        if (lenArray.length >= 2) {
//            marker.setMap(null);
        }
    }

    //双击?
//    google.maps.event.addListener(marker,'click',function(){
//        //放入marker
//        lenArray.push(marker);
//        alert(lenArray.length);
//        //画出路线
//        drawOverlay();
//    });

    //拖动结束事件
    google.maps.event.addListener(marker, 'dragend', function () {
//        lenArray.push(marker);
        drawOverlay();
    });
    lenArray.push(marker);
//    alert(lenArray.length);
    //画出路线
    drawOverlay();
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Overlay
//////////////
//画出路径覆盖层
function drawOverlay() {
    //路线数组
    var flightPlanCoordinates = [];
    //
    //将坐标压入路线数组
    if (lenArray) {
        for (i in lenArray) {
            flightPlanCoordinates.push(lenArray[i].getPosition());
        }
    }
    //路径选项
    var myOptions = {
        path: flightPlanCoordinates,
        map: map,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2
    };
    //返回的一条路线
    polyline = new google.maps.Polyline(myOptions);
    //清除原有折线路径
    if (polylinesArray) {
        for (i in polylinesArray) {
            polylinesArray[i].setMap(null);
        }
        polylinesArray = [];
    }
    //在屏幕显示
    polyline.setMap(map);

//    document.getElementById("sRes").innerHTML =(polyline.getLength()/1000).toFixed(3);
    //路线数组
    polylinesArray.push(polyline);
    //Calculate polyline
    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
        {
//            origins: [origin],
            origins: flightPlanCoordinates,
            destinations: flightPlanCoordinates,
            travelMode: google.maps.TravelMode.DRIVING,
            avoidHighways: false,
            avoidTolls: false
        }, callback);
}
////////////////
// 删除所有叠加物
function deleteOverlays() {
    //清除所有markers
    if (lenArray) {
        for (i in lenArray) {
            lenArray[i].setMap(null);
        }
        lenArray.length = 0;
    }

    //清除原有折线路径
    if (polylinesArray) {
        for (i in polylinesArray) {
            polylinesArray[i].setMap(null);
        }
        polylinesArray = [];
    }
    //显示面板
    var $pane = $("#result-calculate");
    //更新清空
    $pane.empty();
    $("#sum-distance").text("");
    $("#sum-duration").text("");
//    document.getElementById("sRes").innerHTML="0.000";
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Calculate
/////////////////////
function callback(response, status) {
    if (status == google.maps.DistanceMatrixStatus.OK) {
        //
        var origins = response.originAddresses;
        var destinations = response.destinationAddresses;

//        for (var i = 0; i < origins.length; i++) {
//            var results = response.rows[i].elements;
//            for (var j = 0; j < results.length; j++) {
//                var element = results[j];
//                var distance = element.distance.text;
//                var duration = element.duration.text;
//                var from = origins[i];
//                var to = destinations[j];
//                alert("起点"+i+"："+from+"重点"+j+"："+to+"用时："+duration+"路程："+distance)
//            }
//        }
        //显示子路线数目
        var len = origins.length - 1;
        //显示面板
        var $pane = $("#result-calculate");
        //更新清空
        $pane.empty();
        //重新计算
        var distanceSum = 0;
        var durationSum = 0;
        for (var i = 0; i < len; i++) {
            var results = response.rows[i].elements;
            //
            var j = i + 1;
            var element = results[j];
            var distance = element.distance.text;
            var duration = element.duration.text;
            var from = origins[i];
            var to = destinations[j];
            distanceSum += distance;
            durationSum += duration;
//                alert("起点"+i+"："+from+"重点"+j+"："+to+"用时："+duration+"路程："+distance);
//                str= str+'起点'+i+'：'+from+'重点'+j+'：'+to+'用时：'+duration+'路程：'+distance+'\n';

            var panel = "<div id=\"panel_" + j + "\" class=\"panel panel-primary\" onclick=\"focusMarker(" + j + ")\">" +
                "<div class=\"panel-heading\">" +
                "<h3 class=\"panel-title\" id=\"title_" + j + "\">子路线" + j + "</h3>" +
                "</div>" +
                "<div class=\"panel-body\">" +
                "<div id=\"info_" + j + "\">" +
                "起点" + '：' + from + "<br>" +
                '终点' + '：' + to + "<br>" +
                '用时：' + duration + "<br>" +
                '路程：' + distance +
                "</div>" +
                "</div>" +
                "</div>";
            $pane.append(panel);
        }
//        alert($("#result-calculate").);
        $("#sum-distance").text(distanceSum);
        $("#sum-duration").text(durationSum);

//        $("#result-calculate").text(str);
//        $("#result-calculate").val().replace(/\n/g,"<br/>");
    } else {
        alert(status);
    }
}