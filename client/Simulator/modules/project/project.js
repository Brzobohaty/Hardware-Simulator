'use strict';
  
angular.module('app.project', ['ngFileReader'])
.config(['$stateProvider', function($stateProvider) {
  $stateProvider
    .state('main.project', {
      url: '/project',
      templateUrl: "/Simulator/modules/project/views/project.html",
      controller: 'ProjectController',
      data: {authenticate: false}
    });
}]);

