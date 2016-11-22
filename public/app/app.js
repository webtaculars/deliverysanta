var app = angular.module('MyApp', ['appRoutes','mainCtrl','authService','userCtrl','userService','ngAnimate','ui.bootstrap','typeaheadCtrl','typeaheadService','restaurantCtrl'])


.config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
})