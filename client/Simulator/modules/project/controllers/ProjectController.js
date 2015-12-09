'use strict';

angular.module('app.project')

        /**
         * Přihlášení uživatele
         */
        .controller('ProjectController', ['$scope', '$rootScope', 'CompilerService', 'ChipsModel', function ($scope, $rootScope, CompilerService, ChipsModel) {
                $rootScope.page = 'project';
                $scope.chipsModel = ChipsModel;

                //přiřazení funkcí
                $scope.onReadedFile = onReadedFile;
                
                /**
                 * Přečte soubor a uloží jeho hlavní parametry do pole.
                 * @param {event} e
                 * @param {File} file
                 */
                function onReadedFile(e, file) {
                    var chip = {'fileName': file.name, 'plainText': e.target.result};
                    ChipsModel.addChip(chip, $scope);
                }
            }]);