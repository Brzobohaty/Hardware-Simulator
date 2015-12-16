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
                $scope.changeChipUsed = changeChipUsed;

                function changeChipUsed(part) {
                    if (part.builtIn === 'true') {
                        part.builtInChip.active = true;
                        part.userChip.active = false;
                    } else {
                        part.builtInChip.active = false;
                        part.userChip.active = true;
                    }
                    $scope.chipsModel.getSimulatedChip().simulatedChip.reComputeAll();
                }

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