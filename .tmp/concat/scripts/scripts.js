'use strict';

/**
* @ngdoc overview
* @name scoledgeApp
* @description
* # scoledgeApp
*
* Main module of the application.
*/
angular
.module('sauvetapp', [
    'ui.router',
    'sails.io',
    'ngMap'
])
.config(["$stateProvider", "$urlRouterProvider", "$locationProvider", "$sailsSocketProvider", "$httpProvider", function ($stateProvider, $urlRouterProvider, $locationProvider, $sailsSocketProvider, $httpProvider) {


    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $httpProvider.interceptors.push('AuthInterceptor');
    $sailsSocketProvider.interceptors.push('AuthInterceptor');



    $urlRouterProvider.otherwise("/home");

    $stateProvider
    .state('app', {
        url: '/app',
        templateUrl: '/views/app.html'
    })
    .state("home", {
        url: "/home",
        controller: 'MainCtrl',
        templateUrl: '/views/home/home.html'
    })
    .state("app.helpme",{
        url: "/helpme",
        controller: 'MainCtrl',
        templateUrl: '/views/home/helpme.html'
    })
    .state("app.who",{
        url:"/who",
        templateUrl:'/views/home/who.html'
    })
    .state("app.map",{
        url:"/map",
        templateUrl:'/views/home/map.html'
    })
    .state("app.itinary",{
        resolve:{
             center: [
                '$stateParams','$sailsSocket',
                function($stateParams,$sailsSocket){
                    return $sailsSocket.get('/center/'+$stateParams.id)
                    .then(function(response) {
                        return response.data;
                    },function(err){
                        console.log(err);
                    });
                }
            ]
        },
        url:"/itinary/:id",
        controller:'MapCtrl',
        templateUrl:'/views/home/itinary.html'
    })
    .state("app.profile",{
        url:"/profile",
        templateUrl:'/views/home/profile.html'
    })
    .state('admin', {
        url: '/admin',
        templateUrl: '/views/admin.html'
    })
    .state('admin.home', {
        url: '/home',
        templateUrl: '/views/admin/home.html',
        controller: 'AdminCtrl'
    })
    .state('admin.strategies', {
        url: '/strategies',
        controller: 'StrategiesCtrl',
        templateUrl: '/views/admin/strategies.html'
    })
    .state('admin.infos', {
        url: '/infos',
        controller: 'InfosCtrl',
        templateUrl: '/views/admin/infos.html'
    });
}]);

/**
* Simple storage service which uses browser localStorage service to store
* application data. Main usage of this is to store user data and JWT token
* to browser.
*/

'use strict';

angular.module('sauvetapp')
.factory('Storage', function () {
    return {
        get: function (key) {
            return localStorage.getItem(key);
        },
        set: function (key, val) {
            return localStorage.setItem(key, val);
        },
        unset: function (key) {
            return localStorage.removeItem(key);
        }
    };
});

/**
 * Created by shen on 06/06/14.
 */
/**
 * Created by shen on 06/06/14.
 */
/**
 * Auth interceptor for HTTP and Socket request. This interceptor will add required
 * JWT (Json Web Token) token to each requests. That token is validated in server side
 * application.
 *
 * @see http://angular-tips.com/blog/2014/05/json-web-tokens-introduction/
 * @see http://angular-tips.com/blog/2014/05/json-web-tokens-examples/
 */
'use strict';

angular.module('sauvetapp')
    .factory('AuthInterceptor',
    [
        '$q', '$injector', 'Storage',
        function ($q, $injector, Storage) {
            return {
                /**
                 * Interceptor method for $http requests. Main purpose of this method is to add JWT token
                 * to every request that application does.
                 *
                 * @param   {*} config
                 *
                 * @returns {*}
                 */
                request: function (config) {

                    if (config.url.indexOf('api.giphy.com') == -1 && config.url.indexOf('facebook.com') == -1 && config.url.indexOf('icecomm') == -1 && config.url.indexOf('amazonaws.com') == -1 && config.url.indexOf('google') == -1) {

                        var token;

                        if (Storage.get('token')) {
                            token = JSON.parse(Storage.get('token')).hash;
                        }

                        // Yeah we have a token
                        if (token) {
                            if (!config.data) {
                                config.data = {};
                            }

                            /**
                             * Set token to actual data and headers. Note that we need both ways because of
                             * socket cannot modify headers anyway. These values are cleaned up in backend
                             * side policy (middleware).
                             */
                            config.headers.Authorization = 'Bearer ' + token;
                        }
                    }
                    else {
                        delete config.headers.Authorization;
                    }

                    return config;
                },

                /**
                 * Interceptor method that is triggered whenever response error occurs on $http requests.
                 *
                 * @param   {*} response
                 *
                 * @returns {Promise}
                 */
                responseError: function (response) {
                    console.log('GOT 401 OR 403');
                    console.log(response);
                    if ((response.status === 401 || response.status === 403) && (response.config.url.indexOf('scalingo') > -1 || response.config.url.indexOf('localhost') > -1)) {
                        Storage.unset('token');
                        $injector.get('$state').go('login');
                    }

                    return $q.reject(response);
                }
            };
        }
    ]
);

/**
* Created by gnomine on 30/06/15.
*/
'use strict';

angular.module('sauvetapp')
.controller('MainCtrl', ["$scope", "$sailsSocket", function ($scope, $sailsSocket) {
    
    var lat;
    var long;
    
    function maPosition(position) {        
        lat = position.coords.latitude;
        long = position.coords.longitude;
    }
        
    if(navigator.geolocation)
        navigator.geolocation.getCurrentPosition(maPosition);
        
        
        
    $scope.postPanic = function(){
        console.log(long);
        console.log("JEEEJ");
        
        $sailsSocket.post("/alert",{
            latitude: lat,
            longitude: long,
            saved: false
        })
        .then(function(response){
            console.log(response);
        }, function (err){
            console.log(err); 
        });
    }
        $sailsSocket.get("/strategy")
            .then(function(data) {
                console.log(data);
            }, function(err) {
                console.log(err);
            })

}]);

