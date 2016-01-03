/* global angular */

'use strict';

angular.module('app')

        /**
         * Představuje jeden bit na pinu
         */
        .factory('BitModel', [function () {

                /**
                 * Object představující jeden bit na pinu
                 */
                var BitModel = function () {
                    /***********************public**************************/

                    /***********************private*************************/
                    this._value = 0; //{int} hodnota bitu
                    this._callbacks = []; //{Array}{ChipPartPinModel} pole objektů, jejichž výpočetní metoda bude zavolána při změně tohot bitu 

                    /*******************************************************/
                };
                BitModel.prototype = {
                    /***********************public**************************/
                    /**
                     * @returns {int} hodnotu bitu
                     */
                    getValue: function () {
                        return this._value;
                    },
                    /**
                     * @param {int} value hodnotu bitu 1/0
                     */
                    setValue: function (value) {
                        this._value = value;
                    },
                    /**
                     * Přidá callback volaný při změně tohoto bitu
                     * @param {ChipPartPinModel} callbackObject object na kterém je následně volána výpočetní metoda
                     */
                    addCallback: function (callbackObject) {
                        this._callbacks.push(callbackObject);
                    },
                    /**
                     * Zavolá všechny callbacky navěšené na tento bit
                     */
                    runCallbacks: function () {
                        for (var index in this._callbacks) {
                            this._callbacks[index].setValues();
                        }
                    }

                    /***********************private*************************/
                };

                return BitModel;
            }]);