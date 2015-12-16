/* global angular */

'use strict';

angular.module('app')

        /**
         * Představuje object vstuního nebo výstupního pinu části obvodu
         */
        .factory('ChipPartPinModel', [function () {
                /**
                 * Object představující jeden vstuní nebo výstupní pin
                 * @param {String} name název pinu
                 * @param {object} internalPin interní pin celého chipu, který je napojený na daný vstupn nebo výstup 
                 * @param {object} chip kompletní chip
                 */
                var Pin = function (name, internalPin, chip) {
                    this.name = name;
                    this.internalPin = internalPin; 
                    this.chip = chip;
                    this.used = true; //indikátor, zda byl tento pin využit
                };
                Pin.prototype = {
                    /**
                     * Vypočítá hodnoty na výstupních pinech této části obvodu podle hodnot na jejích vstupních pinech
                     */
                    setValues: function () {
                        if (this.chip.active) {
                            if (this.chip.userSimulatedChip) {
                                //nahrát hodnotu ze vstupních pinů této části do vstupních pinů simulovného čipu
                                var simInput = this.chip.userSimulatedChip.getInput(this.name);
                                simInput.value = this.internalPin.value;
                                this.chip.userSimulatedChip.inputChanged(simInput);

                                //nahrát hodnotu výstupních pinů simulovného čipu do výstupních pinů této části
                                var simOutputs = this.chip.userSimulatedChip.outputs;
                                for (var index in simOutputs) {
                                    this.chip.outputs[simOutputs[index].name].internalPin.value = simOutputs[index].value;
                                }
                                this.chip._runOutputCallbacks();
                            } else {
                                this.chip._compute();
                                this.chip._runOutputCallbacks();
                            }
                        }
                    }
                };

                return Pin;
            }]);