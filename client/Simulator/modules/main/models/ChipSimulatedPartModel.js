/* global angular */

'use strict';

angular.module('app')

        /**
         * Představuje object simulovatelné části chipu
         */
        .factory('ChipSimulatedPartModel', [function () {
                /**
                 * Object představující simulovatelnou část chipu
                 * @param {Map}{inputName:string} inputs pole jmen vstupů
                 * @param {Map}{outputName:string} outputs pole jmen výstupů
                 * @param {ChipModel} chip hlavní chip jehož je tento částí
                 * @param {function} computeFcn výpočetní funkce builtIn chipu
                 * @param {SimulatedChipModel} userSimulatedChip simulovatelný chip od uživatele představující tuto část
                 */
                var ChipSimulatedPartModel = function (inputs, outputs, computeFcn, userSimulatedChip) {
                    /***********************public**************************/
                    this.outputs = outputs; //{Map}{pinName:ChipPartPinModel} výstupní piny této části obvodu
                    this.inputs = inputs; //{Map}{pinName:ChipPartPinModel} vstupní piny této části obvodu

                    /***********************private*************************/
                    this._userSimulatedChip = userSimulatedChip; //{SimulatedChipModel} simulovatelný chip od uživatele představující tuto část
                    this._active; //{boolean} indikátor, zda je tato část obvodu používána při výpočtu
                    this._error; //{boolean} indikátor, že nastal compile error

                    /********************************************************/
                    /**
                     * Výpočetní funkce builtIn chipu
                     */
                    this.compute = computeFcn;
                };
                ChipSimulatedPartModel.prototype = {
                    /************************public*************************/
                    
                    /**
                     * @returns {Map}{pinName:ChipPartPinModel} výstupní piny této části obvodu
                     */
                    getOutputs: function () {
                        return this.outputs;
                    },
                    /**
                     * @returns {Map}{pinName:ChipPartPinModel} vstupní piny této části obvodu
                     */
                    getInputs: function () {
                        return this.inputs;
                    },

                    /**
                     * @returns {booelan} indikátor, že nastal compile error
                     */
                    hasCompileError : function () {
                        return this._error;
                    },
                    
                    /**
                     * @returns {Boolean} true pokud je část aktivní
                     */
                    isActive : function () {
                        return this._active;
                    },

                    /**
                     * Aktivuje tuto simulovatelnou část chipu
                     */
                    activate : function () {
                        this._active = true;
                    },

                    /**
                     * Deaktivuje tuto simulovatelnou část chipu
                     */
                    deactivate : function () {
                        this._active = false;
                    },

                    /**
                     * @returns {SimulatedChipModel} simulovatelný chip od uživatele představující tuto část
                     */
                    getUserSimulatedChip : function () {
                        return this._userSimulatedChip;
                    },

                    /**
                     * Asociuje interní piny obvodu s piny tohoto chip
                     * @param {Map}{pinName:ChipPartPinModel} pins mapa pinů této části
                     * @param {TokenModel} nameToken token jména této části
                     * @param {int} row pořadí řádku na kterém se taot část v kódu nachází 
                     * @param {String} name název této části obvodu
                     * @param {ChipModel} chip hlavní chip jehož je tento částí
                     * @return {Boolean} false pokud nastala chyba při kompilaci
                     */
                    setPins : function (pins, nameToken, row, name, chip) {
                        for (var pinName in pins) {
                            if (this.inputs.hasOwnProperty(pinName)) {
                                pins[pinName].assignBits();
                                this.inputs[pinName] = pins[pinName];
                            } else if (this.outputs.hasOwnProperty(pinName)) {
                                pins[pinName].assignBits();
                                this.outputs[pinName] = pins[pinName];
                            } else {
                                var errMes = 'Part "' + name + '" hasn\'t pin called "' + pinName + '"';
                                pins[pinName].getNameToken().setErrorMes(errMes);
                                chip.setCompileError(row + 1, errMes);
                                this._error = true;
                                return false;
                            }
                        }
                        var missingPin = this._allUsed();
                        if (!missingPin) {
                            this._setListener();
                            this._error = false;
                            return true;
                        } else {
                            var errMes = 'Not used all pins! Is missing pin "' + missingPin + '"';
                            nameToken.setErrorMes(errMes);
                            chip.setCompileError(row + 1, errMes);
                            this._error = true;
                            return false;
                        }
                    },

                    /**
                     * Přepočítá hodnoty na výstupu podle aktuálních hodnot na vstupu.
                     */
                    reCompute : function () {
                        if (this._userSimulatedChip && !this.compute) {
                            this._userSimulatedChip.reComputeAll();
                        } else {
                            this.compute();
                        }
                        this.runOutputCallbacks();
                    },

                    /**
                     * Zavolá callbacky napojené na výstupní pin
                     */
                    runOutputCallbacks : function () {
                        for (var outputName in this.outputs) {
                            this.outputs[outputName].runOutputCallbacks();
                        }
                    },

                    /***********************private**************************/

                    /**
                     * Nastaví listener pro vstupy tohoto obvodu 
                     * (při každé změně vstupu vypočítá hodnotu na výstupu)
                     */
                    _setListener : function() {
                        for (var inputName in this.inputs) {
                            this.inputs[inputName].setCallbacks();
                        }
                    },

                    /**
                     * Zkontroluje zda mají všechny piny příznak "used" na true respektive, zda byly použity
                     * @returns {String} název pinu, který nebyl využit nebo false pokud jsou všechny piny použity
                     */
                    _allUsed : function() {
                        for (var pinName in this.inputs) {
                            if (!this.inputs[pinName]) {
                                return pinName;
                            }
                        }
                        for (var pinName in this.outputs) {
                            if (!this.outputs[pinName]) {
                                return pinName;
                            }
                        }
                        return false;
                    }
                };

                return ChipSimulatedPartModel;
            }]);