'use strict';
  
angular.module('app')

/**
 * Hlavní kostra dokumentu
 */
.controller('404Controller', ['$rootScope', function ($rootScope) {
    $rootScope.bodyClass = "page-error";
}]);

