/**
* Created by gnomine on 30/06/15.
*/
'use strict';

angular.module('sauvetapp')
.controller('MainCtrl', function ($scope, $sailsSocket,$state) {
    
    var lat;
    var long;
    $scope.showed = false;
    
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
        
        $scope.showed = true;
    }
    
    
    function calcul(ctr,distance){
  
        var taux_remplissage = ctr.nbPeople/ctr.capacity;
        var ratio_med = ctr.nbPeople/ctr.nbDoctors;
        
        if(taux_remplissage <= 0.25) return true;
        if(taux_remplissage <= 0.50 && ratio_med <= 10) return true;
        if(taux_remplissage <= 0.50 && ratio_med <= 20 && distance <= 40) return true;
        return false;
    }



    function get_best_center(centres,victim) {
    
        //Array to store center,distance,bool_accepted
        var res = [,,];
        
        angular.forEach(centres,function(values,key){
            console.log(values);
            var dist = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(victim.latitude,victim.longitude), new google.maps.LatLng(values.latitude,values.longitude));
            res.push([values,dist,calcul(values,dist)]);
        }) 
  
        
            //Sort array by distance
        res.sort(function(a,b){
           return a[1] - b[1];
        });
        
        //Take the nearest first accepted center 
        for(var l in res){
            if(l[2]==true) return l[0];
        }
        //else take the nearest center
            return res[0][0];
    }
    
    $scope.bestCenter = function(){
        console.log("bestCenter");
        $sailsSocket.get("/center")
            .then(function(res){
                var victim = {latitude: lat, longitude: long};     
                var best = get_best_center(res.data,victim);
                $state.go("app.itinary",{id : best.id});

                //console.log(res.data);
            },function(err){
               console.log(err); 
            })
    }
    
    
        $sailsSocket.get("/strategy")
            .then(function(data) {
                console.log(data);
            }, function(err) {
                console.log(err);
            })

});
