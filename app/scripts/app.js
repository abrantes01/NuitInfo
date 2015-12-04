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
    })
});
