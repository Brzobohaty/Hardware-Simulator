/* global angular */

'use strict';

angular.module('app')

        /**
         * Slouží pro vytváření částí simulovaného objektu
         */
        .factory('ChipSimulationService', ['ChipPart', function (ChipPart) {
                var chips; //{Array} pole všech chipů v aplikaci
                var builtInChips = { //seznam builtIn chipů
                    'Not': new ChipPart('Not', {'in': {value: 0}}, {'out': {value: 1}}, function () {
                        this.outputs['out'].bits[0].value = Number(!this.inputs['in'].bits[0].value);
                    }),
                    'And': new ChipPart('And', {'a': {value: 0}, 'b': {value: 0}}, {'out': {value: 0}}, function () {
                        this.outputs['out'].bits[0].value = Number(this.inputs['a'].bits[0].value & this.inputs['b'].bits[0].value);
                    }),
                    'Or': new ChipPart('Or', {'a': {value: 0}, 'b': {value: 0}}, {'out': {value: 0}}, function () {
                        this.outputs['out'].bits[0].value = Number(this.inputs['a'].bits[0].value | this.inputs['b'].bits[0].value);
                    }),
                    'Nand': new ChipPart('Nand', {'a': {value: 0}, 'b': {value: 0}}, {'out': {value: 0}}, function () {
                        this.outputs['out'].bits[0].value = Number(!(this.inputs['a'].bits[0].value & this.inputs['b'].bits[0].value));
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
                 * @returns {ChipPart} chip nebo false, pokud nebyl nalezen odpovídající buildInChip
                 */
                function getUserChip(name) {
                    var userChip = _.findWhere(chips, {name: name});
                    if (userChip && userChip.simulatedChip) {
                        var userSimulatedChip = angular.copy(userChip.simulatedChip);
                        var inputs = {};
                        for (var index in userSimulatedChip.inputs) {
                            inputs[userSimulatedChip.inputs[index].name] = {'value':userSimulatedChip.inputs[index].value};
                        }
                        var outputs = {};
                        for (var index in userSimulatedChip.outputs) {
                            outputs[userSimulatedChip.outputs[index].name] = {'value':userSimulatedChip.outputs[index].value};
                        }
                        var chiPart = new ChipPart(name, inputs, outputs, null, userSimulatedChip);  
                        return chiPart;
                    } else {
                        return false;
                    }
                }

                /**
                 * Fabrika na builtin chipy.
                 * @param {String} name jméno chipu
                 * @returns {ChipPart} chip nebo false, pokud nebyl nalezen odpovídající buildInChip
                 */
                function getBuiltInChip(name) {
                    if (builtInChips.hasOwnProperty(name)) {
                        return angular.copy(builtInChips[name]);
                    }
                    return false;
                }
            }]);