/**
* Created by gnomine on 30/06/15.
*/
'use strict';

angular.module('sauvetapp')
.controller('AdminCtrl', ["$scope", "$sailsSocket", "$timeout", function ($scope, $sailsSocket, $timeout) {

    $sailsSocket
    .get("/alert")
    .then(function(response) {
        console.log(response.data);
        $scope.markers = response.data;
    }, function(err) {
        console.log(err);
    });


    $sailsSocket
    .get("/center")
    .then(function(response) {
        console.log(response.data);
        $scope.centers = response.data;
    }, function(err) {
        console.log(err);
    });

}]);

/**
* Created by gnomine on 30/06/15.
*/
'use strict';

angular.module('sauvetapp')
.controller('StrategiesCtrl', ["$scope", "$sailsSocket", function ($scope, $sailsSocket) {

    $sailsSocket.get("/strategy")
    .then(function(response) {
        $scope.strategies = response.data;
    }, function(err) {
        console.log(err);
    })

    $scope.save = function(strategy) {
        $sailsSocket.put("/strategy/" + strategy.id, {
            instructions: strategy.instructions
        })
        .then(function(response) {
            console.log("saved");
        }, function(err) {
            console.log(err);
        })
    }
}]);

/**
* Created by gnomine on 30/06/15.
*/
'use strict';

angular.module('sauvetapp')
.controller('InfosCtrl', ["$scope", "$sailsSocket", function ($scope, $sailsSocket) {


}]);

/**
* Created by gnomine on 30/06/15.
*/
'use strict';

angular.module('sauvetapp')
.controller('MapCtrl', ["$scope", "$sailsSocket", "$timeout", "center", function ($scope, $sailsSocket, $timeout, center) {

	$scope.center = center;

    function maPosition(position) {
        $scope.lat = position.coords.latitude;
        $scope.long = position.coords.longitude;
    }

    if(navigator.geolocation)
        navigator.geolocation.getCurrentPosition(maPosition);


		angular.element(document).ready(function () {

		$timeout(function() {
			console.log('clicking');
	        angular.element('.gm-style').click();
	    }, 3000);
	});


}]);

