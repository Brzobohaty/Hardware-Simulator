'use strict';
  
angular.module('app.authentication')
.config(['$stateProvider', function($stateProvider) {
  $stateProvider
    .state('main.login', {
      url: "/login",
      templateUrl: "/Simulator/modules/authentication/views/login.html",
      controller: 'LoginController',
      data: {authenticate: false}
    })
    .state('main.register', {
      url: "/registration",
      templateUrl: "/Simulator/modules/authentication/views/register.html",
      controller: 'RegisterController',
      data: {authenticate: false}
    });
}]);

