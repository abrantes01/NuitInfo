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
.config(function ($stateProvider, $urlRouterProvider, $locationProvider, $sailsSocketProvider, $httpProvider) {


    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $httpProvider.interceptors.push('AuthInterceptor');
    $sailsSocketProvider.interceptors.push('AuthInterceptor');



    $urlRouterProvider.otherwise("/app/home");

    $stateProvider
    .state('app', {
        url: '/app',
        templateUrl: '/views/app.html'
    })
    .state("app.home", {
        url: "/home",
        controller: 'MainCtrl',
        templateUrl: '/views/home/home.html'
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
    })
});
