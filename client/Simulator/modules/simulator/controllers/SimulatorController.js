'use strict';

angular.module('app.simulator')

        /**
         * Simulátor
         */
        .controller('SimulatorController', ['$scope', '$rootScope', '$sce', 'ParserService', 'CompilerService', function ($scope, $rootScope, $sce, ParserService, CompilerService) {
                var openedParts = []; //udržuje id částí obvodu, které jsou zrovna otevřené
                $rootScope.page = 'simulator';

                $scope.standardItems = [
                    {sizeX: 2, sizeY: 2, name: 'HDL', main:true, active:true},
                    {sizeX: 1, sizeY: 1, name: 'Input pins', main:true, active:true},
                    {sizeX: 1, sizeY: 1, name: 'Output pins', main:true, active:true},
                    {sizeX: 1, sizeY: 1, name: 'Internal pins', main:true, active:true}
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

                //pro testování ....... smazat
                var simulatedChip = CompilerService.compile("// This file is part of www.nand2tetris.org\n// and the book \"The Elements of Computing Systems\"\n// by Nisan and Schocken, MIT Press.\n// File name: projects/01/Xor.hdl\n\n/**\n *  Exclusive-or gate: out = !(a == b).\n */\n\n/** \n*/\nCHIP Xor {\n    IN a, b;\n    OUT out;\n\n    PARTS:\n    Not(in=b,out=bn);\n    And(a=a, b=bn, out=ab);\n    Not(in=a,out=an);\n    And(a=an, b=b, out=ba);\n    Or(a=ab ,b=ba ,out=out );\n}");

                if (!simulatedChip) {
                    $scope.compileError = true;
                }


                $scope.rowsArray = CompilerService.getTokens();
                $scope.simulatedChip = simulatedChip;

                _makePartsWindows();

                //přiřazení funkcí
                $scope.mouseOverRow = mouseOverRow;
                $scope.saveBind = $sce.trustAsHtml;
                $scope.renderErrorsFromRow = renderErrorsFromRow;
                $scope.isKeyword = ParserService.isKeyWord;
                $scope.showPart = showPart;
                $scope.closeGrid = closeGrid;

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
                function _makePartsWindows(){
                    for(var key in simulatedChip.parts){
                        $scope.standardItems.push({sizeX: 1, sizeY: 1, name: 'Part pins', active:false, partId:simulatedChip.parts[key].id, part: simulatedChip.parts[key]});
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
                        if (errors.length > 0 && row[i].errorMes) {
                            errors += '\n\n';
                        }
                        if (row[i].errorMes) {
                            errors += row[i].errorMes;
                        }
                    }
                    return errors;
                }
            }]);

