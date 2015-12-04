/**
* Created by gnomine on 30/06/15.
*/
'use strict';

angular.module('sauvetapp')
.controller('MainCtrl', function ($scope, $sailsSocket) {
    
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

});
