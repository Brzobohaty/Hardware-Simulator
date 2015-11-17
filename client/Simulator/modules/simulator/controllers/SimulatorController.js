'use strict';

angular.module('app.simulator')

        /**
         * Simulátor
         */
        .controller('SimulatorController', ['$scope', '$rootScope', 'ChipModel', '$sce', 'ParserService', function ($scope, $rootScope, ChipModel, $sce, ParserService) {
                $rootScope.page = 'simulator';

                $scope.standardItems = [
                    {sizeX: 4, sizeY: 4, row: 0, col: 0, name: 'HDL', chipDefinition: true},
                    {sizeX: 2, sizeY: 2, row: 0, col: 5, name: 'Test', test: true}
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
                ChipModel.setPlainText("// This file is part of www.nand2tetris.org\n// and the book \"The Elements of Computing Systems\"\n// by Nisan and Schocken, MIT Press.\n// File name: projects/01/Xor.hdl\n\n/**\n *  Exclusive-or gate: out = !(a == b).\n */\n\n/** \n*/\nCHI Xor {\n    IN a, b;\n    OUT out;\n\n    PARTS:\n    Not(in=b,out=bn);\n    And(a=a, b=bn, out=ab);\n    Not(in=a,out=an);\n    And(a=an, b=b, out=ba);\n    Or(a=ab ,b=ba ,out=out );\n}");

                //$scope.chipPlain = $sce.trustAsHtml(ChipModel.getHtml());
                $scope.rowsArray = ChipModel.getRows();

                //přiřazení funkcí
                $scope.mouseOverRow = mouseOverRow;
                $scope.saveBind = $sce.trustAsHtml;
                $scope.renderErrorsFromRow = renderErrorsFromRow;
                $scope.isKeyword = ParserService.isKeyWord;

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
                        if(errors.length>0 && row[i].errorMes){
                            errors += '\n\n';
                        }
                        if (row[i].errorMes) {
                            errors += row[i].errorMes;
                        }
                    }
                    return errors;
                }
            }]);

