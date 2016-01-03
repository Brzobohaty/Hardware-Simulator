/* global angular */

'use strict';

angular.module('app')

        /**
         * Představuje object vstuního nebo výstupního pinu části obvodu
         */
        .factory('ChipPartPinModel', [function () {
                /**
                 * Object představující jeden vstupní nebo výstupní pin
                 * @param {String} name jméno pinu
                 * @param {PinModel} internalPin přiřazený interní pin
                 * @param {TokenModel} nameToken token názvu pinu
                 * @param {TokenModel} internalPinToken token přiřezeného interního pinu
                 * @param {Array}{int} bitsAssigned pole indexů bitů, které jsou přiřazeny tomuto pinu z interního pinu
                 */
                var ChipPartPinModel = function (name, internalPin, nameToken, internalPinToken, partt, bitsAssigned) {
                    /***********************public**************************/

                    /***********************private*************************/
                    this._name = name; //{String} jméno pinu
                    this._internalPin = internalPin; //{PinModel} interní pin přiřazený tomuto pinu
                    this._nameToken = nameToken; //{TokenModel} token názvu pinu
                    this._internalPinToken = internalPinToken; //{TokenModel} token přiřezeného interního pinu
                    this._part = partt; //{ChipPartModel} část chipu, kterému náleží tento pin
                    this._bits = []; //{Array}{BitModel} jednotlivé bity pinu
                    this._bitsAssigned = bitsAssigned; //{Array}{int} pole indexů bitů, které jsou přiřazeny tomuto pinu z interního pinu

                    /********************************************************/
                };
                ChipPartPinModel.prototype = {
                    /**
                     * @returns {String} jméno pinu
                     */
                    getName: function () {
                        return this._name;
                    },
                    /**
                     * @returns {TokenModel} token názvu pinu
                     */
                    getNameToken: function () {
                        return this._nameToken;
                    },
                    /**
                     * @returns {TokenModel} token přiřezeného interního pinu
                     */
                    getInternalPinToken: function () {
                        return this._internalPinToken;
                    },
                    /**
                     * @returns {PinModel} interní pin přiřazený tomuto pinu
                     */
                    getInternalPin: function () {
                        return this._internalPin;
                    },
                    /**
                     * @returns {Array}{BitModel} jednotlivé bity pinu
                     */
                    getBits: function () {
                        return this._bits;
                    },
                    /**
                     * Asociuje pouze některé bity z interního bitu s tímto pinem
                     */
                    assignBits: function () {
                        if (this._bits.length === 0) {
                            for (var i = 0; i < this._bitsAssigned.length; i++) {
                                this._bits.push(this._internalPin.getBits()[this._bitsAssigned[i]]);
                            }
                        }
                    },
                    /**
                     * Vypočítá hodnoty na výstupních pinech této části obvodu podle hodnot na jejích vstupních pinech
                     */
                    setValues: function () {
                        if (this._part.getBuiltInChip().isActive()) {
                            this._setValues(this._part.getBuiltInChip());
                        } else {
                            this._setValues(this._part.getUserChip());
                        }
                    },
                    /**
                     * Nastaví bitům příslušného interního pinu sebe jako callback pro případ, že je nějaký z těchto bitů změněn.
                     */
                    setCallbacks: function () {
                        for (var index in this._internalPin.getBits()) {
                            this._internalPin.getBits()[index].addCallback(this);
                        }
                    },
                    /**
                     * Zavolá všechny callbacky napojené na tento pin
                     */
                    runOutputCallbacks: function () {
                        for (var index in this._internalPin.getBits()) {
                            this._internalPin.getBits()[index].runCallbacks();
                        }
                        this._internalPin.outputChanged();
                    },
                    /***********************private**************************/

                    /**
                     * Vypočítá hodnoty na výstupních pinech této části obvodu podle hodnot na jejích vstupních pinech
                     * @param {ChipSimulatedPartModel} part simulovatelná část, pro kterou se má výpočet provést
                     */
                    _setValues: function (part) {
                        if (part.getUserSimulatedChip()) {
                            //nahrát hodnotu ze vstupních pinů této části do vstupních pinů simulovného čipu
                            var simInput = part.getUserSimulatedChip().getInput(this._name);
                            for (var i = 0; i < this._bits.length; i++) {
                                simInput.getBits()[i].setValue(this._bits[i].getValue());
                            }

                            part.getUserSimulatedChip().inputChanged(simInput);

                            //nahrát hodnotu výstupních pinů simulovaného čipu do výstupních pinů této části
                            var simOutputs = part.getUserSimulatedChip().getOutputs();
                            for (var index in simOutputs) {
                                var output = part.getOutputs()[simOutputs[index].getName()];
                                var simOutput = simOutputs[index];
                                for (var i = 0; i < output.getBits().length; i++) {
                                    output.getBits()[i].setValue(simOutput.getBits()[i].getValue());
                                }
                            }
                        } else {
                            part.compute();
                        }
                        part.runOutputCallbacks();
                    }
                };

                return ChipPartPinModel;
            }]);