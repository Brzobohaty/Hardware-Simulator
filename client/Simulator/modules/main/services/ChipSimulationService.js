/* global angular */

'use strict';

angular.module('app')

        /**
         * Slouží pro vytváření objektu pro simulování
         */
        .factory('ChipSimulationService', ['ChipPart', 'SimulatedChip', function (ChipPart, SimulatedChip) {
                var simulatedChip;
                var chips;
                var builtInChips = {
                    'Not': new ChipPart('Not', {'in': {value: 0}}, {'out': {value: 1}}, function () {
                        this.outputs['out'].internalPin.value = !this.inputs['in'].internalPin.value;
                    }),
                    'And': new ChipPart('And', {'a': {value: 0}, 'b': {value: 0}}, {'out': {value: 0}}, function () {
                        this.outputs['out'].internalPin.value = this.inputs['a'].internalPin.value & this.inputs['b'].internalPin.value;
                    }),
                    'Or': new ChipPart('Or', {'a': {value: 0}, 'b': {value: 0}}, {'out': {value: 0}}, function () {
                        this.outputs['out'].internalPin.value = this.inputs['a'].internalPin.value | this.inputs['b'].internalPin.value;
                    }),
                    'Nand': new ChipPart('Nand', {'a': {value: 0}, 'b': {value: 0}}, {'out': {value: 0}}, function () {
                        this.outputs['out'].internalPin.value = !(this.inputs['a'].internalPin.value & this.inputs['b'].internalPin.value);
                    })
                };

                return {
                    getSimulatedChip: getSimulatedChip,
                    addChipPart: addChipPart,
                    reset: reset,
                    setChipsArray: setChipsArray
                };

                /**
                 * @param {Array} chipss pole všech chipů v aplikaci
                 */
                function setChipsArray(chipss) {
                    chips = chipss;
                }

                /** 
                 * @return {Object} simulovatelný chip 
                 */
                function getSimulatedChip() {
                    return simulatedChip;
                }

                /**
                 * Resetuje simulovaný object
                 */
                function reset() {
                    simulatedChip = new SimulatedChip();
                }

                /**
                 * Přidá část obvodu do současného simulovatelného objektu.
                 * @param {Object} part
                 * @param {Object} chip kompletní chip (pro nastavení chybových hlášek)
                 * @return {Boolean} false pokud nastala chyba při kompilaci
                 */
                function addChipPart(part, chip) {
                    var chipPartBuiltIn = _getBuiltInChip(part.name);
                    if (chipPartBuiltIn) {
                        chipPartBuiltIn.setPins(simulatedChip.internalPins, part, chip);
                        part.builtInChip = chipPartBuiltIn;
                    }
                    var chipPartUser = _getUserChip(part.name);
                    if (chipPartUser) {
                        chipPartUser.setPins(simulatedChip.internalPins, part, chip);
                        part.userChip = chipPartUser;
                    }
                    if (!chipPartBuiltIn && !chipPartUser) {
                        chip.parts = simulatedChip.parts;
                        part.nameToken.errorMes = 'There is not chip called ' + part.name;
                        chip.compileError = {'row': part.row + 1, 'message': 'There is not chip called ' + part.name};
                        return false;
                    }
                    if (chipPartBuiltIn && !chipPartBuiltIn.error) {
                        part.builtIn = true;
                        chipPartBuiltIn.active = true;
                        chipPartBuiltIn._compute();
                    } else if (chipPartUser && !chipPartUser.error) {
                        part.builtIn = false;
                        chipPartUser.active = true;
                        chipPartUser._compute();
                    } else {
                        return false;
                    }
                    _clearErrors(chip, part);
                    return true;
                }

                /**
                 * Fabrika na chipy načtené od uživatele.
                 * @param {String} name jméno chipu
                 * @returns {ChipPart} chip nebo false, pokud nebyl nalezen odpovídající buildInChip
                 */
                function _getUserChip(name) {
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
                 * Vynuluje všechny errory na chipu
                 * @param {Object} chip kompletní chip
                 * @param {Object} part část chipu
                 */
                function _clearErrors(chip, part) {
                    chip.compileError = null;
                    part.nameToken.errorMes = null;
                    for (var pinName in part.pins) {
                        part.pins[pinName].leftToken.errorMes = null;
                    }
                }

                /**
                 * Fabrika na builtin chipy.
                 * @param {String} name jméno chipu
                 * @returns {ChipPart} chip nebo false, pokud nebyl nalezen odpovídající buildInChip
                 */
                function _getBuiltInChip(name) {
                    if (builtInChips.hasOwnProperty(name)) {
                        return angular.copy(builtInChips[name]);
                    }
                    return false;
                }
            }]);