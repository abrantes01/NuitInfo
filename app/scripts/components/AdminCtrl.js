/**
* Created by gnomine on 30/06/15.
*/
'use strict';

angular.module('sauvetapp')
.controller('AdminCtrl', function ($scope, $sailsSocket) {

    $sailsSocket.get("/strategy")
    .then(function(data) {
        console.log(data);
    }, function(err) {
        console.log(err);
    })

});
