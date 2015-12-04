/**
* Created by gnomine on 30/06/15.
*/
'use strict';

angular.module('sauvetapp')
.controller('MapCtrl', function ($scope, $sailsSocket,center) {

	$scope.center = center;
	
    function maPosition(position) {        
        $scope.lat = position.coords.latitude;
        $scope.long = position.coords.longitude;
    }
        
    if(navigator.geolocation)
        navigator.geolocation.getCurrentPosition(maPosition);
        
    
	
});
