'use strict';

angular.module('app.project')

        /**
         * Přihlášení uživatele
         */
        .controller('ProjectController', ['$scope', '$rootScope', 'ChipsService', function ($scope, $rootScope, ChipsService) {
                $rootScope.page = 'project';
                $scope.chipsModel = ChipsService;

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
                    ChipsService.getSimulatedChip().simulatedChip.reComputeAll();
                }

                /**
                 * Přečte soubor a uloží jeho hlavní parametry do pole.
                 * @param {event} e
                 * @param {File} file
                 */
                function onReadedFile(e, file) {
                    ChipsService.addChip(file.name, e.target.result, $scope);
                }
            }]);