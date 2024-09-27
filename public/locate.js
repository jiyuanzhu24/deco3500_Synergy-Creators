     // 地图初始化函数
     var map, userPosition;
    
     function initMap() {
         // 创建地图实例，初始中心点设置为一个默认位置
         map = new google.maps.Map(document.getElementById('map'), {
             zoom: 15,
             center: {lat: -34.397, lng: 150.644}
         });
         
         // 检查浏览器是否支持 Geolocation API
         if (navigator.geolocation) {
             // 使用 Geolocation API 获取用户当前位置
             navigator.geolocation.getCurrentPosition(function(position) {
                 // 获取到的用户位置
                 userPosition = {
                     lat: position.coords.latitude,
                     lng: position.coords.longitude
                 };
                 
                 // 设置地图中心为用户当前位置
                 map.setCenter(userPosition);
                 
                 // 在用户位置添加一个标记
                 new google.maps.Marker({
                     position: userPosition,
                     map: map
                 });
                 
             }, function() {
                 // 处理定位失败的情况
                 handleLocationError(true, map.getCenter());
             });
         } else {
             // 浏览器不支持 Geolocation API
             handleLocationError(false, map.getCenter());
         }
 
         // 设置搜索按钮点击事件
         document.getElementById('search-button').addEventListener('click', function() {
             if (userPosition) {
                 findNearbyGardenToolsStores(userPosition, map);
             }
         });
     }
     
     // 处理定位失败的函数
     function handleLocationError(browserHasGeolocation, pos) {
         console.error(browserHasGeolocation ?
                       'Error: The Geolocation service failed.' :
                       'Error: Your browser doesn\'t support geolocation.');
     }
 
     // 查找附近园艺工具商店的函数
     function findNearbyGardenToolsStores(position, map) {
         // 创建PlacesService实例
         var service = new google.maps.places.PlacesService(map);
     
         // 使用nearbySearch方法查找"Garden Tools Store"
         service.nearbySearch({
             location: position,  // 用户的位置
             radius: 500000,  // 查找半径，单位：米
             keyword: 'Garden Tools Store'  // 指定关键词
         }, function(results, status) {
             if (status === google.maps.places.PlacesServiceStatus.OK) {
                 // 清空之前的搜索结果
                 var ul = document.getElementById('places-list');
                 ul.innerHTML = ''; // 清除之前的搜索结果
 
                 // 如果查找成功，status会返回OK
                 for (var i = 0; i < results.length; i++) {
                     addPlaceToList(results[i]);
                     // 在地图上添加标记
                     new google.maps.Marker({
                         position: results[i].geometry.location,
                         map: map,
                         title: results[i].name
                     });
                 }
             } else {
                 console.log('Search was unsuccessful due to: ' + status);
             }
         });
     }
 
     // 将找到的商店添加到结果列表中
     function addPlaceToList(place) {
         var ul = document.getElementById('places-list');
         var li = document.createElement('li');
         li.textContent = place.name + ' - ' + place.vicinity; // 商店名称和位置
         ul.appendChild(li);
     }
 
     // 初始化地图加载
     window.onload = initMap;
    
    
    
    
    