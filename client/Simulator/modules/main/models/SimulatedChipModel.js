/* global angular */

'use strict';

angular.module('app')

        /**
         * Představuje object chipu, který může být přímo simulován
         */
        .factory('SimulatedChipModel', ['ChipSimulationService', 'ChipPartModel', function (ChipSimulationService, ChipPartModel) {
                var SimulatedChipModel = function () {
                    /***********************public**************************/

                    /***********************private*************************/
                    this._internalPins = {}; //mapa interních pinů, včetně vstupních a výstupních (klíč je název pinu a hodnota je PinModel)
                    this._inputs = []; //{Array}{PinModel} pole výstupů
                    this._outputs = []; //{Array}{PinModel}pole výstupů
                    this._parts = []; //{Array}{ChipPartModel} pole částí obvodu

                    /********************************************************/
                };
                SimulatedChipModel.prototype = {
                    /************************public*************************/

                    /**
                     * Přidá pin do interních pinů chipu a přípdně i jako vstup nebo výstup
                     * @param {PinModel} pin
                     * @return {PinModel} interní pin
                     */
                    addPin: function (pin) {
                        var internalPin = this._addInternalPin(pin);
                        switch (pin.isInOut()) {
                            case 1:
                                this._inputs.push(pin);
                                break;
                            case 2:
                                this._outputs.push(pin);
                                break;
                        }
                        return internalPin;
                    },
                    /**
                     * @returns {Array} {ChipPartModel} části chipu
                     */
                    getParts: function () {
                        return this._parts;
                    },
                    /**
                     * @returns {Array}{PinModel} interní piny
                     */
                    getInternalPins: function () {
                        return this._internalPins;
                    },
                    /**
                     * @returns {Array}{PinModel} výstupy
                     */
                    getOutputs: function () {
                        return this._outputs;
                    },
                    /**
                     * @returns {Array}{PinModel} vstupy
                     */
                    getInputs: function () {
                        return this._inputs;
                    },
                    /**
                     * Přidá část chipu
                     * @param {string} partName název části chipu
                     * @param {TokenModel} nameToken token názvu
                     * @param {Array} partRow řádek na kterém je název této části
                     * @returns {ChipPartModel} přidaná část chipu
                     */
                    addPart: function (partName, nameToken, partRow) {
                        var part = new ChipPartModel(partName, nameToken, partRow, this._parts.length + 1);
                        this._parts.push(part);
                        return part;
                    },
                    /**
                     * Vyvolá řetězec změň vnitřních pinů obvodu podle vstupních hodnot.
                     * @param {Object} input (name, value, callbacks)
                     */
                    inputChanged: function (input) {
                        for (var index in input.getBits()) {
                            input.getBits()[index].runCallbacks();
                        }
                    },
                    /**
                     * @param {String} name název vstupu
                     * @returns {Object} vstup
                     */
                    getInput: function (name) {
                        for(var index in this._inputs){
                            if(this._inputs[index].getName() === name){
                                return this._inputs[index];
                            }
                        }
                        return null;
                    },
                    /**
                     * Přepočítá veškěré hodnoty na vnitřních a výstupních pinech podle hodnot na vstupních pinech
                     */
                    reComputeAll: function () {
                        for (var index in this._inputs) {
                            this._inputs[index].inputChanged();
                            this.inputChanged(this._inputs[index]);
                        }
                    },
                    /**
                     * Vytvoří všechny části obvodu a přiřadí jim správné interní piny
                     * @param {ChipModel} chip kompletní chip (pro nastavení chybových hlášek)
                     * @return {Boolean} false pokud nastala chyba při kompilaci
                     */
                    makeChipParts: function (chip) {
                        for (var index in this._parts) {
                            if (!this._makeChipPart(this._parts[index], chip)) {
                                return false;
                            }
                        }
                        return true;
                    },
                    /***********************private**************************/

                    /**
                     * Přidá pin do interních pinů simulovaného objektu
                     * @param {PinModel} pin
                     * @return {PinModel} interní pin
                     */
                    _addInternalPin: function (pin) {
                        var name = pin.getName();
                        if (!this._internalPins.hasOwnProperty(name)) {
                            pin.generateColor();
                            this._internalPins[name] = pin;
                            pin.outputChanged(); //aby se naformátoval vstup
                        }
                        return this._internalPins[name];
                    },
                    /**
                     * Vytvoří část obvodu a přiřadí jí správné interní piny.
                     * @param {ChipPartModel} part část obvodu
                     * @param {ChipModel} chip kompletní chip (pro nastavení chybových hlášek)
                     * @return {Boolean} false pokud nastala chyba při kompilaci
                     */
                    _makeChipPart: function (part, chip) {
                        var chipPartBuiltIn = ChipSimulationService.getBuiltInChip(part.getName());
                        if (chipPartBuiltIn) {
                            part.setBuiltInChip(chipPartBuiltIn, chip);
                        }
                        var chipPartUser = ChipSimulationService.getUserChip(part.getName());
                        if (chipPartUser) {
                            part.setUserChip(chipPartUser, chip);
                        }
                        if (!chipPartBuiltIn && !chipPartUser) {
                            chip.setParts(this._parts);
                            var errMes = 'There is not chip called ' + part.getName();
                            part.getNameToken().setErrorMes(errMes);
                            chip.setCompileError(part.getRow() + 1, errMes);
                            return false;
                        }
                        if (chipPartBuiltIn && !chipPartBuiltIn.hasCompileError()) {
                            part.builtIn = true;
                            chipPartBuiltIn.activate();
                            chipPartBuiltIn.reCompute();
                        } else if (chipPartUser && !chipPartUser.hasCompileError()) {
                            part.builtIn = false;
                            chipPartUser.activate();
                            chipPartUser.reCompute();
                        } else {
                            return false;
                        }
                        this._clearErrors(chip, part);
                        return true;
                    },
                    /**
                     * Vynuluje všechny errory na chipu
                     * @param {ChipModel} chip kompletní chip
                     * @param {ChipPartModel} part část chipu
                     */
                    _clearErrors: function (chip, part) {
                        chip.clearCompileError();
                        part.getNameToken().setErrorMes(null);
                        for (var pinName in part.getPins()) {
                            part.getPins()[pinName].getNameToken().setErrorMes(null);
                        }
                    }
                };

                return SimulatedChipModel;
            }]);