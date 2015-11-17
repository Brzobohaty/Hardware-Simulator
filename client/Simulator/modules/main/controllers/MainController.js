'use strict';

angular.module('app')

        /**
         * Hlavní kostra dokumentu
         */
        .controller('MainController', ['$rootScope', 'UserModel', '$scope', 'AuthenticationService', function ($rootScope, UserModel, $scope, AuthenticationService) {

                /**
                 * Vrátí usera podle tokenu, který má uživatel uložen v lokálním uložišti.
                 */
                if(AuthenticationService.isLoggedIn()){
                    var user = UserModel.get({id: 0}, function () {
                        $rootScope.user = user;
                    });
                }
            }]);

