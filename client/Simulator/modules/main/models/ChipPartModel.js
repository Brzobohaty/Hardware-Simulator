/* global angular */

'use strict';

angular.module('app')

        /**
         * Představuje object části chipu
         */
        .factory('ChipPart', ['ChipPartPinModel', function (ChipPartPinModel) {
                /**
                 * Object představující jeden chip
                 * @param {String} name
                 * @param {object} inputs obsahuje pouze proměnné, které představují hodnoty na vstupu 
                 * @param {object} outputs obsahuje pouze proměnné, které představují hodnoty na výstupu
                 * @param {function} computeFcn
                 */
                var Chip = function (name, inputs, outputs, computeFcn, userSimulatedChip) {
                    this.name = name; //jméno chipu
                    this.inputs = inputs;
                    this.outputs = outputs;
                    this.active = false; //indikátor, zda je tato část obvud používána při výpočtu
                    this.error; //indikátor, že nastal compile error
                    if (userSimulatedChip && !computeFcn) {
                        this.userSimulatedChip = userSimulatedChip;
                    } else {
                        this._compute = computeFcn; //výpočetní funkce chipu
                    }
                };
                Chip.prototype = {
                    /**
                     * Asociuje interní piny obvodu s piny tohoto chipu
                     * @param {Object} internalPins mapa interních pinů obvodu
                     * @param {Object} part chip předtavující část obvodu
                     * @param {ChipModel} chip hlavní chip jehož je tento částí
                     * @return {Boolean} false pokud nastala chyba při kompilaci
                     */
                    setPins: function (internalPins, part, chip) {
                        for (var pinName in part.pins) {
                            if (this.inputs.hasOwnProperty(pinName)) {
                                this.inputs[pinName] = new ChipPartPinModel(pinName, internalPins[part.pins[pinName].assignment], part.pins[pinName].bitsAssigned, this);
                                part.pins[pinName].internalPin = internalPins[part.pins[pinName].assignment];
                                part.pins[pinName].rightToken.pin = internalPins[part.pins[pinName].assignment];
                            } else if (this.outputs.hasOwnProperty(pinName)) {
                                this.outputs[pinName] = new ChipPartPinModel(pinName, internalPins[part.pins[pinName].assignment], part.pins[pinName].bitsAssigned, this);
                                part.pins[pinName].internalPin = internalPins[part.pins[pinName].assignment];
                                part.pins[pinName].rightToken.pin = internalPins[part.pins[pinName].assignment];
                            } else {
                                var errMes = 'Part "' + part.name + '" hasn\'t pin called "' + pinName + '"';
                                part.pins[pinName].leftToken.setErrorMes(errMes);
                                chip.setCompileError(part.row + 1, errMes);
                                this.error = true;
                                return false;
                            }
                        }
                        var missingPin = this._allUsed();
                        if (!missingPin) {
                            this._setListener();
                            this.error = false;
                            return true;
                        } else {
                            var errMes = 'Not used all pins! Is missing pin "' + missingPin + '"';
                            part.nameToken.setErrorMes(errMes);
                            chip.setCompileError(part.row + 1, errMes);
                            this.error = true;
                            return false;
                        }
                    },
                    /**
                     * Nastaví listener pro vstupy tohoto obvodu 
                     * (při každé změně vstupu vypočítá hodnotu na výstupu)
                     */
                    _setListener: function () {
                        for (var inputName in this.inputs) {
                            this.inputs[inputName].setCallbacks();
                        }
                    },
                    /**
                     * Zavolá callbacky napojené na výstupní pin
                     */
                    runOutputCallbacks: function () {
                        for (var outputName in this.outputs) {
                            this.outputs[outputName].runOutputCallbacks();
                        }
                    },
                    /**
                     * Zkontroluje zda mají všechny piny příznak "used" na true respektive, zda byly použity
                     * @returns {String} název pinu, který nebyl využit nebo false pokud jsou všechny piny použity
                     */
                    _allUsed: function () {
                        for (var pinName in this.inputs) {
                            if (!this.inputs[pinName].used) {
                                return pinName;
                            }
                        }
                        for (var pinName in this.outputs) {
                            if (!this.outputs[pinName].used) {
                                return pinName;
                            }
                        }
                        return false;
                    },
                    /**
                     * Přepočítá hodnoty na výstupu podle aktuálních hodnot na vstupu.
                     */
                    reCompute: function () {
//                        for (var inputName in this.inputs) {
//                            this.inputs[inputName].inputChanged();
//                        }
                        
                        if (this.userSimulatedChip && !this._compute) {
                            this.userSimulatedChip.reComputeAll();
                        } else {
                            this._compute();
                        }
                        this.runOutputCallbacks();
                    }
                };

                return Chip;
            }]);