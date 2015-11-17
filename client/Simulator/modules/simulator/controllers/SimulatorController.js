'use strict';

angular.module('app.simulator')

        /**
         * Simulátor
         */
        .controller('SimulatorController', ['$scope', '$rootScope', 'ChipModel', '$sce', function ($scope, $rootScope, ChipModel, $sce) {
                $rootScope.page = 'simulator';

                $scope.standardItems = [
                    {sizeX: 2, sizeY: 2, row: 0, col: 0, name: 'HDL', chipDefinition: true},
                    {sizeX: 2, sizeY: 2, row: 0, col: 2, name: 'Test', test: true},
                    {sizeX: 1, sizeY: 1, row: 0, col: 4},
                    {sizeX: 1, sizeY: 1, row: 0, col: 5},
                    {sizeX: 1, sizeY: 1, row: 1, col: 4},
                    {sizeX: 1, sizeY: 2, row: 1, col: 5},
                    {sizeX: 1, sizeY: 1, row: 2, col: 0},
                    {sizeX: 2, sizeY: 1, row: 2, col: 1},
                    {sizeX: 1, sizeY: 1, row: 2, col: 3},
                    {sizeX: 1, sizeY: 1, row: 2, col: 4}
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
                $scope.chipPlain = ChipModel.getRows();
                $scope.compileErrors =  ChipModel.getCompileErrors();
                $scope.codeRowsCount = ChipModel.getRowsCount();
                
                
                if(ChipModel.getCompileErrors()[12]){
                    //alert();
                    $scope.test = $scope.chipPlain[12-1];
                }
                
                //přiřazení funkcí
                $scope.mouseOverRow = mouseOverRow;
                $scope.saveBind = $sce.trustAsHtml;
                
                /**
                 * Funkce při přejetí myši přes řádek.
                 * @param {int} rowNumber pořadí řádku
                 */
                function mouseOverRow(rowNumber){
                    $scope.rowNumberHover = rowNumber;
                }
                
            }]);

