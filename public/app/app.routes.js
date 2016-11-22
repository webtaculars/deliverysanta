angular.module('appRoutes',['ngRoute'])


.config(function($routeProvider,$locationProvider){

    $routeProvider
        .when('/', {
            templateUrl: 'app/views/pages/home.html'

        })
        .when('/login',{
            templateUrl: 'app/views/pages/login.html'
        })
        .when('/signup',{
            templateUrl: 'app/views/pages/signup.html'
        })
        .when('/restaurant',{
            templateUrl: 'app/views/pages/restaurant.html'
        })

    $locationProvider.html5Mode(true);
})