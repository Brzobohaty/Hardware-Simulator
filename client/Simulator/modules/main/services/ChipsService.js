/* global angular */

'use strict';
angular.module('app')

        /**
         * Model všech chipů co jsou nahrané do aplikace
         */
        .factory('ChipsService', ['CompilerService', 'ChipModel', 'ChipSimulationService', function (CompilerService, ChipModel, ChipSimulationService) {
                var chips = []; //{ChipModel} pole chipů v aplikaci
                var simulatedChipIndex = -1; //{int} index chipu, který má být simulován
                var _chipsDependency = {}; //závislosti jednotlivých chipů na jiných chipech (klíč: název závisejícíh chipu, hodnota: pole závislých chipů)

                CompilerService.setChipsArray(chips);
                ChipSimulationService.setChipsArray(chips);

                _testData();

                return {
                    getSimulatedChipIndex: getSimulatedChipIndex,
                    setSimulatedChipIndex: setSimulatedChipIndex,
                    getSimulatedChip: getSimulatedChip,
                    deleteChip: deleteChip,
                    addChip: addChip,
                    getChips: getChips
                };

                function getSimulatedChipIndex() {
                    return simulatedChipIndex;
                }

                function setSimulatedChipIndex(index) {
                    simulatedChipIndex = index;
                }
                
                /**
                 * @returns {array} všechny nahrané chipy v aplikaci
                 */
                function getChips() {
                    return chips;
                }
                
                /**
                 * @returns {ChipModel} simulovatelný chip
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
                    _recompileDependent(chip.getName(), scope);
                }

                /**
                 * Přidá chip
                 * @param {string} chipFileName jméno chipu
                 * @param {string} chipPlainText čistý HDL kód chipu
                 * @param {Scope} scope
                 */
                function addChip(chipFileName, chipPlainText, scope) {
                    var chip = new ChipModel(chipFileName, chipPlainText);
                    chips.push(chip);
                    //tohle jsem zakomentoval kvuli testovani
//                    setTimeout(function () {
                        CompilerService.compile(chip, scope);
                        scope.$apply();
                        if (chip.getSimulatedChip()) {
                            _setDependency(chip.getSimulatedChip().getParts(), chip);
                        } else if (chip.getParts()) {
                            _setDependency(chip.getParts(), chip);
                        }
                        _recompileDependent(chip.getName(), scope);
//                    }, 0);
                }

                /**
                 * Nastaví do pole zavíslostí, že daný chip je závislý na jeho částech
                 * @param {Array} parts části právě zkompilovaného chipu
                 * @param {ChipModel} chip právě zkompilovaný chip
                 */
                function _setDependency(parts, chip) {
                    for (var index in parts) {
                        var partName = parts[index].getName();
                        if (!_chipsDependency.hasOwnProperty(partName)) {
                            _chipsDependency[partName] = {};
                        }
                        if (!_chipsDependency[partName].hasOwnProperty(chip.getName())) {
                            _chipsDependency[partName][chip.getName()] = chip;
                        }
                    }
                }

                /**
                 * Zavolá rekompilaci všech chipů, které jsou závislé na daném chipu
                 * @param {String} chipName název chipu
                 * @param scope
                 */
                function _recompileDependent(chipName, scope) {
                    if (_chipsDependency.hasOwnProperty(chipName)) {
                        for (var index in _chipsDependency[chipName]) {
                            _chipsDependency[chipName][index].recompile(scope);
                            if(getSimulatedChip() && getSimulatedChip().getCompileError()){
                                simulatedChipIndex = -1;
                            }
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
                        },
                        {
                            'fileName': 'And16.hdl',
                            'plainText': 'CHIP And16 {\n    IN a[16], b[16];\n    OUT out[16];\n\n    PARTS:\n    Nand16(a=a, b=b, out=c);\n    Not16(in=c, out=out);\n}'
                        },
                        {
                            'fileName': 'DMux4Way.hdl',
                            'plainText': '/**\n * 4-way demultiplexor.\n * {a,b,c,d} = {in,0,0,0} if sel==00\n *             {0,in,0,0} if sel==01\n *             {0,0,in,0} if sel==10\n *             {0,0,0,in} if sel==11\n */\n\nCHIP DMux4Way {\n    IN in, sel[2];\n    OUT a, b, c, d;\n\n    PARTS:\n    DMux(in=in,sel=sel[1],a=aa,b=bb);\n    DMux(in=aa,sel=sel[0],a=a,b=b);\n    DMux(in=bb,sel=sel[0],a=c,b=d);\n}'
                        },
                        {
                            'fileName': 'Nand16.hdl',
                            'plainText': 'CHIP Nand16 {\n    IN a[16], b[16];\n    OUT out[16];\n\n    PARTS:\n    Nand(a=a[0], b=b[0], out=out[0]);\n    Nand(a=a[1], b=b[1], out=out[1]);\n    Nand(a=a[2], b=b[2], out=out[2]);\n    Nand(a=a[3], b=b[3], out=out[3]);\n    Nand(a=a[4], b=b[4], out=out[4]);\n    Nand(a=a[5], b=b[5], out=out[5]);\n    Nand(a=a[6], b=b[6], out=out[6]);\n    Nand(a=a[7], b=b[7], out=out[7]);\n    Nand(a=a[8], b=b[8], out=out[8]);\n    Nand(a=a[9], b=b[9], out=out[9]);\n    Nand(a=a[10], b=b[10], out=out[10]);\n    Nand(a=a[11], b=b[11], out=out[11]);\n    Nand(a=a[12], b=b[12], out=out[12]);\n    Nand(a=a[13], b=b[13], out=out[13]);\n    Nand(a=a[14], b=b[14], out=out[14]);\n    Nand(a=a[15], b=b[15], out=out[15]);\n\n}'
                        }
                    ];

                    for (var i = 0; i < testchips.length; i++) {
                        addChip(testchips[i].fileName, testchips[i].plainText, {$apply: function () {}});
                    }
                    
                    simulatedChipIndex = 7;
                }
            }]);