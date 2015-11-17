'use strict';

angular.module('app.authentication')

        /**
         * Přihlášení uživatele
         * http://code.tutsplus.com/tutorials/token-based-authentication-with-angularjs-nodejs--cms-22543
         */
        .controller('LoginController', ['$scope', 'AuthenticationService', '$rootScope', 'toaster', '$state', function ($scope, AuthenticationService, $rootScope, toaster, $state) {
                $rootScope.page = 'login';

                AuthenticationService.logout();
                $scope.login = function () {
                    if ($scope.loginForm.$invalid) {
                        $scope.dirtyAll = true;
                    } else {
                        $scope.dataLoading = true;
                        AuthenticationService.login($scope.loginData)
                                .then(function (response) {
                                    $state.go('main.simulator');
                                    $scope.loginData = {};
                                    $scope.dataLoading = false;
                                })
                                .catch(function (response) {
                                    $scope.loginForm.$setPristine();
                                    toaster.pop('warning', 'Error', response.data.errorMessage);
                                    $scope.loginData = {};
                                    $scope.dataLoading = false;
                                });
                    }
                };
            }]);

