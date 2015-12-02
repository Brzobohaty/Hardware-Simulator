/* global angular */

'use strict';

angular.module('app.simulator')

        /**
         * Slouží pro vytváření objektu pro simulování
         */
        .factory('ChipSimulationService', ['ChipPart', 'SimulatedChip', function (ChipPart, SimulatedChip) {
                var simulatedChip = new SimulatedChip();
                
                return {
                    internalPins:simulatedChip.internalPins,
                    inputs:simulatedChip.inputs,
                    outputs:simulatedChip.outputs,
                    parts:simulatedChip.parts,
                    simulatedChip:simulatedChip,
                    addChipPart: addChipPart
                };
                
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
                    var builtInChips = {
                        'NOT': new ChipPart('NOT', {'in': {value: 0}}, {'out': {value: 1}}, function () {
                            this.outputs['out'].value = !this.inputs['in'].value;
                        }),
                        'AND': new ChipPart('AND', {'a': {value: 0}, 'b': {value: 0}}, {'out': {value: 0}}, function () {
                            this.outputs['out'].value = this.inputs['a'].value & this.inputs['b'].value;
                        }),
                        'OR': new ChipPart('OR', {'a': {value: 0}, 'b': {value: 0}}, {'out': {value: 0}}, function () {
                            this.outputs['out'].value = this.inputs['a'].value | this.inputs['b'].value;
                        })
                    };
                    if (builtInChips.hasOwnProperty(name)) {
                        return builtInChips[name];
                    }
                    return false;
                }
            }]);