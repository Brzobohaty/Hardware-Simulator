'use strict';

angular.module('app.project')

        /**
         * Přihlášení uživatele
         */
        .controller('ProjectController', ['$scope', '$rootScope', 'ChipModel', function ($scope, $rootScope, ChipModel) {
                $rootScope.page = 'project';
                $scope.readMethod = "readAsText";
                
                $scope.onReaded = function (e, file) {
                    ChipModel.setPlainText(e.target.result);
                };
            }]);