angular.module("ngMap",[]),function(){"use strict";var e,t=function(t,n,o,i,r,a){e=r;var s=this;s.mapOptions,s.mapEvents,s.ngMapDiv,s.addObject=function(e,t){if(s.map){s.map[e]=s.map[e]||{};var n=Object.keys(s.map[e]).length;s.map[e][t.id||n]=t,s.map instanceof google.maps.Map&&("infoWindows"!=e&&t.setMap&&t.setMap&&t.setMap(s.map),t.centered&&t.position&&s.map.setCenter(t.position),"markers"==e&&s.objectChanged("markers"),"customMarkers"==e&&s.objectChanged("customMarkers"))}},s.deleteObject=function(e,t){if(t.map){var n=t.map[e];for(var o in n)n[o]===t&&delete n[o];t.map&&t.setMap&&t.setMap(null),"markers"==e&&s.objectChanged("markers"),"customMarkers"==e&&s.objectChanged("customMarkers")}},s.observeAttrSetObj=function(t,n,o){if(n.noWatcher)return!1;for(var i=e.getAttrsToObserve(t),r=0;r<i.length;r++){var s=i[r];n.$observe(s,a.observeAndSet(s,o))}},s.zoomToIncludeMarkers=function(){var e=new google.maps.LatLngBounds;for(var t in s.map.markers)e.extend(s.map.markers[t].getPosition());for(var n in s.map.customMarkers)e.extend(s.map.customMarkers[n].getPosition());s.map.fitBounds(e)},s.objectChanged=function(e){"markers"!=e&&"customMarkers"!=e||"auto"!=s.map.zoomToIncludeMarkers||s.zoomToIncludeMarkers()},s.initializeMap=function(){var e=s.mapOptions,n=s.mapEvents,r=s.ngMapDiv,c=s.map;if(s.map=new google.maps.Map(r,{}),c)for(var u in c){var l=c[u];if("object"==typeof l)for(var g in l)s.addObject(u,l[g])}e.zoom=e.zoom||15;var d=e.center;if(!e.center||"string"==typeof d&&d.match(/\{\{.*\}\}/))e.center=new google.maps.LatLng(0,0);else if(!(d instanceof google.maps.LatLng)){var f=e.center;delete e.center,a.getGeoLocation(f,e.geoLocationOptions).then(function(n){s.map.setCenter(n);var o=e.geoCallback;o&&i(o)(t)},function(){e.geoFallbackCenter&&s.map.setCenter(e.geoFallbackCenter)})}s.map.setOptions(e);for(var m in n)google.maps.event.addListener(s.map,m,n[m]);s.observeAttrSetObj(p,o,s.map),s.singleInfoWindow=e.singleInfoWindow,google.maps.event.addListenerOnce(s.map,"idle",function(){a.addMap(s),e.zoomToIncludeMarkers&&s.zoomToIncludeMarkers(),t.map=s.map,t.$emit("mapInitialized",s.map),o.mapInitialized&&i(o.mapInitialized)(t,{map:s.map})})},t.google=google;var p=e.orgAttributes(n),c=e.filter(o),u=e.getOptions(c),l=e.getControlOptions(c),g=angular.extend(u,l),d=e.getEvents(t,c);s.mapOptions=g,s.mapEvents=d,s.ngMapDiv=a.getNgMapDiv(n[0]),n.append(s.ngMapDiv),u.lazyInit?(s.map={id:o.id},a.addMap(s)):s.initializeMap(),n.bind("$destroy",function(){a.deleteMap(s)})};
t.$inject = ["t", "n", "o", "i", "r", "a"];t.$inject=["$scope","$element","$attrs","$parse","Attr2MapOptions","NgMap"],angular.module("ngMap").controller("__MapController",t)}(),function(){"use strict";var e,t=function(t,o,i,r){r=r[0]||r[1];var a=e.orgAttributes(o),s=e.filter(i),p=e.getOptions(s),c=e.getEvents(t,s),u=n(p,c);r.addObject("bicyclingLayers",u),r.observeAttrSetObj(a,i,u),o.bind("$destroy",function(){r.deleteObject("bicyclingLayers",u)})},n=function(e,t){var n=new google.maps.BicyclingLayer(e);for(var o in t)google.maps.event.addListener(n,o,t[o]);return n},o=function(n){return e=n,{restrict:"E",require:["?^map","?^ngMap"],link:t}};
o.$inject = ["n"];o.$inject=["Attr2MapOptions"],angular.module("ngMap").directive("bicyclingLayer",o)}(),function(){"use strict";var e,t,n,o=function(o,i,r,a){a=a[0]||a[1];var s=e.filter(r),p=e.getOptions(s),c=e.getEvents(o,s),u=i[0].parentElement.removeChild(i[0]);t(u.innerHTML.trim())(o);for(var l in c)google.maps.event.addDomListener(u,l,c[l]);a.addObject("customControls",u),n.getMap().then(function(e){var t=p.position;e.controls[google.maps.ControlPosition[t]].push(u)})},i=function(i,r,a){return e=i,t=r,n=a,{restrict:"E",require:["?^map","?^ngMap"],link:o}};
i.$inject = ["i", "r", "a"];i.$inject=["Attr2MapOptions","$compile","NgMap"],angular.module("ngMap").directive("customControl",i)}(),function(){"use strict";var e,t,n,o,i=function(e){e=e||{},this.el=document.createElement("div"),this.el.style.display="inline-block",this.visible=!0;for(var t in e)this[t]=e[t]},r=function(){i.prototype=new google.maps.OverlayView,i.prototype.setContent=function(e,t){this.el.innerHTML=e,this.el.style.position="absolute",t&&n(angular.element(this.el).contents())(t)},i.prototype.getDraggable=function(){return this.draggable},i.prototype.setDraggable=function(e){this.draggable=e},i.prototype.getPosition=function(){return this.position},i.prototype.setPosition=function(e){if(e&&(this.position=e),this.getProjection()&&"function"==typeof this.position.lng){var t=this.getProjection().fromLatLngToDivPixel(this.position),n=Math.round(t.x-this.el.offsetWidth/2),o=Math.round(t.y-this.el.offsetHeight-10);this.el.style.left=n+"px",this.el.style.top=o+"px"}},i.prototype.setZIndex=function(e){e&&(this.zIndex=e),this.el.style.zIndex=this.zIndex},i.prototype.setVisible=function(e){this.el.style.display=e?"inline-block":"none",this.visible=e},i.prototype.addClass=function(e){var t=this.el.className.trim().split(" ");-1==t.indexOf(e)&&t.push(e),this.el.className=t.join(" ")},i.prototype.removeClass=function(e){var t=this.el.className.split(" "),n=t.indexOf(e);n>-1&&t.splice(n,1),this.el.className=t.join(" ")},i.prototype.onAdd=function(){this.getPanes().overlayMouseTarget.appendChild(this.el)},i.prototype.draw=function(){this.setPosition(),this.setZIndex(this.zIndex),this.setVisible(this.visible)},i.prototype.onRemove=function(){this.el.parentNode.removeChild(this.el)}},a=function(n,r){return function(a,s,p,c){c=c[0]||c[1];var u=e.orgAttributes(s),l=e.filter(p),g=e.getOptions(l,a),d=e.getEvents(a,l),f=s[0].parentElement.removeChild(s[0]),m=new i(g);t(function(){a.$watch("["+r.join(",")+"]",function(){m.setContent(n,a)}),m.setContent(f.innerHTML,a);var e=f.firstElementChild.className;m.addClass("custom-marker"),m.addClass(e),g.position instanceof google.maps.LatLng||o.getGeoLocation(g.position).then(function(e){m.setPosition(e)})});for(var v in d)google.maps.event.addDomListener(m.el,v,d[v]);c.addObject("customMarkers",m),c.observeAttrSetObj(u,p,m),s.bind("$destroy",function(){c.deleteObject("customMarkers",m)})}},s=function(i,s,p,c){return e=p,t=i,n=s,o=c,{restrict:"E",require:["?^map","?^ngMap"],compile:function(e){r(),e[0].style.display="none";var t=e.html(),n=t.match(/{{([^}]+)}}/g),o=[];return(n||[]).forEach(function(e){var t=e.replace("{{","").replace("}}","");-1==e.indexOf("::")&&-1==e.indexOf("this.")&&-1==o.indexOf(t)&&o.push(e.replace("{{","").replace("}}",""))}),a(t,o)}}};
s.$inject = ["i", "s", "p", "c"];s.$inject=["$timeout","$compile","Attr2MapOptions","NgMap"],angular.module("ngMap").directive("customMarker",s)}(),function(){"use strict";var e,t,n,o=function(e,t){e.panel&&(e.panel=document.getElementById(e.panel)||document.querySelector(e.panel));var n=new google.maps.DirectionsRenderer(e);for(var o in t)google.maps.event.addListener(n,o,t[o]);return n},i=function(e,o){var i=new google.maps.DirectionsService,r=o;r.travelMode=r.travelMode||"DRIVING";var a=["origin","destination","travelMode","transitOptions","unitSystem","durationInTraffic","waypoints","optimizeWaypoints","provideRouteAlternatives","avoidHighways","avoidTolls","region"];for(var s in r)-1===a.indexOf(s)&&delete r[s];r.waypoints&&("[]"==r.waypoints||""===r.waypoints)&&delete r.waypoints;var p=function(n){i.route(n,function(n,o){o==google.maps.DirectionsStatus.OK&&t(function(){e.setDirections(n)})})};r.origin&&r.destination&&("current-location"==r.origin?n.getCurrentPosition().then(function(e){r.origin=new google.maps.LatLng(e.coords.latitude,e.coords.longitude),p(r)}):"current-location"==r.destination?n.getCurrentPosition().then(function(e){r.destination=new google.maps.LatLng(e.coords.latitude,e.coords.longitude),p(r)}):p(r))},r=function(r,a,s,p){var c=r;e=p,t=a,n=s;var u=function(n,r,a,s){s=s[0]||s[1];var p=c.orgAttributes(r),u=c.filter(a),l=c.getOptions(u),g=c.getEvents(n,u),d=c.getAttrsToObserve(p),f=o(l,g);s.addObject("directionsRenderers",f),d.forEach(function(e){!function(e){a.$observe(e,function(n){if("panel"==e)t(function(){var e=document.getElementById(n)||document.querySelector(n);e&&f.setPanel(e)});else if(l[e]!==n){var o=c.toOptionValue(n,{key:e});l[e]=o,i(f,l)}})}(e)}),e.getMap().then(function(){i(f,l)}),r.bind("$destroy",function(){s.deleteObject("directionsRenderers",f)})};return{restrict:"E",require:["?^map","?^ngMap"],link:u}};
r.$inject = ["r", "a", "s", "p"];r.$inject=["Attr2MapOptions","$timeout","NavigatorGeolocation","NgMap"],angular.module("ngMap").directive("directions",r)}(),function(){"use strict";angular.module("ngMap").directive("drawingManager",["Attr2MapOptions",function(e){var t=e;return{restrict:"E",require:["?^map","?^ngMap"],link:function(e,n,o,i){i=i[0]||i[1];var r=t.filter(o),a=t.getOptions(r),s=t.getControlOptions(r),p=t.getEvents(e,r),c=new google.maps.drawing.DrawingManager({drawingMode:a.drawingmode,drawingControl:a.drawingcontrol,drawingControlOptions:s.drawingControlOptions,circleOptions:a.circleoptions,markerOptions:a.markeroptions,polygonOptions:a.polygonoptions,polylineOptions:a.polylineoptions,rectangleOptions:a.rectangleoptions});for(var u in p)google.maps.event.addListener(c,u,p[u]);i.addObject("mapDrawingManager",c)}}}])}(),function(){"use strict";angular.module("ngMap").directive("dynamicMapsEngineLayer",["Attr2MapOptions",function(e){var t=e,n=function(e,t){var n=new google.maps.visualization.DynamicMapsEngineLayer(e);for(var o in t)google.maps.event.addListener(n,o,t[o]);return n};return{restrict:"E",require:["?^map","?^ngMap"],link:function(e,o,i,r){r=r[0]||r[1];var a=t.filter(i),s=t.getOptions(a),p=t.getEvents(e,a,p),c=n(s,p);r.addObject("mapsEngineLayers",c)}}}])}(),function(){"use strict";angular.module("ngMap").directive("fusionTablesLayer",["Attr2MapOptions",function(e){var t=e,n=function(e,t){var n=new google.maps.FusionTablesLayer(e);for(var o in t)google.maps.event.addListener(n,o,t[o]);return n};return{restrict:"E",require:["?^map","?^ngMap"],link:function(e,o,i,r){r=r[0]||r[1];var a=t.filter(i),s=t.getOptions(a),p=t.getEvents(e,a,p),c=n(s,p);r.addObject("fusionTablesLayers",c)}}}])}(),function(){"use strict";angular.module("ngMap").directive("heatmapLayer",["Attr2MapOptions","$window",function(e,t){var n=e;return{restrict:"E",require:["?^map","?^ngMap"],link:function(e,o,i,r){r=r[0]||r[1];var a=n.filter(i),s=n.getOptions(a);if(s.data=t[i.data]||e[i.data],!(s.data instanceof Array))throw"invalid heatmap data";s.data=new google.maps.MVCArray(s.data);{var p=new google.maps.visualization.HeatmapLayer(s);n.getEvents(e,a)}r.addObject("heatmapLayers",p)}}}])}(),function(){"use strict";var e=function(e,t,n,o,i){var r=e,a=function(e,o,i){var r;!e.position||e.position instanceof google.maps.LatLng||delete e.position,r=new google.maps.InfoWindow(e),Object.keys(o).length>0;for(var a in o)a&&google.maps.event.addListener(r,a,o[a]);var s=i.html().trim();if(1!=angular.element(s).length)throw"info-window working as a template must have a container";return r.__template=s.replace(/\s?ng-non-bindable[='"]+/,""),r.__open=function(e,o,i){n(function(){i&&(o.anchor=i);var n=t(r.__template)(o);r.setContent(n[0]),o.$apply(),i&&i.getPosition?r.open(e,i):i&&i instanceof google.maps.LatLng?(r.open(e),r.setPosition(i)):r.open(e)})},r},s=function(e,t,n,s){s=s[0]||s[1],t.css("display","none");var p,c=r.orgAttributes(t),u=r.filter(n),l=r.getOptions(u),g=r.getEvents(e,u);!l.position||l.position instanceof google.maps.LatLng||(p=l.position);var d=a(l,g,t);p&&i.getGeoLocation(p).then(function(t){d.setPosition(t),d.__open(s.map,e,t);var i=n.geoCallback;i&&o(i)(e)}),s.addObject("infoWindows",d),s.observeAttrSetObj(c,n,d),s.map.showInfoWindow=s.map.showInfoWindow||function(t,n,o){var i="string"==typeof t?t:n,r="string"==typeof t?n:o;"string"==typeof r&&(r=s.map.markers[r]);var a=s.map.infoWindows[i],p=r?r:this.getPosition?this:null;a.__open(s.map,e,p),s.singleInfoWindow&&(s.lastInfoWindow&&e.hideInfoWindow(s.lastInfoWindow),s.lastInfoWindow=i)},s.map.hideInfoWindow=s.map.hideInfoWindow||function(e,t){var n="string"==typeof e?e:t,o=s.map.infoWindows[n];o.close()},e.showInfoWindow=s.map.showInfoWindow,e.hideInfoWindow=s.map.hideInfoWindow,i.getMap().then(function(t){if(d.visible&&d.__open(t,e),d.visibleOnMarker){var n=d.visibleOnMarker;d.__open(t,e,t.markers[n])}})};return{restrict:"E",require:["?^map","?^ngMap"],link:s}};
e.$inject = ["e", "t", "n", "o", "i"];e.$inject=["Attr2MapOptions","$compile","$timeout","$parse","NgMap"],angular.module("ngMap").directive("infoWindow",e)}(),function(){"use strict";angular.module("ngMap").directive("kmlLayer",["Attr2MapOptions",function(e){var t=e,n=function(e,t){var n=new google.maps.KmlLayer(e);for(var o in t)google.maps.event.addListener(n,o,t[o]);return n};return{restrict:"E",require:["?^map","?^ngMap"],link:function(e,o,i,r){r=r[0]||r[1];var a=t.orgAttributes(o),s=t.filter(i),p=t.getOptions(s),c=t.getEvents(e,s),u=n(p,c);r.addObject("kmlLayers",u),r.observeAttrSetObj(a,i,u),o.bind("$destroy",function(){r.deleteObject("kmlLayers",u)})}}}])}(),function(){"use strict";angular.module("ngMap").directive("mapData",["Attr2MapOptions","NgMap",function(e,t){var n=e;return{restrict:"E",require:["?^map","?^ngMap"],link:function(e,o,i){var r=n.filter(i),a=n.getOptions(r),s=n.getEvents(e,r,s);t.getMap().then(function(t){for(var n in a){var o=a[n];"function"==typeof e[o]?t.data[n](e[o]):t.data[n](o)}for(var i in s)t.data.addListener(i,s[i])})}}}])}(),function(){"use strict";var e,t,n,o,i=function(n,i,r){var a=r.mapLazyLoadParams||r.mapLazyLoad;if(window.lazyLoadCallback=function(){e(function(){i.html(o),t(i.contents())(n)},100)},void 0===window.google||void 0===window.google.maps){var s=document.createElement("script");s.src=a+(a.indexOf("?")>-1?"&":"?")+"callback=lazyLoadCallback",document.body.appendChild(s)}else i.html(o),t(i.contents())(n)},r=function(e,t){return!t.mapLazyLoad&&void 0,o=e.html(),n=t.mapLazyLoad,document.querySelector('script[src="'+n+(n.indexOf("?")>-1?"&":"?")+'callback=lazyLoadCallback"]')?!1:(e.html(""),{pre:i})},a=function(n,o){return t=n,e=o,{compile:r}};
a.$inject = ["n", "o"];a.$inject=["$compile","$timeout"],angular.module("ngMap").directive("mapLazyLoad",a)}(),function(){"use strict";angular.module("ngMap").directive("mapType",["$parse","NgMap",function(e,t){return{restrict:"E",require:["?^map","?^ngMap"],link:function(n,o,i,r){r=r[0]||r[1];var a,s=i.name;if(!s)throw"invalid map-type name";if(a=e(i.object)(n),!a)throw"invalid map-type object";t.getMap().then(function(e){e.mapTypes.set(s,a)}),r.addObject("mapTypes",a)}}}])}(),function(){"use strict";var e=function(){return{restrict:"AE",controller:"__MapController",conrollerAs:"ngmap"}};angular.module("ngMap").directive("map",[e]),angular.module("ngMap").directive("ngMap",[e])}(),function(){"use strict";angular.module("ngMap").directive("mapsEngineLayer",["Attr2MapOptions",function(e){var t=e,n=function(e,t){var n=new google.maps.visualization.MapsEngineLayer(e);for(var o in t)google.maps.event.addListener(n,o,t[o]);return n};return{restrict:"E",require:["?^map","?^ngMap"],link:function(e,o,i,r){r=r[0]||r[1];var a=t.filter(i),s=t.getOptions(a),p=t.getEvents(e,a,p),c=n(s,p);r.addObject("mapsEngineLayers",c)}}}])}(),function(){"use strict";var e,t,n,o=function(e,t){var o;if(n.defaultOptions.marker)for(var i in n.defaultOptions.marker)"undefined"==typeof e[i]&&(e[i]=n.defaultOptions.marker[i]);e.position instanceof google.maps.LatLng||(e.position=new google.maps.LatLng(0,0)),o=new google.maps.Marker(e),Object.keys(t).length>0;for(var r in t)r&&google.maps.event.addListener(o,r,t[r]);return o},i=function(i,r,a,s){s=s[0]||s[1];var p,c=e.orgAttributes(r),u=e.filter(a),l=e.getOptions(u,i),g=e.getEvents(i,u);l.position instanceof google.maps.LatLng||(p=l.position);var d=o(l,g);s.addObject("markers",d),p&&n.getGeoLocation(p).then(function(e){d.setPosition(e),l.centered&&d.map.setCenter(e);var n=a.geoCallback;n&&t(n)(i)}),s.observeAttrSetObj(c,a,d),r.bind("$destroy",function(){s.deleteObject("markers",d)})},r=function(o,r,a){return e=o,t=r,n=a,{restrict:"E",require:["^?map","?^ngMap"],link:i}};
r.$inject = ["o", "r", "a"];r.$inject=["Attr2MapOptions","$parse","NgMap"],angular.module("ngMap").directive("marker",r)}(),function(){"use strict";angular.module("ngMap").directive("overlayMapType",["NgMap",function(e){return{restrict:"E",require:["?^map","?^ngMap"],link:function(t,n,o,i){i=i[0]||i[1];var r=o.initMethod||"insertAt",a=t[o.object];e.getMap().then(function(e){if("insertAt"==r){var t=parseInt(o.index,10);e.overlayMapTypes.insertAt(t,a)}else"push"==r&&e.overlayMapTypes.push(a)}),i.addObject("overlayMapTypes",a)}}}])}(),function(){"use strict";var e=function(e,t){var n=e,o=function(e,o,i,r){if("false"===i.placesAutoComplete)return!1;var a=n.filter(i),s=n.getOptions(a),p=n.getEvents(e,a),c=new google.maps.places.Autocomplete(o[0],s);for(var u in p)google.maps.event.addListener(c,u,p[u]);var l=function(){t(function(){r&&r.$setViewValue(o.val())},100)};google.maps.event.addListener(c,"place_changed",l),o[0].addEventListener("change",l),i.$observe("types",function(e){if(e){var t=n.toOptionValue(e,{key:"types"});c.setTypes(t)}})};return{restrict:"A",require:"?ngModel",link:o}};
e.$inject = ["e", "t"];e.$inject=["Attr2MapOptions","$timeout"],angular.module("ngMap").directive("placesAutoComplete",e)}(),function(){"use strict";var e=function(e,t){var n,o=e.name;switch(delete e.name,o){case"circle":e.center instanceof google.maps.LatLng||(e.center=new google.maps.LatLng(0,0)),n=new google.maps.Circle(e);break;case"polygon":n=new google.maps.Polygon(e);break;case"polyline":n=new google.maps.Polyline(e);break;case"rectangle":n=new google.maps.Rectangle(e);break;case"groundOverlay":case"image":var i=e.url,r={opacity:e.opacity,clickable:e.clickable,id:e.id};n=new google.maps.GroundOverlay(i,e.bounds,r)}for(var a in t)t[a]&&google.maps.event.addListener(n,a,t[a]);return n},t=function(t,n,o){var i=t,r=function(t,r,a,s){s=s[0]||s[1];var p,c,u=i.orgAttributes(r),l=i.filter(a),g=i.getOptions(l),d=i.getEvents(t,l);c=g.name,g.center instanceof google.maps.LatLng||(p=g.center);var f=e(g,d);s.addObject("shapes",f),p&&"circle"==c&&o.getGeoLocation(p).then(function(e){f.setCenter(e),f.centered&&f.map.setCenter(e);var o=a.geoCallback;o&&n(o)(t)}),s.observeAttrSetObj(u,a,f),r.bind("$destroy",function(){s.deleteObject("shapes",f)})};return{restrict:"E",require:["?^map","?^ngMap"],link:r}};
t.$inject = ["t", "n", "o"];t.$inject=["Attr2MapOptions","$parse","NgMap"],angular.module("ngMap").directive("shape",t)}(),function(){"use strict";var e=function(e,t){var n=e,o=function(e,t,n){var o,i;t.container&&(i=document.getElementById(t.container),i=i||document.querySelector(t.container)),i?o=new google.maps.StreetViewPanorama(i,t):(o=e.getStreetView(),o.setOptions(t));for(var r in n)r&&google.maps.event.addListener(o,r,n[r]);return o},i=function(e,i,r){var a=n.filter(r),s=n.getOptions(a),p=n.getControlOptions(a),c=angular.extend(s,p),u=n.getEvents(e,a);t.getMap().then(function(e){var t=o(e,c,u);e.setStreetView(t),!t.getPosition()&&t.setPosition(e.getCenter()),google.maps.event.addListener(t,"position_changed",function(){t.getPosition()!==e.getCenter()&&e.setCenter(t.getPosition())});var n=google.maps.event.addListener(e,"center_changed",function(){t.setPosition(e.getCenter()),google.maps.event.removeListener(n)})})};return{restrict:"E",require:["?^map","?^ngMap"],link:i}};
e.$inject = ["e", "t"];e.$inject=["Attr2MapOptions","NgMap"],angular.module("ngMap").directive("streetViewPanorama",e)}(),function(){"use strict";angular.module("ngMap").directive("trafficLayer",["Attr2MapOptions",function(e){var t=e,n=function(e,t){var n=new google.maps.TrafficLayer(e);for(var o in t)google.maps.event.addListener(n,o,t[o]);return n};return{restrict:"E",require:["?^map","?^ngMap"],link:function(e,o,i,r){r=r[0]||r[1];var a=t.orgAttributes(o),s=t.filter(i),p=t.getOptions(s),c=t.getEvents(e,s),u=n(p,c);r.addObject("trafficLayers",u),r.observeAttrSetObj(a,i,u),o.bind("$destroy",function(){r.deleteObject("trafficLayers",u)})}}}])}(),function(){"use strict";angular.module("ngMap").directive("transitLayer",["Attr2MapOptions",function(e){var t=e,n=function(e,t){var n=new google.maps.TransitLayer(e);for(var o in t)google.maps.event.addListener(n,o,t[o]);return n};return{restrict:"E",require:["?^map","?^ngMap"],link:function(e,o,i,r){r=r[0]||r[1];var a=t.orgAttributes(o),s=t.filter(i),p=t.getOptions(s),c=t.getEvents(e,s),u=n(p,c);r.addObject("transitLayers",u),r.observeAttrSetObj(a,i,u),o.bind("$destroy",function(){r.deleteObject("transitLayers",u)})}}}])}(),function(){"use strict";var e=/([\:\-\_]+(.))/g,t=/^moz([A-Z])/,n=function(){return function(n){return n.replace(e,function(e,t,n,o){return o?n.toUpperCase():n}).replace(t,"Moz$1")}};angular.module("ngMap").filter("camelCase",n)}(),function(){"use strict";var e=function(){return function(e){try{return JSON.parse(e),e}catch(t){return e.replace(/([\$\w]+)\s*:/g,function(e,t){return'"'+t+'":'}).replace(/'([^']+)'/g,function(e,t){return'"'+t+'"'})}}};angular.module("ngMap").filter("jsonize",e)}(),function(){"use strict";var isoDateRE=/^(\d{4}\-\d\d\-\d\d([tT][\d:\.]*)?)([zZ]|([+\-])(\d\d):?(\d\d))?$/,Attr2MapOptions=function($parse,$timeout,$log,NavigatorGeolocation,GeoCoder,camelCaseFilter,jsonizeFilter){var orgAttributes=function(e){e.length>0&&(e=e[0]);for(var t={},n=0;n<e.attributes.length;n++){var o=e.attributes[n];t[o.name]=o.value}return t},getJSON=function(e){var t=/^[\+\-]?[0-9\.]+,[ ]*\ ?[\+\-]?[0-9\.]+$/;return e.match(t)&&(e="["+e+"]"),JSON.parse(jsonizeFilter(e))},getLatLng=function(e){var t=e;return e[0].constructor==Array?t=e.map(function(e){return new google.maps.LatLng(e[0],e[1])}):!isNaN(parseFloat(e[0]))&&isFinite(e[0])&&(t=new google.maps.LatLng(t[0],t[1])),t},toOptionValue=function(input,options){var output;try{output=getNumber(input)}catch(err){try{var output=getJSON(input);if(output instanceof Array)output=output[0].constructor==Object?output:getLatLng(output);else if(output===Object(output)){var newOptions=options;newOptions.doNotConverStringToNumber=!0,output=getOptions(output,newOptions)}}catch(err2){if(input.match(/^[A-Z][a-zA-Z0-9]+\(.*\)$/))try{var exp="new google.maps."+input;output=eval(exp)}catch(e){output=input}else if(input.match(/^([A-Z][a-zA-Z0-9]+)\.([A-Z]+)$/))try{var matches=input.match(/^([A-Z][a-zA-Z0-9]+)\.([A-Z]+)$/);output=google.maps[matches[1]][matches[2]]}catch(e){output=input}else if(input.match(/^[A-Z]+$/))try{var capitalizedKey=options.key.charAt(0).toUpperCase()+options.key.slice(1);options.key.match(/temperatureUnit|windSpeedUnit|labelColor/)?(capitalizedKey=capitalizedKey.replace(/s$/,""),output=google.maps.weather[capitalizedKey][input]):output=google.maps[capitalizedKey][input]}catch(e){output=input}else if(input.match(isoDateRE))try{output=new Date(input)}catch(e){output=input}else output=input}}if("bounds"==options.key&&output instanceof Array&&(output=new google.maps.LatLngBounds(output[0],output[1])),"icons"==options.key&&output instanceof Array)for(var i=0;i<output.length;i++){var el=output[i];el.icon.path.match(/^[A-Z_]+$/)&&(el.icon.path=google.maps.SymbolPath[el.icon.path])}if("icon"==options.key&&output instanceof Object){(""+output.path).match(/^[A-Z_]+$/)&&(output.path=google.maps.SymbolPath[output.path]);for(var key in output){var arr=output[key];"anchor"==key||"origin"==key?output[key]=new google.maps.Point(arr[0],arr[1]):("size"==key||"scaledSize"==key)&&(output[key]=new google.maps.Size(arr[0],arr[1]))}}return output},getAttrsToObserve=function(e){var t=[];if(!e.noWatcher)for(var n in e){var o=e[n];o&&o.match(/\{\{.*\}\}/)&&t.push(camelCaseFilter(n))}return t},filter=function(e){var t={};for(var n in e)n.match(/^\$/)||n.match(/^ng[A-Z]/)||(t[n]=e[n]);return t},getOptions=function(e,t){var n={};for(var o in e)if(e[o]||0===e[o]){if(o.match(/^on[A-Z]/))continue;if(o.match(/ControlOptions$/))continue;n[o]="string"!=typeof e[o]?e[o]:t&&t.doNotConverStringToNumber&&e[o].match(/^[0-9]+$/)?e[o]:toOptionValue(e[o],{key:o})}return n},getEvents=function(e,t){var n={},o=function(e){return"_"+e.toLowerCase()},i=function(t){var n=t.match(/([^\(]+)\(([^\)]*)\)/),o=n[1],i=n[2].replace(/event[ ,]*/,""),r=$parse("["+i+"]");return function(t){function n(e,t){return e[t]}var i=r(e),a=o.split(".").reduce(n,e);a&&a.apply(this,[t].concat(i)),$timeout(function(){e.$apply()})}};for(var r in t)if(t[r]){if(!r.match(/^on[A-Z]/))continue;var a=r.replace(/^on/,"");a=a.charAt(0).toLowerCase()+a.slice(1),a=a.replace(/([A-Z])/g,o);var s=t[r];n[a]=new i(s)}return n},getControlOptions=function(e){var t={};if("object"!=typeof e)return!1;for(var n in e)if(e[n]){if(!n.match(/(.*)ControlOptions$/))continue;var o=e[n],i=o.replace(/'/g,'"');i=i.replace(/([^"]+)|("[^"]+")/g,function(e,t,n){return t?t.replace(/([a-zA-Z0-9]+?):/g,'"$1":'):n});try{var r=JSON.parse(i);for(var a in r)if(r[a]){var s=r[a];if("string"==typeof s?s=s.toUpperCase():"mapTypeIds"===a&&(s=s.map(function(e){return e.match(/^[A-Z]+$/)?google.maps.MapTypeId[e.toUpperCase()]:e})),"style"===a){var p=n.charAt(0).toUpperCase()+n.slice(1),c=p.replace(/Options$/,"")+"Style";r[a]=google.maps[c][s]}else r[a]="position"===a?google.maps.ControlPosition[s]:s}t[n]=r}catch(u){}}return t};return{filter:filter,getOptions:getOptions,getEvents:getEvents,getControlOptions:getControlOptions,toOptionValue:toOptionValue,getAttrsToObserve:getAttrsToObserve,orgAttributes:orgAttributes}};
Attr2MapOptions.$inject = ["$parse", "$timeout", "$log", "NavigatorGeolocation", "GeoCoder", "camelCaseFilter", "jsonizeFilter"];Attr2MapOptions.$inject=["$parse","$timeout","$log","NavigatorGeolocation","GeoCoder","camelCaseFilter","jsonizeFilter"],angular.module("ngMap").service("Attr2MapOptions",Attr2MapOptions)}(),function(){"use strict";var e,t=function(t){var n=e.defer(),o=new google.maps.Geocoder;return o.geocode(t,function(e,t){t==google.maps.GeocoderStatus.OK?n.resolve(e):n.reject(t)}),n.promise},n=function(n){return e=n,{geocode:t}};
n.$inject = ["n"];n.$inject=["$q"],angular.module("ngMap").service("GeoCoder",n)}(),function(){"use strict";var e,t=function(t){var n=e.defer();return navigator.geolocation?(void 0===t?t={timeout:5e3}:void 0===t.timeout&&(t.timeout=5e3),navigator.geolocation.getCurrentPosition(function(e){n.resolve(e)},function(e){n.reject(e)},t)):n.reject("Browser Geolocation service failed."),n.promise},n=function(n){return e=n,{getCurrentPosition:t}};
n.$inject = ["n"];n.$inject=["$q"],angular.module("ngMap").service("NavigatorGeolocation",n)}(),function(){"use strict";var e,t,n,o,i,r,a,s={},p=function(e){var t=s[e||0];t.map instanceof google.maps.Map||t.initializeMap()},c=function(t){function o(t){s[r]?i.resolve(s[r].map):t>a?i.reject("could not find map"):e.setTimeout(function(){o(t+100)},100)}t=t||{};var i=n.defer(),r=t.id||0,a=t.timeout||2e3;return o(0),i.promise},u=function(e){var t=Object.keys(s).length;s[e.map.id||t]=e},l=function(e){var t=Object.keys(s).length-1;delete s[e.map.id||t]},g=function(n,o){var i;return n.currentStyle?i=n.currentStyle[o]:e.getComputedStyle&&(i=t.defaultView.getComputedStyle(n,null).getPropertyValue(o)),i},d=function(e){var n=t.createElement("div"),o=e.getAttribute("default-style");return n.style.width="100%",n.style.height="100%","true"==o?(e.style.display="block"):("block"!=g(e,"display")&&(e.style.display="block"),g(e,"height").match(/^(0|auto)/)&&(e.style.height="500px")),n.addEventListener("dragstart",function(e){return e.preventDefault(),!1}),n},f=function(e,t){var i=n.defer();return!e||e.match(/^current/i)?o.getCurrentPosition(t).then(function(e){var t=e.coords.latitude,n=e.coords.longitude,o=new google.maps.LatLng(t,n);i.resolve(o)},function(e){i.reject(e)}):r.geocode({address:e}).then(function(e){i.resolve(e[0].geometry.location)},function(e){i.reject(e)}),i.promise},m=function(e,t){return function(n){if(n){var o=a("set-"+e),r=i.toOptionValue(n,{key:e});t[o]&&(e.match(/center|position/)&&"string"==typeof r?f(r).then(function(e){t[o](e)}):t[o](r))}}};angular.module("ngMap").provider("NgMap",function(){var s={};this.setDefaultOptions=function(e){s=e};var v=function(v,y,h,M,O,b,w){return e=v,t=y[0],n=h,o=M,i=O,r=b,a=w,{defaultOptions:s,addMap:u,deleteMap:l,getMap:c,initMap:p,getStyle:g,getNgMapDiv:d,getGeoLocation:f,observeAndSet:m}};
v.$inject = ["v", "y", "h", "M", "O", "b", "w"];v.$inject=["$window","$document","$q","NavigatorGeolocation","Attr2MapOptions","GeoCoder","camelCaseFilter"],this.$get=v})}(),function(){"use strict";var e,t=function(t,n){n=n||t.getCenter();var o=e.defer(),i=new google.maps.StreetViewService;return i.getPanoramaByLocation(n||t.getCenter,100,function(e,t){t===google.maps.StreetViewStatus.OK?o.resolve(e.location.pano):o.resolve(!1)}),o.promise},n=function(e,t){var n=new google.maps.StreetViewPanorama(e.getDiv(),{enableCloseButton:!0});n.setPano(t)},o=function(o){return e=o,{getPanorama:t,setPanorama:n}};
o.$inject = ["o"];o.$inject=["$q"],angular.module("ngMap").service("StreetView",o)}();
