'use strict';

angular.module('app.project')

        /**
         * Spravování projektu (Nahrávání chipů, volbu simulace)
         */
        .controller('ProjectController', ['$scope', '$rootScope', 'ChipsService', function ($scope, $rootScope, ChipsService) {
                $rootScope.page = 'project';
                $scope.chipsModel = ChipsService;

                //přiřazení funkcí
                $scope.onReadedFile = onReadedFile;
                $scope.changeChipUsed = changeChipUsed;

                function changeChipUsed(part) {
                    if (part.builtIn) {
                        part.getBuiltInChip().activate();
                        part.getUserChip().deactivate();
                    } else {
                        part.getBuiltInChip().deactivate();
                        part.getUserChip().activate();
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