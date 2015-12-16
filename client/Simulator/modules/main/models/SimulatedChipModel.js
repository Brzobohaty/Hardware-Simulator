/* global angular */

'use strict';

angular.module('app')

        /**
         * Představuje object chipu, který může být přímo simulován
         */
        .factory('SimulatedChip', ['ChipPart', function (ChipPart) {
                var SimulatedChip = function () {
                    this.name; //název chipu
                    this.internalPins = {}; //mapa interních pinů, včetně vstupních a výstupních
                    this.inputs = []; //pole výstupů
                    this.outputs = []; //pole výstupů
                    this.parts = []; //pole částí obvodu
                };
                SimulatedChip.prototype = {
                    /**
                     * Vyvolá řetězec změň vnitřních pinů obvodu podle vstupních hodnot.
                     * @param {Object} input (name, value, callbacks)
                     */
                    inputChanged: function (input) {
                        for (var j = 0; j < input.callbacks.length; j++) {
                            input.callbacks[j].setValues();
                        }
                    },
                    /**
                     * @param {String} name název vstupu
                     * @returns {Object} vstup
                     */
                    getInput: function (name) {
                        return _.findWhere(this.inputs, {name:name});
                    },
                    /**
                     * Přepočítá veškěré hodnoty na vnitřních a výstupních inech podle hodnot na vstupních pinech
                     */
                    reComputeAll: function(){
                        for(var index in this.inputs){
                            this.inputChanged(this.inputs[index]);
                        }
                    }
                };

                return SimulatedChip;
            }]);