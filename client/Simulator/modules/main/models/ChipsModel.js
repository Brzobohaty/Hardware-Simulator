/* global angular */

'use strict';
angular.module('app')

        /**
         * Model všech chipů co jsou nahrané do aplikace
         */
        .factory('ChipsModel', ['CompilerService', 'ParserService', function (CompilerService, ParserService) {
                var chips = []; //pole chipů v aplikaci
                var simulatedChipIndex = -1; //index chipu, který má být simulován

                _testData();

                return {
                    chips: chips,
                    getSimulatedChipIndex:getSimulatedChipIndex,
                    setSimulatedChipIndex:setSimulatedChipIndex,
                    getSimulatedChip: getSimulatedChip,
                    deleteChip:deleteChip,
                    addChip:addChip
                };

                function getSimulatedChipIndex(){
                    return simulatedChipIndex;
                }
                
                function setSimulatedChipIndex(index){
                    simulatedChipIndex = index;
                }

                /**
                 * @returns {Object} simulovatelný chip
                 */
                function getSimulatedChip() {
                    return chips[simulatedChipIndex];
                }
                
                /**
                 * Odstraní chip
                 * @param {int} index v poli
                 */
                function deleteChip(index) {
                    if (index === simulatedChipIndex) {
                        simulatedChipIndex = -1;
                    }
                    chips.splice(index, 1);
                }
                
                /**
                 * Přidá chip
                 * @param {Object} chip
                 * @param {Scope} scope
                 */
                function addChip(chip, scope) {
                    chips.push(chip);
                    setTimeout(function () {
                        CompilerService.compile(chip, scope);
                        scope.$apply();
                    }, 0);
                }

                /**
                 * Metoda pouze pro testování. Nahraje sadu chipů a nastaví jeden jako simulovaný.
                 */
                function _testData() {
                    chips = [
                        {
                            'fileName': 'soubor.hdl',
                            'plainText': 'obsah jako balyen'
                        },
                        {
                            'fileName': 'soubor2.hdl',
                            'plainText': '"// This file is part of www.nand2tetris.org\n// and the book \"The Elements of Computing Systems\"\n// by Nisan and Schocken, MIT Press.\n// File name: projects/01/Xor.hdl\n\n/**\n *  Exclusive-or gate: out = !(a == b).\n */\n\n/** \n*/\nCHIP Xor {\n    IN a, b;\n    OUT out;\n\n    PARTS:\n    Not(in=b,out=bn);\n    And(a=a, b=bn, out=ab);\n    Not(in=a,out=an);\n    And(a=an, b=b, out=ba);\n    Or(a=ab ,b=ba ,out=out );\n}"'
                        },
                        {
                            'fileName': 'soubor3.hdl',
                            'plainText': '"// This file is part of www.nand2tetris.org\n// and the book \"The Elements of Computing Systems\"\n// by Nisan and Schocken, MIT Press.\n// File name: projects/01/Xor.hdl\n\n/**\n *  Exclusive-or gate: out = !(a == b).\n */\n\n/** \n*/\nCHIP Xor {\n    IN a, b;\n    OUT out;\n\n    PARTS:\n    Not(in=b,out=bn);\n    And(a=a, b=bn, out=ab);\n    Not(in=a,out=an);\n    And(a=an, b=b, out=ba);\n    Or(a=ab ,b=ba ,out=out );\n}"'
                        },
                        {
                            'fileName': 'soubor4.hdl',
                            'plainText': '"// This file is part of www.nand2tetris.org\n// and the book \"The Elements of Computing Systems\"\n// by Nisan and Schocken, MIT Press.\n// File name: projects/01/Xor.hdl\n\n/**\n *  Exclusive-or gate: out = !(a == b).\n */\n\n/** \n*/\nCHIP Xor {\n    IN a, b;\n    OUT out;\n\n    PARTS:\n    Not(in=b,out=bn);\n    And(a=a, b=bn, out=ab);\n    Not(in=a,out=an);\n    And(a=an, b=b, out=ba);\n    Or(a=ab ,b=ba ,out=out );\n}"'
                        },
                        {
                            'fileName': 'soubor5.hdl',
                            'plainText': '"// This file is part of www.nand2tetris.org\n// and the book \"The Elements of Computing Systems\"\n// by Nisan and Schocken, MIT Press.\n// File name: projects/01/Xor.hdl\n\n/**\n *  Exclusive-or gate: out = !(a == b).\n */\n\n/** \n*/\nCHIP Xor {\n    IN a, b;\n    OUT out;\n\n    PARTS:\n    Not(in=b,out=bn);\n    And(a=a, b=bn, out=ab);\n    Not(in=a,out=an);\n    And(a=an, b=b, out=ba);\n    Or(a=ab ,b=ba ,out=out );\n}"'
                        }
                    ];
                    
                    for (var i = 0; i < chips.length; i++) {
                        CompilerService.compile(chips[i]);
                    }
                    
                    //simulatedChipIndex = 2;
                }
            }]);