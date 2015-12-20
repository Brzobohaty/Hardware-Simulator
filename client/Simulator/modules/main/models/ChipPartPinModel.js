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
                 * @param {Array} bitsAssigned pole indexů bitů, které jsou tomuto internímu čipu přiřazeny (allow null)
                 * @param {object} chip kompletní chip
                 */
                var Pin = function (name, internalPin, bitsAssigned, chip) {
                    this.name = name;
                    this.internalPin = internalPin;
                    this.bits = []; //jednotlivé bity pinu (BitModel)
                    this.value; //binární hodnota na pinu
                    this.bitsAssigned = bitsAssigned; //pole indexů bitů, které jsou tomuto internímu čipu přiřazeny
                    this.chip = chip;
                    this.used = true; //indikátor, zda byl tento pin využit

                    //asociace bitů
                    for (var i = 0; i < this.bitsAssigned.length; i++) {
                        this.bits.push(this.internalPin.bits[this.bitsAssigned[i]]);
                    }
                };
                Pin.prototype = {
                    /**
                     * Vypočítá hodnoty na výstupních pinech této části obvodu podle hodnot na jejích vstupních pinech
                     */
                    setValues: function () {
                        if (this.chip.active) {
//                            this.inputChanged();
                            if (this.chip.userSimulatedChip) {
                                //nahrát hodnotu ze vstupních pinů této části do vstupních pinů simulovného čipu
                                var simInput = this.chip.userSimulatedChip.getInput(this.name);
                                for (var i = 0; i < this.bits.length; i++) {
                                    simInput.bits[i].value = this.bits[i].value;
                                }
                                //simInput.value = this.internalPin.value;
                                this.chip.userSimulatedChip.inputChanged(simInput);

                                //nahrát hodnotu výstupních pinů simulovného čipu do výstupních pinů této části
                                var simOutputs = this.chip.userSimulatedChip.outputs;
                                for (var index in simOutputs) {
                                    var output = this.chip.outputs[simOutputs[index].name];
                                    var simOutput = simOutputs[index];
                                    for (var i = 0; i < output.bits.length; i++) {
                                        output.bits[i].value = simOutput.bits[i].value;
                                    }
                                }
                            } else {
                                this.chip._compute();
                            }
                            this.chip.runOutputCallbacks();
                        }
                    },
                    /**
                     * Vstup byl změněn a tudíž v této metodě dojde k 
                     * přeformátování bitů na jednu binátní hodnotu
                     */
//                    inputChanged: function () {
//                        var string = '';
//                        for (var index in this.bitsAssigned) {
//                            string += Number(this.internalPin.bits[this.bitsAssigned[index]].value);
//                        }
//                        this.value = Number(string);
//                    },
                    /**
                     * Výstup byl změněn a tudíž v této metodě dojde k 
                     * přeformátování hodnoty do konkrétních bitů pinu
                     */
//                    _outputChanged: function () {
//                        if (typeof this.value != 'undefined') {
//                            var bitss = this.value.toString().split('');
//                            for (var index in this.bitsAssigned) {
//                                this.internalPin.bits[this.bitsAssigned[index]].value = Number(bitss[this.bitsAssigned[index]]);
//                            }
//                            debugger;
//                        }
//                    },
                    setCallbacks: function () {
                        for (var index in this.internalPin.bits) {
                            this.internalPin.bits[index].callbacks.push(this);
                        }
                    },
                    runOutputCallbacks: function () {
//                        this._outputChanged();
                        for (var index in this.internalPin.bits) {
                            for (var index2 in this.internalPin.bits[index].callbacks) {
                                this.internalPin.bits[index].callbacks[index2].setValues();
                            }
                        }
                        this.internalPin.outputChanged();
                    }
                };

                return Pin;
            }]);