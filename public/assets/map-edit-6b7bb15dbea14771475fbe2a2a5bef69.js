/**
 * Created by z00s on 14-4-20.
 */

var centerLatitude = 31.4829;
var centerLangitude = 120.2776;
var centerLatLng;
var startZoom = 13;
var map;

//缩放级别
var DefaultZoom = 15; //默认情况下的zoom

//地图元素全局变量


var markers;        //标记数组
var lastInfWnd;     //上一个提示框
var currentMap;     //当前地图变量
var geocoder;       //地理编码服务
//显示辅助元素
var recvResults;    //搜索地址结果显示集合
var mapDiv;         //地图显示Div
var lenArray = [];      //距离marker数组
var origin;
//工具元素
var directionsDisplay;  //路线显示google自带
var directionsService;  //导航服务
var polyline;           //Gmap返回路线
var polylinesArray = [];//路线数组


//var xmlHttp;    //ajax


//var infoWindow;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//初始化
function initialize() {
//    初始化
    markers = new Array();
    recvResults = new Array();
//    检查这张地图所有的标签并添加

    mapDiv = document.getElementById("map_canvas");
//    焦点
    centerLatLng = new google.maps.LatLng(centerLatitude, centerLangitude);
//    地图导航显示
    directionsDisplay = new google.maps.DirectionsRenderer();
//    地图导航服务
    directionsService = new google.maps.DirectionsService();
//    地图参数
    var mapOptions = {
        center: centerLatLng,
        zoom: startZoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
//    新建地图
    currentMap = new google.maps.Map(mapDiv,
        mapOptions);

//  设置
    directionsDisplay.setMap(currentMap);
//    导航显示位置的设置
    directionsDisplay.setPanel(document.getElementById("result-routes"));
//    初始标签位置
    setAllMarkers(currentMap, getCurrentMapID());

//    currentMap.setCenter(markers[0].position);

    showMap();
//    左键单击监听
    google.maps.event.addListener(currentMap, 'click', function (event) {
        createMarker(currentMap, event.latLng, '我的标签');
    });


}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//地图功能
//////////////
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
        geocoder = new google.maps.Geocoder();

        if (geocoder) {
            //解析函数，只传了地址
            geocoder.geocode({'address': address}, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    //  数组存latlng                               字符转化            去符号         以逗号分2部分
//                    var GeoCode = ((recvResults[0].geometry.location).toString().replace(/[()]/g, '')).split(",", 2);
//                    var lat = parseFloat(GeoCode[0]);//纬度
//                    var lng = parseFloat(GeoCode[1]);//经度
//                    var mylatlng = new google.maps.LatLng(lat, lng);
//                    currentMap.setCenter(mylatlng);
                    recvResults = results;

                    createPanels(recvResults);
                    focusMarker(0);


                } else {
                    alert("谷歌地图没有找到的原因是:" + status);
                }
            });
        }
    }
}
/////////////
//搜索导航函数
function searchNavigation() {
    //两点
    var origin = document.getElementById("origin").value;
    var destination = document.getElementById("destination").value;

    alert(origin + "-->" + destination);

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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//显示功能
/////////////
//显示搜索结果
function createPanels(results) {
    alert(results.length);
    var $pane = $("#result-places");

    $pane.empty();
    for (var i = 0; i < results.length; i++) {

       createPanel(results[i], i);
    }
}
/////////////
//单列显示结果
function createPanel(result, index) {
//    alert(i);
    var title = result.address_components[index].short_name;
    var message = result.formatted_address;
    var $pane = $("#result-places");
    var panel = "<div id=\"panel_" + index + "\" class=\"panel panel-primary map——theme\" onclick=\"focusMarker(" + index + ")\">" +
        "<div class=\"panel-heading\">" +
        "<h3 class=\"panel-title\" id=\"title_" + index + "\">" + title + "</h3>" +
        "</div>" +
        "<div class=\"panel-body\">" +
        "<div id=\"info_" + index + "\">" + message + "</div>" +
        "</div>" +
        "</div>";
    $pane.append(panel);
}
/////////////
//水滴动画特效
function toggleBounce(marker) {
    if (marker.getAnimation() != null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }
}
////////////
//锁定标签特效
function focusMarker(index) {
    currentMap.setCenter(recvResults[index].geometry.location);
    //对搜索到的这个点进行标注
//    myMarker.setPosition(recvResults[index].geometry.location);
//    myMarker.setTitle(recvResults[index].address_components[index].short_name);
    createMarker(currentMap, recvResults[index].geometry.location, recvResults[index].address_components[index].short_name);
//    infowindow = new google.maps.InfoWindow({
//        content: recvResults[index].formatted_address
//    });
//    infowindow.open(currentMap,myMarker);
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//测距功能
function distPrepare(){
//    alert("distPrepare");

    var $div = $("#dist-button");
    $div.empty();
    var buttonList = "" +
        "<input type='button' class='btn btn-primary' id='cancel-dist' onclick='cancelDist();' value='退出测距' class='inputBtn' />" +
        "<input type='button' class='btn btn-danger' id='del-route' onclick='deleteOverlays();' value='清除标记' class='inputBtn' /><br>" +
        "估计距离：<span id='sum-distance'></span><br>" +
        "估计用时：<span id='sum-duration'></span><br>" +
//        "估计用时：<span id=‘sum-duration’></span><br>" +
        "<div id='result-calculate'></div>"+
        "";
    $div.append(buttonList);
    getDistance();
}
function cancelDist(){
    var $div = $("#dist-button");
    $div.empty();
    var buttonList = "" +
        "<input type='button' class='btn btn-info' id='cal-dist' onclick='distPrepare();' value='测距' class='inputBtn' /><br>" +
        "";
    $div.append(buttonList);
    //清页面
    deleteOverlays();
    //清空之前的左键监听，禁止创建可保存标签
    google.maps.event.clearListeners(currentMap, 'click');
    //    左键单击监听
    google.maps.event.addListener(currentMap, 'click', function (event) {
        createMarker(currentMap, event.latLng, '我的标签');
    });
}
//距离
function getDistance() {
    //清空之前的左键监听，禁止创建可保存标签
    google.maps.event.clearListeners(currentMap, 'click');
    //创建测距监听
    google.maps.event.addListener(currentMap, "click", function (event) {
        addDistMarker(event.latLng);
    });
}
///////////
//添加新标记
function addDistMarker(location) {
    var icon = "http://labs.google.com/ridefinder/images/mm_20_red.png";
    //标记选项
    var myOptions = {
        position: location,
        draggable: true,
        map: currentMap,
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
/////////////////////////////////////////////////////////
//测距显示功能
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
        map: currentMap,
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
    polyline.setMap(currentMap);

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
/////////////////////////////////////////////////
//测距计算功能
////////////
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
            var distance = element.distance.value;
            var duration = element.duration.value;
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


//        $("#sum-duration").text(durationSum);

//        $("#result-calculate").text(str);
//        $("#result-calculate").val().replace(/\n/g,"<br/>");
    } else {
        alert(status);
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//marker操作
/////////////////
//创建marker并存储
function createMarker(map, location, title) {
//    关闭上个信息
    if (lastInfWnd)
        lastInfWnd.close();
//    检测标志
    var flag = 1;
//    检测当前位置是否存在于已经显示的标签库
    if (markers.length > 0) {
        for (i = 0; i < markers.length; i++) {
            if (markers[i].position == location) {
                //标签已经显示，设为-1不添加标签
                flag = -1;
            }
        }
    }

    if (flag == 1) {
        var newMarker = new google.maps.Marker({
            map: map,
            position: location,
            title: title,
            draggable: true,
            animation: google.maps.Animation.DROP
        });
        markers.push(newMarker);
        //调整中心
        map.setCenter(location);
        //特效监听
        google.maps.event.addListener(newMarker, 'click', function () {

            //创建标注
            createInfoWindow(currentMap, newMarker);

            //设置特效
            toggleBounce(newMarker);
        });
//        右击删除显示
        google.maps.event.addListener(newMarker, 'rightclick', function () {
            removeMarker(newMarker, null, getCurrentMapID());
        });
    }
}
///////////////
//保存marker操作
function saveMarker(map, title, desc, marker, currentMapId) {
    var lat = marker.position.lat().toFixed(6);
    var lng = marker.position.lng().toFixed(6);

    var saveData = {
        "marker": {
            map_id: currentMapId,
            title: title,
            desc: desc,
            lat: lat,
            lng: lng
        }
    };
    $.ajax({
        type: "POST",
        url: "/markers",
        data: saveData,
        dataType: 'json',
        success: function (data) {
//            检测success
            var success = data.success;
            if (success) {
//                成功 创建显示标签,显示信息
                marker.setDraggable(false);
                var recvInfo = data;
                createNormalInfoWnd(map, marker, currentMapId, data);
            } else {
//                提示错误信息
                alert(data.content);
            }


        },
        error: function (xhr, ajaxOptions, thrownError) {
//            提示保存失败
            alert("保存失败！稍后重试！");
//            alert(thrownError);
        }
    });
}
///////////////
//删除marker操作
function removeMarker(marker, infoWnd, currentMapId) {
//1. 从js中删除
    //检测删除标签
    for (i = 0; i < markers.length; i++) {
        if (markers[i].position == marker.position) {
            //从js数组中删除
            markers.splice(i, 1);
        }
    }
    //infond一并删除
    if (infoWnd != null) {
        infoWnd.close();
    } else {
        //右击时候关闭上个信息，防止用户创建infoWnd后，右击删除marker
        if (lastInfWnd)
            lastInfWnd.close();
    }

//2. 检测并从数据库将标签删除
    //如果可以拖动说明不是固定标签
    // 没有存入数据库
    if (marker.getDraggable()) {
        alert("invoke");
//2.1    可以移动还没存入数据库，从页面中删除
        marker.setMap(null);
    } else {
        var lat = marker.position.lat().toFixed(6);
        var lng = marker.position.lng().toFixed(6);

        var deleteData = {
            del: 'true',
            map_id: currentMapId,
            lat: lat,
            lng: lng
        };
        $.ajax({
            type: "DELETE",
            url: "/markers/destroy",
            data: deleteData,
            dataType: 'json',
            success: function (data) {
//2.2    不可以移动，已经存入数据库，从页面中删除
                marker.setMap(null);
                alert("删除成功！");
//                alert(data);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert("删除失败！");
//                alert(thrownError);
            }
        });
    }
}
/////////////////////////
//显示当前地图已经存储的标签
function setAllMarkers(map, currentMapId) {
    var mapData = {
        "map": {
            map_id: currentMapId
        }
    };
    $.ajax({
        type: "POST",
        url: "/maps/find_markers",
        data: mapData,
        dataType: 'json',
        success: function (data) {
//            检测success
            var success = data.success;
            if (success) {
//                成功 依次创建显示标签,显示信息
                for (i = 0; i < data.markers.length; i++) {
                    var newLatLng = new google.maps.LatLng(data.markers[i].lat, data.markers[i].lng);
                    var title = data.markers[i].title;
                    createMarker(map, newLatLng, title);
                }
//                    设置全部不可移动
                for (i = 0; i < markers.length; i++) {
                    markers[i].setDraggable(false);
                }
                if (markers.length != 0){
                    //设置中心
                    map.setCenter(markers[0].position);
                }
            } else {
//                提示错误信息
                alert(data.content);
            }


        },
        error: function (xhr, ajaxOptions, thrownError) {
//            提示保存失败
            alert("保存失败！稍后重试！");
//            alert(thrownError);
        }
    });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//infoWnd操作
/////////////
//创建infoWnd
function createInfoWindow(map, marker) {
    var lat = marker.position.lat().toFixed(6);
    var lng = marker.position.lng().toFixed(6);

    var currentMapId = getCurrentMapID();
    var checkData = {
        "marker": {
            map_id: currentMapId,
            lat: lat,
            lng: lng
        }
    };
    $.ajax({
        type: "POST",
        url: "/maps/check_marker",
        data: checkData,
        dataType: 'json',
        success: function (data) {
//            alert("成功与服务器校验");
            if (data.success) {
//                    创建不带form的提示
                marker.setDraggable(false);
                var recvInfo = data;
                createNormalInfoWnd(map, marker, currentMapId, recvInfo);
//                alert("had created");
            } else {
//                    创建带form的提示
                createFormInfoWnd(map, marker, currentMapId);
//                alert("creating");
            }

        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert("崩溃了!!!");
            alert(thrownError);
        }
    });
}
//////////////////////////
//创建不带form的infoWnd
function createNormalInfoWnd(map, marker, currentMapId, info) {
    //    关闭上个信息
    if (lastInfWnd)
        lastInfWnd.close();
    var infoWindow = new google.maps.InfoWindow();

    var showInfo = $('<div >' +
        '<h6 class="page-header" style="margin: 0px">我的标签</h4>' +
        '<table class="table-responsive">' +
        '<tr><td>标题:</td>       <td>' + info.marker.title + '</td> </tr>' +
//        '<tr><td>经维度:</td>     <td><input class="coords" type="text" value = ' + coords + ' id="loc"></td> </tr>' +
        '<tr><td>描述内容:</td>   <td> ' + info.marker.desc + '</td> </tr>' +
//        '<tr><td>添加图片</td>    <td><input class="img" type="text img" id="img"/></td> </tr>' +
        '<tr><td></td>' +
        '<td>' +
//                '<input class="btn btn-primary edit-marker" type="button" value="编辑"/>' +
        '<input class="btn btn-danger remove-marker" type="button" value="删除标签"/>' +
        '</td></tr>' +
        '</table>' +
        '</div>');

    infoWindow.setContent(showInfo[0]);
    infoWindow.open(map, marker);
    lastInfWnd = infoWindow;

    var removeBtn = showInfo.find('input.remove-marker')[0];
//        删除监听
    google.maps.event.addDomListener(removeBtn, "click", function (event) {
        removeMarker(marker, infoWindow, getCurrentMapID());
    });
}
/////////////////////
//创建带form的infoWnd
function createFormInfoWnd(map, marker, currentMapId) {
    //    关闭上个信息
    if (lastInfWnd)
        lastInfWnd.close();

    //近似
    var coords = marker.position.lat().toFixed(6) + ',' + marker.position.lng().toFixed(6);
    //表格式
    var showInfo = $('<div >' +
        '<h6 class="page-header" style="margin: 0px">添加标记</h4>' +
        '<table class="table-responsive">' +
        '<tr><td>标题:</td>       <td><input class="title" type="text" id="title" placeholder="标题"/> </td> </tr>' +
//        '<tr><td>经维度:</td>     <td><input class="coords" type="text" value = ' + coords + ' id="loc"></td> </tr>' +
        '<tr><td>描述内容:</td>   <td><textarea class="desc" rows="3" id="desc" placeholder="内容"/></td> </tr>' +
//        '<tr><td>添加图片</td>    <td><input class="img" type="text img" id="img"/></td> </tr>' +
        '<tr><td></td>           <td><input class="btn btn-primary save-marker" type="button" value="标记"/>' +
        '<input class="btn btn-danger remove-marker" type="button" value="删除标签"/></td></tr>' +
        '</table>' +
        '</div>');


    var infoWindow = new google.maps.InfoWindow();
    infoWindow.setContent(showInfo[0]);
    infoWindow.open(map, marker);
    lastInfWnd = infoWindow;

//        jquery语法
    var saveBtn = showInfo.find('input.save-marker')[0];
    var removeBtn = showInfo.find('input.remove-marker')[0];
//        dom监听
    if (typeof saveBtn !== 'undefined') {
        google.maps.event.addDomListener(saveBtn, "click", function (event) {
            //取值
            var title = showInfo.find('input.title')[0].value;
            var desc = showInfo.find('textarea.desc')[0].value;
            saveMarker(map, title, desc, marker, currentMapId);
        });
    }
//        删除监听
    google.maps.event.addDomListener(removeBtn, "click", function (event) {
        removeMarker(marker, infoWindow, getCurrentMapID());
    });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function validate() {
    alert(document.getElementById("username").value);
    alert(document.getElementById("password").value);
    alert(document.getElementById("check").value);
}
//zoom改变
function t(infowindow) {
    google.maps.event.addListener(currentMap, 'zoom_changed', function () {
        var zoomLevel = map.getZoom();
//        map.setCenter(centerLatLng);
        infowindow.setContent('Zoom: ' + zoomLevel);
    });
}
//closure
function attachMessage(myMarker) {
    var message = "This is a secret message!";
    var infowindow = new google.maps.InfoWindow({
        content: message,
        size: new google.maps.Size(50, 50)
    });
    google.maps.event.addListener(myMarker, 'click', function () {
        infowindow.open(currentMap, myMarker);
    });
}
;
