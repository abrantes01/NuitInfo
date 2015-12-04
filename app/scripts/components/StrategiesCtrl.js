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
});
