/* global angular */

'use strict';
angular.module('app')

        /**
         * Model uživatele
         */
        .factory('UserModel', ['$resource', '$rootScope', function ($resource, $rootScope) {
                return $resource($rootScope.serverURL+'/user/:id');
            }]);