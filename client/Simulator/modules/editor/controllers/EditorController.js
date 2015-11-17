'use strict';

angular.module('app.editor')

        /**
         * Přihlášení uživatele
         */
        .controller('EditorController', ['$scope', '$rootScope', function ($scope, $rootScope) {
                $rootScope.page = 'editor';
            }]);

