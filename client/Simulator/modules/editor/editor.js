'use strict';
  
angular.module('app.editor')
.config(['$stateProvider', function($stateProvider) {
  $stateProvider
    .state('main.editor', {
      url: '/editor',
      templateUrl: "/Simulator/modules/editor/views/editor.html",
      controller: 'EditorController',
      data: {authenticate: false}
    });
}]);

