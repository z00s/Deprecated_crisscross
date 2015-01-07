var centerLatitude = 31.4829;
var centerLangitude = 120.2776;
var centerLatLng;
var startZoom = 13;
//全局变量才能有效果
var markers; //标记数组
var myMap;    //地图变量
var myGeocoder;   //地理编码服务
var myResults;
var mapDiv;
//var infoWindow;
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
//    directionsDisplay.setPanel(document.getElementById("descPanel"));
    directionsDisplay.setPanel(document.getElementById("routes-result"));
//    createMarker(currentMap,centerLatLng,"江南大学");
    google.maps.event.addListener(myMap, 'click', function (event) {
        createMarker(myMap, event.latLng, '123');

    });
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//创建标签并存储
function createMarker(map, location, title) {
    //关闭上个信息
    if (lastInfWnd)
        lastInfWnd.close();
    //检测标志
    var flag = 1;
    alert(flag);
    if (markers.length > 0){
        for (i=0; i<markers.length ; i++){
            if(markers[i].position == location){
                flag = -1;
                alert(flag);
            }
        }
    }

    if(flag == 1){
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
        google.maps.event.addListener(newMarker, 'click', function(){
            createInfoWindow(myMap, newMarker);
            toggleBounce(newMarker);
        });
        google.maps.event.addListener(newMarker, 'rightclick', function(){
            removeMarker(newMarker,null);
        });
    }


    alert(markers.length);

//    map.openInfoWindow(location,inputForm);
}
//创建提示
function createInfoWindow(map, marker) {
    //近似
    var coords = marker.position.lat().toFixed(6) + ',' + marker.position.lng().toFixed(6);
    //表格式
    var inputForm = $('<div >' +
    '<h6 class="page-header" style="margin: 0px">添加标记</h4>' +
    '<table class="table-responsive">' +
    '<tr><td>标题:</td>       <td><input class="title" type="text" id="title" placeholder="标题"/> </td> </tr>' +
    '<tr><td>经维度:</td>     <td><input class="coords" type="text" value = ' + coords + ' id="loc"></td> </tr>' +
    '<tr><td>描述内容:</td>   <td><textarea class="desc" rows="3" id="desc" placeholder="内容"/></td> </tr>' +
    '<tr><td>添加图片</td>    <td><input class="img" type="text img" id="img"/></td> </tr>' +
    '<tr><td></td>           <td><input class="btn btn-primary save-marker" type="button" value="标记"/>' +
        '<input class="btn btn-danger remove-marker" type="button" value="取消"/></td></tr>' +
    '</div>');

    //jquery
//    var inputForm = $(
//        '<form class="form-horizontal" action="#" role="form">' +
//        '<div class="form-group">' +
//        '<label for="m[title]" class="col-sm-2 control-label sr-only">标题</label>' +
//        '<div class="col-sm-10">' +
//        '<input type="text" class="form-control col-sm-offset-2 title" id="inputEmail3" placeholder="标题">' +
//        '</div>' +
//        '</div>' +
//        '<div class="form-group">' +
//        '<label for="m[desc]" class="col-sm-2 control-label sr-only">内容</label>' +
//        '<div class="col-sm-10">' +
//        '<textarea class="form-control col-sm-offset-2 desc" rows="3" id="m[desc]" placeholder="内容"></textarea>' +
//        '</div>' +
//        '</div>' +
//        '<div class="form-group">' +
//        '<div class="col-sm-offset-2 col-sm-10">' +
//        '<button type="button" class="btn btn-primary save-marker" ">标记</button>' +
//        '<button type="button" class="btn btn-danger remove-marker">取消标记</button>' +
//        '</div>' +
//        '</div>' +
//        '</form>'
//        );

    var infoWindow = new google.maps.InfoWindow();

    infoWindow.setContent(inputForm[0]);


    infoWindow.open(map, marker);

    lastInfWnd = infoWindow;
    //jquery语法
    var saveBtn = inputForm.find('input.save-marker')[0];
    var removeBtn = inputForm.find('input.remove-marker')[0];
    //dom监听
    if (typeof saveBtn !== 'undefined') {
        google.maps.event.addDomListener(saveBtn, "click", function (event) {
            //取值
            var title = inputForm.find('input.title')[0].value;
            var desc = inputForm.find('textarea.desc')[0].value;
            saveMarker(title, desc, marker);
        });
    }
    google.maps.event.addDomListener(removeBtn, "click", function (event) {
        removeMarker(marker, infoWindow);
    });

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//保存
function saveMarker(title, desc, marker) {
    alert("you click save!");
    var mLatLng = marker.getPosition().toUrlValue();
    alert(mLatLng);
//    var myData = {
//        "marker": {
//            title: title,
//            desc: desc,
//            position: mLatLng
//        }
//    };
//    $.ajax({
//        type: "POST",
//        url: "/markers/saveMarker",
//        data: myData,
//        success: function (data) {
////            marker.setMap(null);
//            alert(data);
//            //解析json
//            var res = eval("(" + data + ")");
//            alert(res);
//            var content = res.content;
//            lastInfWnd.setContent(content);
//            alert(content);
//        },
//        error: function (xhr, ajaxOptions, thrownError) {
//            alert("Error");
//            alert(thrownError);
//        }
//    });
}
//remove
function removeMarker(marker, infoWnd) {

    alert(marker.position);
    for (i=0; i<markers.length ; i++){
        if(markers[i].position = marker.position){
            markers.splice(i,1);
            alert(markers.length);
        }
    }
    if (infoWnd != null) {
        infoWnd.close();
    }
    if (marker.getDraggable) {
        marker.setMap(null);
    } else {
        var mLatLng = marker.getPosition().toUrlValue();
        var myData = {
            del: 'true',
            latLng: mLatLng
        };
        $.ajax({
            type: "POST",
            url: "",
            data: myData,
            success: function (data) {
                marker.setMap(null);
                alert(data);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert(thrownError);
            }
        });
    }


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
                    alert(address);
                    //  数组存latlng                               字符转化            去符号         以逗号分2部分
//                    var GeoCode = ((recvResults[0].geometry.location).toString().replace(/[()]/g, '')).split(",", 2);
//                    var lat = parseFloat(GeoCode[0]);//纬度
//                    var lng = parseFloat(GeoCode[1]);//经度
//                    var mylatlng = new google.maps.LatLng(lat, lng);
//                    currentMap.setCenter(mylatlng);
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
    var $pane = $("#result");
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
//    myMarker.setPosition(recvResults[index].geometry.location);
//    myMarker.setTitle(recvResults[index].address_components[index].short_name);
    createMarker(myMap,myResults[index].geometry.location, myResults[index].address_components[index].short_name);
//    infowindow = new google.maps.InfoWindow({
//        content: recvResults[index].formatted_address
//    });
//    infowindow.open(currentMap,myMarker);
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function validate() {
    alert(document.getElementById("username").value);
    alert(document.getElementById("password").value);
    alert(document.getElementById("check").value);
}
//zoom改变
function t(infowindow) {
    google.maps.event.addListener(myMap, 'zoom_changed', function () {
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
        infowindow.open(myMap, myMarker);
    });
}