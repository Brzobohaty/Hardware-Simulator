'use strict';

angular.module('app.simulator')

        /**
         * Simulátor
         */
        .controller('SimulatorController', ['$scope', '$rootScope', '$sce', 'CompilerService', 'ChipsService', function ($scope, $rootScope, $sce, CompilerService, ChipsService) {
                $rootScope.page = 'simulator';
                var chip = ChipsService.getSimulatedChip();
                
                if (chip) {
                    $scope.simulatedChip = chip.simulatedChip;
                    
                    _setGridster();
                    _makePartsWindows();
                    
                    //přiřazení proměnných
                    $scope.rowsArray = chip.getTokens(); //řádky HDL kódu

                    //přiřazení funkcí
                    $scope.mouseOverRow = mouseOverRow;
                    $scope.saveBind = $sce.trustAsHtml;
                    $scope.renderErrorsFromRow = renderErrorsFromRow;
                    $scope.showPart = showPart;
                    $scope.closeGrid = closeGrid;
                }

                /**
                 * Nastaví gridster a naplní ho hlavními okny
                 */
                function _setGridster() {
                    //vytvoření hlavních oken
                    $scope.standardItems = [
                        {sizeX: 2, sizeY: 3, name: 'HDL', main: true, active: true},
                        {sizeX: 1, sizeY: 1, name: 'Input pins', main: true, active: true},
                        {sizeX: 1, sizeY: 1, name: 'Output pins', main: true, active: true},
                        {sizeX: 1, sizeY: 1, name: 'Internal pins', main: true, active: true}
                    ];

                    //nastavení gridsteru
                    $scope.gridsterOpts = {
                        //https://github.com/ManifestWebDesign/angular-gridster
                        pushing: true, // whether to push other items out of the way on move or resize
                        //floating: false, // whether to automatically float items up so they stack (you can temporarily disable if you are adding unsorted items with ng-repeat)
                        swapping: true, // whether or not to have items of the same size switch places instead of pushing down if they are the same size
                        draggable: {
                            handle: '.moveIcon'
                        }
                    };
                }

                /**
                 * Zavře dané okno
                 * @param {Object} item okno v gridsteru
                 */
                function closeGrid(item) {
                    //openedParts.splice(openedParts.indexOf(item.part.id), 1);
                    //$scope.standardItems.splice($scope.standardItems.indexOf(item), 1);
                    item.active = false;
                    item.part.nameToken.hover = false;
                }

                /**
                 * Vytvoří okna pro stavy pinů jednotlivých částí obvodu
                 */
                function _makePartsWindows() {
                    for (var key in $scope.simulatedChip.parts) {
                        $scope.standardItems.push({sizeX: 1, sizeY: 1, name: 'Part pins', active: false, partId: $scope.simulatedChip.parts[key].id, part: $scope.simulatedChip.parts[key]});
                    }
                }

                /**
                 * Zobrazí okno, které bude zobrazovat stavy na pinech dané části obvodu
                 * @param {int} partId id části
                 */
                function showPart(partId) {
                    if (partId) {
                        var part = _.findWhere($scope.standardItems, {partId: partId});
                        part.active = true;
                    }
                }

                /**
                 * Funkce při přejetí myši přes řádek.
                 * @param {int} rowNumber pořadí řádku
                 */
                function mouseOverRow(rowNumber) {
                    $scope.rowNumberHover = rowNumber;
                }

                /**
                 * Projede všechny chyby z daného řádku a vrátí je všechny v jedno řetězci odděleny novým řádkem
                 * @param {array} row pole tokenů v řádku
                 * @returns {String} všechny chyby z řádku
                 */
                function renderErrorsFromRow(row) {
                    var errors = '';
                    for (var i = 0; i < row.length; i++) {
                        if (errors.length > 0 && row[i].getErrorMes()) {
                            errors += '\n\n';
                        }
                        if (row[i].getErrorMes()) {
                            errors += row[i].getErrorMes();
                        }
                    }
                    return errors;
                }
            }]);

