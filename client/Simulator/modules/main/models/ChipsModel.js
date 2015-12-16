/* global angular */

'use strict';
angular.module('app')

        /**
         * Model všech chipů co jsou nahrané do aplikace
         */
        .factory('ChipsModel', ['CompilerService', 'ChipModel', 'ChipSimulationService', function (CompilerService, ChipModel, ChipSimulationService) {
                var chips = []; //pole chipů v aplikaci
                var simulatedChipIndex = -1; //index chipu, který má být simulován
                var chipsDependency = {}; //závislosti jednotlivých chipů na jiných chipech (klíč: název závisejícíh chipu, hodnota: pole závislých chipů)

                CompilerService.setChipsArray(chips);
                ChipSimulationService.setChipsArray(chips);

                _testData();

                return {
                    chips: chips,
                    getSimulatedChipIndex: getSimulatedChipIndex,
                    setSimulatedChipIndex: setSimulatedChipIndex,
                    getSimulatedChip: getSimulatedChip,
                    deleteChip: deleteChip,
                    addChip: addChip
                };

                function getSimulatedChipIndex() {
                    return simulatedChipIndex;
                }

                function setSimulatedChipIndex(index) {
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
                 * @param {Scope} scope
                 */
                function deleteChip(index, scope) {
                    if (index === simulatedChipIndex) {
                        simulatedChipIndex = -1;
                    }
                    if(simulatedChipIndex > index){
                       simulatedChipIndex--; 
                    }
                    var chip = chips[index];
                    chips.splice(index, 1);
                    _recompileDependent(chip, scope);
                }

                /**
                 * Přidá chip
                 * @param {Object} chip
                 * @param {Scope} scope
                 */
                function addChip(chip, scope) {
                    chip = new ChipModel(chip.fileName, chip.plainText);
                    chips.push(chip);
                    //tohle jsem zakomentoval kvuli testovani
//                    setTimeout(function () {
                        CompilerService.compile(chip, scope);
                        scope.$apply();
                        if (chip.simulatedChip) {
                            _setDependency(chip.simulatedChip.parts, chip);
                        } else if (chip.parts) {
                            _setDependency(chip.parts, chip);
                        }
                        _recompileDependent(chip, scope);
//                    }, 0);
                }

                /**
                 * Nastaví do pole zavíslostí, že daný chip je závislý na jeho částech
                 * @param {Array} parts části právě zkompilovaného chipu
                 * @param {Object} chip právě zkompilovaný chip
                 */
                function _setDependency(parts, chip) {
                    for (var index in parts) {
                        var partName = parts[index].name;
                        if (!chipsDependency.hasOwnProperty(partName)) {
                            chipsDependency[partName] = {};
                        }
                        if (!chipsDependency[partName].hasOwnProperty(chip.name)) {
                            chipsDependency[partName][chip.name] = chip;
                        }
                    }
                }

                /**
                 * Zavolá rekompilaci všech chipů, které jsou závislé na daném chipu
                 * @param {Object} chip
                 * @param {Object} scope
                 */
                function _recompileDependent(chip, scope) {
                    if (chipsDependency.hasOwnProperty(chip.name)) {
                        for (var index in chipsDependency[chip.name]) {
                            chipsDependency[chip.name][index].recompile(scope);
                        }
                    }
                }

                /**
                 * Metoda pouze pro testování. Nahraje sadu chipů a nastaví jeden jako simulovaný.
                 */
                function _testData() {
                    var testchips = [
                        {
                            'fileName': 'soubor.hdl',
                            'plainText': 'CHIP jako balyen'
                        },
                        {
                            'fileName': 'soubor2.hdl',
                            'plainText': 'CHIP Or {\n    IN a, b;\n    OUT out;\n\n    PARTS:\n    Not(in=a , out=ai);\n    Not(in=b , out=bi);\n    Nand(a=ai, b=bi, out=out);\n}'
                        },
                        {
                            'fileName': 'soubor3.hdl',
                            'plainText': 'CHIP Not {\n    IN in;\n    OUT out;\n\n    PARTS:\n    Nand(a=in, b=in, out=out);\n}'
                        },
                        {
                            'fileName': 'soubor4.hdl',
                            'plainText': 'CHIP And {\n    IN a, b;\n    OUT out;\n\n    PARTS:\n    Nand(a=a, b=b, out=c);\n    Not(in=c, out=out);\n}'
                        },
                        {
                            'fileName': 'soubor5.hdl',
                            'plainText': '// This file is part of www.nand2tetris.org\n// and the book \"The Elements of Computing Systems\"\n// by Nisan and Schocken, MIT Press.\n// File name: projects/01/Xor.hdl\n\n/**\n *  Exclusive-or gate: out = !(a == b).\n */\n\n/** \n*/\nCHIP Xor3 {\n    IN a, b;\n    OUT out;\n\n    PARTS:\n    Not(in=b,out=bn);\n    And(a=a, b=bn, out=ab);\n    Not(in=a,out=an);\n    And(a=an, b=b, out=ba);\n    Or(a=ab ,b=ba ,out=out );\n}'
                        }
                    ];

                    for (var i = 0; i < testchips.length; i++) {
                        addChip(testchips[i], {$apply: function () {}});
                    }
                    
                    simulatedChipIndex = 1;
                }
            }]);