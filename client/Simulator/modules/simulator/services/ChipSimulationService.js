/* global angular */

'use strict';

angular.module('app.simulator')

        /**
         * Slouží pro vytváření objektu pro simulování
         */
        .factory('ChipSimulationService', ['ChipPart', 'SimulatedChip', function (ChipPart, SimulatedChip) {
                var simulatedChip;
                var builtInChips = {
                    'NOT': new ChipPart(true, 'NOT', {'in': {value: 0}}, {'out': {value: 1}}, function () {
                        this.outputs['out'].value = !this.inputs['in'].value;
                    }),
                    'AND': new ChipPart(true, 'AND', {'a': {value: 0}, 'b': {value: 0}}, {'out': {value: 0}}, function () {
                        this.outputs['out'].value = this.inputs['a'].value & this.inputs['b'].value;
                    }),
                    'OR': new ChipPart(true, 'OR', {'a': {value: 0}, 'b': {value: 0}}, {'out': {value: 0}}, function () {
                        this.outputs['out'].value = this.inputs['a'].value | this.inputs['b'].value;
                    })
                };

                return {
                    getSimulatedChip: getSimulatedChip,
                    addChipPart: addChipPart,
                    reset: reset
                };

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
                 * @return {Boolean} false pokud nastala chyba při kompilaci
                 */
                function addChipPart(part) {
                    var chipPart = _getBuiltInChip(part.name.toUpperCase());
                    if (chipPart) {
                        return chipPart.setPins(simulatedChip.internalPins, part);
                    } else {
                        //TODO vytvořit chip rekurzivně z jiného souboru (nen9 ekvivalentn9 bulitInChip)
                        return false;
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