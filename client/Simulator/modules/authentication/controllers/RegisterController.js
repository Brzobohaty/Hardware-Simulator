'use strict';

angular.module('app.authentication')

        /**
         * Registrace uživatele
         * http://code.tutsplus.com/tutorials/token-based-authentication-with-angularjs-nodejs--cms-22543
         */
        .controller('RegisterController', ['$scope', '$state', 'AuthenticationService', 'UserModel', '$rootScope', 'toaster', function ($scope, $state, AuthenticationService, UserModel, $rootScope, toaster) {
                $rootScope.page = 'registration';

                $scope.dirtyAll = false;
                AuthenticationService.logout();

                $scope.registerData = new UserModel();

                $scope.register = function () {
                    if ($scope.registerForm.$invalid) {
                        $scope.dirtyAll = true;
                    } else {
                        $scope.dataLoading = true;
                        $scope.registerData.$save(function (response) {
                            $state.go('main.login');
                            $scope.registerData = {};
                            $scope.dataLoading = false;
                        }, function (response) {
                            $scope.registerForm.$setPristine();
                            toaster.pop('warning', 'Error', response.data.errorMessage);
                            $scope.registerData = {};
                            $scope.dataLoading = false;
                        });
                    }
                };
            }]);

