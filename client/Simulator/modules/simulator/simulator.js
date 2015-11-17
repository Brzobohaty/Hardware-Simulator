'use strict';

angular.module('app.simulator', ['gridster'])
.config(['$stateProvider', function($stateProvider) {
  $stateProvider
    .state('main.simulator', {
      url: '/simulator',
      templateUrl: "/Simulator/modules/simulator/views/simulator.html",
      controller: 'SimulatorController',
      data: {authenticate: false}
    });
}]);

