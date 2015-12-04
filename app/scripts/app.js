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
    'textAngular'
])
.config(function ($stateProvider, $urlRouterProvider, $locationProvider, $sailsSocketProvider, $httpProvider) {


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
        templateUrl: '/views/home.html'
    });

});
