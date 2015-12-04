/**
* Created by gnomine on 30/06/15.
*/
'use strict';

angular.module('sauvetapp')
.controller('StrategiesCtrl', function ($scope, $sailsSocket) {

    $sailsSocket.get("/strategy")
    .then(function(response) {
        $scope.strategies = response.data;
    }, function(err) {
        console.log(err);
    })

});
