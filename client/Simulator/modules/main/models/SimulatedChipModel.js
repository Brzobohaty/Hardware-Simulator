/* global angular */

'use strict';

angular.module('app')

        /**
         * Představuje object chipu, který může být přímo simulován
         */
        .factory('SimulatedChipModel', ['ChipSimulationService', function (ChipSimulationService) {
                var SimulatedChipModel = function () {
                    /***********************public**************************/

                    /***********************private*************************/
                    var _internalPins = {}; //mapa interních pinů, včetně vstupních a výstupních (klíč je název pinu a hodnota je PinModel)
                    var _inputs = []; //{PinModel} pole výstupů
                    var _outputs = []; //{PinModel}pole výstupů
                    var _parts = []; //pole částí obvodu
                    var _that = this;

                    /************************public*************************/
                    
                    /**
                     * Přidá pin do interních pinů chipu a přípdně i jako vstup nebo výstup
                     * @param {PinModel} pin
                     * @param {TokenModel} tokenOfPin
                     */
                    this.addPin = function(pin, tokenOfPin){
                        _addInternalPin(pin, tokenOfPin);
                        switch(pin.isInOut()){
                            case 1: _inputs.push(pin);break;
                            case 2: _outputs.push(pin);break;
                        }
                    };
                    
                    /**
                     * @returns {}
                     */
                    this.getParts = function(){
                        return _parts;
                    };
                    
                    /**
                     * @returns {Array}{PinModel} interní piny
                     */
                    this.getInternalPins = function(){
                        return _internalPins;
                    };
                    
                    /**
                     * @returns {Array}{PinModel} výstupy
                     */
                    this.getOutputs = function(){
                        return _outputs;
                    };
                    
                    /**
                     * @returns {Array}{PinModel} vstupy
                     */
                    this.getInputs = function(){
                        return _inputs;
                    };
                    
                    /**
                     * Přidá část chipu
                     * @param {} part část chipu
                     */
                    this.addPart = function(part){
                        _parts.push(part);
                    };

                    /**
                     * Vyvolá řetězec změň vnitřních pinů obvodu podle vstupních hodnot.
                     * @param {Object} input (name, value, callbacks)
                     */
                    this.inputChanged = function (input) {
                        for (var index in input.bits) {
                            for (var index2 in input.bits[index].callbacks) {
                                input.bits[index].callbacks[index2].setValues();
                            }
                        }
                    };

                    /**
                     * @param {String} name název vstupu
                     * @returns {Object} vstup
                     */
                    this.getInput = function (name) {
                        return _.findWhere(this.inputs, {name: name});
                    };

                    /**
                     * Přepočítá veškěré hodnoty na vnitřních a výstupních pinech podle hodnot na vstupních pinech
                     */
                    this.reComputeAll = function () {
                        for (var index in this.inputs) {
                            this.inputChanged(this.inputs[index]);
                        }
                    };

                    /**
                     * Vytvoří všechny části obvodu a přiřadí jim správné interní piny
                     * @param {ChipModel} chip kompletní chip (pro nastavení chybových hlášek)
                     * @return {Boolean} false pokud nastala chyba při kompilaci
                     */
                    this.makeChipParts = function (chip) {
                        for (var index in _parts) {
                            if (!_makeChipPart(_parts[index], chip)) {
                                return false;
                            }
                        }
                        return true;
                    };

                    /***********************private**************************/
                    /**
                     * Přidá pin do interních pinů simulovaného objektu
                     * @param {PinModel} pin
                     * @param {TokenModel} tokenOfPin token daného pinu
                     */
                    function _addInternalPin(pin, tokenOfPin) {
                        var name = pin.getName();
                        if (!_internalPins.hasOwnProperty(name)) {
                            pin.generateColor();
                            _internalPins[name] = pin;
                            tokenOfPin.pin = pin;
                            pin.outputChanged(); //aby se naformátoval vstup
                        }
                    };
                    
                    /**
                     * Vytvoří část obvodu a přiřadí jí správné interní piny.
                     * @param {} part
                     * @param {ChipModel} chip kompletní chip (pro nastavení chybových hlášek)
                     * @return {Boolean} false pokud nastala chyba při kompilaci
                     */
                    function _makeChipPart(part, chip) {
                        var chipPartBuiltIn = ChipSimulationService.getBuiltInChip(part.name);
                        if (chipPartBuiltIn) {
                            chipPartBuiltIn.setPins(_internalPins, part, chip);
                            part.builtInChip = chipPartBuiltIn;
                        }
                        var chipPartUser = ChipSimulationService.getUserChip(part.name);
                        if (chipPartUser) {
                            chipPartUser.setPins(_internalPins, part, chip);
                            part.userChip = chipPartUser;
                        }
                        if (!chipPartBuiltIn && !chipPartUser) {
                            chip.setParts(_parts);
                            var errMes = 'There is not chip called ' + part.name;
                            part.nameToken.setErrorMes(errMes);
                            chip.setCompileError(part.row + 1, errMes);
                            return false;
                        }
                        if (chipPartBuiltIn && !chipPartBuiltIn.error) {
                            part.builtIn = true;
                            chipPartBuiltIn.active = true;
                            chipPartBuiltIn.reCompute();
                        } else if (chipPartUser && !chipPartUser.error) {
                            part.builtIn = false;
                            chipPartUser.active = true;
                            chipPartUser.reCompute();
                        } else {
                            return false;
                        }
                        _clearErrors(chip, part);
                        return true;
                    }
                    
                    /**
                     * Vynuluje všechny errory na chipu
                     * @param {ChipModel} chip kompletní chip
                     * @param {Object} part část chipu
                     */
                    function _clearErrors(chip, part) {
                        chip.clearCompileError();
                        part.nameToken.setErrorMes(null);
                        for (var pinName in part.pins) {
                            part.pins[pinName].leftToken.setErrorMes(null);
                        }
                    }
                    /********************************************************/

                };

                return SimulatedChipModel;
            }]);