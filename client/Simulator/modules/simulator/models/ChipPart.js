/* global angular */

'use strict';

angular.module('app.simulator')

        /**
         * Představuje object části chipu
         */
        .factory('ChipPart', [function () {
                /**
                 * Object představující jeden chip
                 * @param {String} name
                 * @param {object} inputs obsahuje pouze proměnné, které představují hodnoty na vstupu 
                 * @param {object} outputs obsahuje pouze proměnné, které představují hodnoty na výstupu
                 * @param {function} computeFcn
                 */
                var Chip = function (name, inputs, outputs, computeFcn) {
                    this.name = name; //jméno chipu
                    this._compute = computeFcn; //výpočetní funkce chipu
                    this.inputs = inputs;
                    this.outputs = outputs;
                };
                Chip.prototype = {
                    /**
                     * Asociuje interní piny obvodu s piny tohoto chipu
                     * @param {Object} internalPins mapa interních pinů obvodu
                     * @param {Object} part chip předtavující část obvodu
                     * @return {Boolean} false pokud nastala chyba při kompilaci
                     */
                    setPins: function (internalPins, part) {
                        for (var pinName in part.pins) {
                            if (this.inputs.hasOwnProperty(pinName)) {
                                    this.inputs[pinName] = internalPins[part.pins[pinName].assignment];
                                    this.inputs[pinName].used = true;
                                    part.pins[pinName].internalPin = internalPins[part.pins[pinName].assignment];
                                    part.pins[pinName].rightToken.pin = internalPins[part.pins[pinName].assignment];
                            } else if (this.outputs.hasOwnProperty(pinName)) {
                                    this.outputs[pinName] = internalPins[part.pins[pinName].assignment];
                                    this.outputs[pinName].used = true;
                                    part.pins[pinName].internalPin = internalPins[part.pins[pinName].assignment];
                                    part.pins[pinName].rightToken.pin = internalPins[part.pins[pinName].assignment];
                            } else {
                                part.pins[pinName].leftToken.errorMes = 'Obvod ' + part.name + ' nemá pin s názvem ' + pinName;
                                return false;
                            }
                        }
                        var missingPin = this._allUsed();
                        if (!missingPin) {
                            this._compute();
                            this._setListener();
                            return true;
                        } else {
                            part.nameToken.errorMes = 'Not used all pins! Is missing pin '+missingPin;
                            return false;
                        }
                    },
                    /**
                     * Nastaví listener pro vstupy tohoto obvodu 
                     * (při každé změně vstupu vypočítá hodnotu na výstupu a 
                     * zavolá callbacky napojené na výstupní pin)
                     */
                    _setListener: function () {
                        var chip = this;
                        for (var inputName in this.inputs) {
                            this.inputs[inputName].callbacks.push(function () {
                                chip._compute();
                                chip._runOutputCallbacks();
                            });
                        }
                    },
                    /**
                     * Zavolá callbacky napojené na výstupní pin
                     */
                    _runOutputCallbacks: function () {
                        for (var outputName in this.outputs) {
                            for (var i = 0; i < this.outputs[outputName].callbacks.length; i++) {
                                this.outputs[outputName].callbacks[i]();
                            }
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
                    }
                };
                
                return Chip;
            }]);