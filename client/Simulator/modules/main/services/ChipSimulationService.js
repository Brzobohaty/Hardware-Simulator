/* global angular */

'use strict';

angular.module('app')

        /**
         * Slouží pro vytváření částí simulovaného objektu
         */
        .factory('ChipSimulationService', ['ChipSimulatedPartModel', function (ChipSimulatedPartModel) {
                var chips; //{Array} pole všech chipů v aplikaci
                var builtInChips = { //seznam builtIn chipů
                    'Not': new ChipSimulatedPartModel({'in': null}, {'out': null}, function () {
                        this.outputs['out'].getBits()[0].setValue(Number(!this.inputs['in'].getBits()[0].getValue()));
                    }),
                    'And': new ChipSimulatedPartModel({'a': null, 'b': null}, {'out': null}, function () {
                        this.outputs['out'].getBits()[0].setValue(Number(this.inputs['a'].getBits()[0].getValue() & this.inputs['b'].getBits()[0].getValue()));
                    }),
                    'Or': new ChipSimulatedPartModel({'a': null, 'b': null}, {'out': null}, function () {
                        this.outputs['out'].getBits()[0].setValue(Number(this.inputs['a'].getBits()[0].getValue() | this.inputs['b'].getBits()[0].getValue()));
                    }),
                    'Nand': new ChipSimulatedPartModel({'a': null, 'b': null}, {'out': null}, function () {
                        this.outputs['out'].getBits()[0].setValue(Number(!(this.inputs['a'].getBits()[0].getValue() & this.inputs['b'].getBits()[0].getValue())));
                    })
                };

                return {
                    setChipsArray: setChipsArray,
                    getUserChip: getUserChip,
                    getBuiltInChip: getBuiltInChip
                };

                /**
                 * @param {Array} chipss pole všech chipů v aplikaci (ChipModel)
                 */
                function setChipsArray(chipss) {
                    chips = chipss;
                }

                /**
                 * Fabrika na chipy načtené od uživatele.
                 * @param {String} name jméno chipu
                 * @returns {ChipSimulatedPartModel} chip nebo false, pokud nebyl nalezen odpovídající buildInChip
                 */
                function getUserChip(name) {
                    var userChip = findUserChip(name);
                    if (userChip && userChip.getSimulatedChip()) {
                        var userSimulatedChip = angular.copy(userChip.getSimulatedChip());
                        var inputs = {};
                        for (var index in userSimulatedChip.getInputs()) {
                            inputs[userSimulatedChip.getInputs()[index].getName()] = null;
                        }
                        var outputs = {};
                        for (var index in userSimulatedChip.getOutputs()) {
                            outputs[userSimulatedChip.getOutputs()[index].getName()] = null;
                        }
                        var chipPart = new ChipSimulatedPartModel(inputs, outputs, null, userSimulatedChip);  
                        return chipPart;
                    } else {
                        return false;
                    }
                }
                
                /**
                 * Najde chip nahraný uživatelem 
                 * @param {String} name jméno chipu
                 * @returns {ChipModel} simulovatelný chip
                 */
                function findUserChip(name){
                    for(var index in chips){
                        if(chips[index].getName() === name){
                            return chips[index];
                        }
                    }
                    return null;
                }

                /**
                 * Fabrika na builtin chipy.
                 * @param {String} name jméno chipu
                 * @returns {ChipSimulatedPartModel} chip nebo false, pokud nebyl nalezen odpovídající buildInChip
                 */
                function getBuiltInChip(name) {
                    if (builtInChips.hasOwnProperty(name)) {
                        return angular.copy(builtInChips[name]);
                    }
                    return false;
                }
            }]);