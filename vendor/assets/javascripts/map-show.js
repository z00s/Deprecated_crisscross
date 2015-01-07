/**
 * Created by z00s on 14-5-2.
 */
/**
 * Created by z00s on 14-4-20.
 */
var centerLatitude = 31.4829;
var centerLangitude = 120.2776;
var centerLatLng;
var startZoom = 13;
//地图元素全局变量

var markers;        //标记数组
var lastInfWnd;     //上一个提示框
var currentMap;     //当前地图变量
var geocoder;       //地理编码服务
//显示辅助元素
var recvResults;    //搜索地址结果显示集合
var mapDiv;         //地图显示Div
//工具元素
var directionsDisplay;  //路线显示google自带
var directionsService;  //导航服务

//var xmlHttp;    //ajax


//var infoWindow;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//初始化
function initialize() {
//    初始化
    markers = new Array();

//    检查这张地图所有的标签并添加

    mapDiv = document.getElementById("map_canvas");
//    焦点
    centerLatLng = new google.maps.LatLng(centerLatitude, centerLangitude);

//    地图参数
    var mapOptions = {
        center: centerLatLng,
        zoom: startZoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
//    新建地图
    currentMap = new google.maps.Map(mapDiv,
        mapOptions);


//    添加这张地图所有的标签
    setAllMarkers(currentMap, getCurrentMapID());

}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//显示功能
/////////////
//水滴动画特效
function toggleBounce(marker) {
    if (marker.getAnimation() != null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//marker操作
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
            } else {
                alert("对不起，获取信息失败！");
            }

        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert("崩溃了!!!");
            alert(thrownError);
        }
    });
}
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
//////////////////////
//创建不带form的infoWnd
function createNormalInfoWnd(map, marker, currentMapId, info) {
    //    关闭上个信息
    if (lastInfWnd)
        lastInfWnd.close();
    var infoWindow = new google.maps.InfoWindow();

    var showInfo = $('<div >' +
        '<h6 class="page-header" style="margin: 0px">' + info.marker.title + '</h4>' +
         info.marker.desc +
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
