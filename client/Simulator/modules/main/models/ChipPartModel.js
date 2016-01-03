/* global angular */

'use strict';

angular.module('app')

        /**
         * Představuje object části chipu
         */
        .factory('ChipPartModel', ['ChipPartPinModel', function (ChipPartPinModel) {
                /**
                 * Object představující část chipu
                 * @param {string} partName název chipu
                 * @param {TokenModel} nameToken token názvu chipu
                 * @param {Array} partRow řádek na kterém je název tohoto chipu
                 * @param {int} id této části chipu
                 */
                var ChipPartModel = function (partName, nameToken, partRow, id) {
                    /***********************public**************************/
                    this.builtIn; //{boolean} příznak, zda je právě používána buildIn verze tohot chipu

                    /***********************private*************************/
                    this._id = id; //{int} id této části chipu
                    this._name = partName; //{string} název chipu
                    this._nameToken = nameToken; //{TokenModel} token názvu chipu
                    this._row = partRow; //{Array} řádek na kterém je název tohoto chipu
                    this._pins = {}; //{Map}{pinName:ChipPartPinModel} piny této části obvodu
                    this._builtInChip; //{ChipSimulatedPartModel} simulovatelná vestavěná část chipu
                    this._userChip; //{ChipSimulatedPartModel} simulovatelná část chipu od uživatele

                    /********************************************************/
                    nameToken.setPartId(id);
                };
                ChipPartModel.prototype = {
                    /************************public*************************/
                    /**
                     * @returns {int} id této části chipu
                     */
                    getId: function () {
                        return this._id;
                    },
                    /**
                     * @returns {Map}{pinName:ChipPartPinModel} piny této části obvodu
                     */
                    getPins: function () {
                        return this._pins;
                    },
                    /**
                     * @returns {string} id této části chipu
                     */
                    getName: function () {
                        return this._name;
                    },
                    /**
                     * @returns {TokenModel} token názvu chipu
                     */
                    getNameToken: function () {
                        return this._nameToken;
                    },
                    /**
                     * @returns {Array} řádek na kterém je název tohoto chipu
                     */
                    getRow: function () {
                        return this._row;
                    },
                    /**
                     * @returns {ChipSimulatedPartModel} simulovatelná vestavěná část chipu
                     */
                    getBuiltInChip: function () {
                        return this._builtInChip;
                    },
                    /**
                     * @returns {ChipSimulatedPartModel} simulovatelná část chipu od uživatele
                     */
                    getUserChip: function () {
                        return this._userChip;
                    },
                    /**
                     * Přidá pin této části obvodu.
                     * @param {string} name název části
                     * @param {PinModel} internalPin interní pin přiřazený tomuto pinu 
                     * @param {TokenModel} nameToken token názvu pinu
                     * @param {TokenModel} internalPinToken token přiřezeného pinu
                     * @param {Array}{int} bitsAssigned pole indexů bitů, které jsou přiřazeny tomuto pinu z interního pinu
                     * @returns {Boolean} false pokud pin se stejným názvem již přiřazen byl
                     */
                    addPin: function (name, internalPin, nameToken, internalPinToken, bitsAssigned) {
                        if (this._pins.hasOwnProperty(name)) {
                            return false;
                        }
                        this._pins[name] = new ChipPartPinModel(name, internalPin, nameToken, internalPinToken, this, bitsAssigned);
                        return true;
                    },
                    /**
                     * Asociuje logiku simulovatelného chipu od uživatele s touto částí obvodu
                     * @param {ChipSimulatedPartModel} simulatedChip simulovatelný chip
                     * @param {ChipModel} chip hlavní chip jehož je tento částí
                     */
                    setUserChip: function (simulatedChip, chip) {
                        this._userChip = simulatedChip;
                        this._userChip.setPins(this._pins, this._nameToken, this._row, this._name, chip);
                    },
                    /**
                     * Asociuje logiku vestavěného simulovatelného chipu s touto částí obvodu
                     * @param {ChipSimulatedPartModel} simulatedChip simulovatelný chip
                     * @param {ChipModel} chip hlavní chip jehož je tento částí
                     */
                    setBuiltInChip: function (simulatedChip, chip) {
                        this._builtInChip = simulatedChip;
                        this._builtInChip.setPins(this._pins, this._nameToken, this._row, this._name, chip);
                    }

                    /***********************private**************************/
                };

                return ChipPartModel;
            }]);