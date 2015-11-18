'use strict';

angular.module('app.simulator')

        /**
         * Simulátor
         */
        .controller('SimulatorController', ['$scope', '$rootScope', 'ChipModel', '$sce', 'ParserService', function ($scope, $rootScope, ChipModel, $sce, ParserService) {
                $rootScope.page = 'simulator';

                $scope.standardItems = [
                    {sizeX: 2, sizeY: 2, row: 0, col: 0, name: 'HDL'},
                    {sizeX: 1, sizeY: 1, row: 0, col: 2, name: 'Input pins'},
                    {sizeX: 1, sizeY: 1, row: 0, col: 3, name: 'Output pins'},
                    {sizeX: 1, sizeY: 1, row: 0, col: 4, name: 'Internal pins'}
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
                $scope.compileError = !ChipModel.setPlainText("// This file is part of www.nand2tetris.org\n// and the book \"The Elements of Computing Systems\"\n// by Nisan and Schocken, MIT Press.\n// File name: projects/01/Xor.hdl\n\n/**\n *  Exclusive-or gate: out = !(a == b).\n */\n\n/** \n*/\nCHIP Xor {\n    IN a, b;\n    OUT out;\n\n    PARTS:\n    Not(in=b,out=bn);\n    And(a=a, b=bn, out=ab);\n    Not(in=a,out=an);\n    And(a=an, b=b, out=ba);\n    Or(a=ab ,b=ba ,out=out );\n}");

                $scope.rowsArray = ChipModel.getRows();
                $scope.chipName = ChipModel.getName();
                $scope.parts = ChipModel.getParts();
                $scope.inputs = ChipModel.getInputs();
                $scope.outputs = ChipModel.getOutputs();
                
                $scope.outputs[0].value = compute();

                //přiřazení funkcí
                $scope.mouseOverRow = mouseOverRow;
                $scope.saveBind = $sce.trustAsHtml;
                $scope.renderErrorsFromRow = renderErrorsFromRow;
                $scope.isKeyword = ParserService.isKeyWord;

                function compute() {
                    return $scope.inputs[0].value + $scope.inputs[1].value;
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

