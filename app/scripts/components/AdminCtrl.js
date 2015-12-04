/**
* Created by gnomine on 30/06/15.
*/
'use strict';

angular.module('sauvetapp')
.controller('AdminCtrl', function ($scope, $sailsSocket, $timeout) {

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

});
