/* global angular */

'use strict';

angular.module('app')

        /**
         * Představuje object chipu, který může být přímo simulován
         */
        .factory('SimulatedChipModel', [function () {
                var SimulatedChipModel = function () {
                    this.name; //název chipu
                    this.internalPins = {}; //mapa interních pinů, včetně vstupních a výstupních
                    this.inputs = []; //pole výstupů
                    this.outputs = []; //pole výstupů
                    this.parts = []; //pole částí obvodu
                };
                SimulatedChipModel.prototype = {
                    /**
                     * Vyvolá řetězec změň vnitřních pinů obvodu podle vstupních hodnot.
                     * @param {Object} input (name, value, callbacks)
                     */
                    inputChanged: function (input) {
                        for (var index in input.bits) {
                            for (var index2 in input.bits[index].callbacks) {
                                input.bits[index].callbacks[index2].setValues();
                            }
                        }
                    },
                    /**
                     * @param {String} name název vstupu
                     * @returns {Object} vstup
                     */
                    getInput: function (name) {
                        return _.findWhere(this.inputs, {name: name});
                    },
                    /**
                     * Přepočítá veškěré hodnoty na vnitřních a výstupních inech podle hodnot na vstupních pinech
                     */
                    reComputeAll: function () {
                        for (var index in this.inputs) {
                            this.inputChanged(this.inputs[index]);
                        }
                    },
                    /**
                     * Přidá pin do interních pinů simulovaného objektu
                     * @param {PinModel} pin
                     * @param {Object} tokenOfPin token daného pinu
                     */
                    addInternalPin: function (pin, tokenOfPin) {
                        var name = pin.getName();
                        if (!this.internalPins.hasOwnProperty(name)) {
                            pin.generateColor();
                            this.internalPins[name] = pin;
                            tokenOfPin.pin = pin;
                            pin.outputChanged(); //aby se naformátoval vstup
                        }
                    }
                };

                return SimulatedChipModel;
            }]);