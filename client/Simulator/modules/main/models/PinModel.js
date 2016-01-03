/* global angular */

'use strict';

angular.module('app')

        /**
         * Představuje interní pin v obvodu
         */
        .factory('PinModel', ['BitModel', function (BitModel) {
                /**
                 * @param {String} name název pinu
                 * @param {int} bitSize šířka pinu v bitech
                 * @param {Array}{BitModel} bitsAssigned pole indexů bitů, které jsou tomuto internímu čipu přiřazeny (allow null)
                 * @param {int} inOut indikátor, zda se jedná o vstup = 1, výstup = 2 nebo interní pin = false/null
                 */
                var PinModel = function (name, bitSize, bitsAssigned, inOut) {
                    /***********************public**************************/
                    this.value = 0; //{int} hodnoty všech bitů v jedné hodnotě

                    /***********************private*************************/
                    this._name = name; //{String} název pinu
                    this._bits = []; //{Array}{BitModel} jednotlivé bity pinu (BitModel)
                    this._color; //{String} barva pinu v HEX
                    this._inOut = inOut | false; //{int} indikátor, zda se jedná o vstup = 1, výstup = 2 nebo interní pin = false/null 
                    this._bitsAssigned = bitsAssigned; //{Array} pole indexů bitů, které jsou tomuto internímu čipu přiřazeny

                    /********************************************************/
                    //deklarace bitů
                    for (var i = 0; i < bitSize; i++) {
                        this._bits[i] = new BitModel();
                    }
                };
                PinModel.colorIndex = 0; //čítač barev
                PinModel.colors = ['#00FF00', '#0000FF', '#FF0000', '#01FFFE', '#FFA6FE', '#006401', '#010067', '#95003A', '#007DB5', '#FF00F6', '#FFEEE8', '#774D00', '#90FB92', '#0076FF', '#D5FF00', '#FF937E', '#6A826C', '#FF029D', '#FE8900', '#7A4782', '#FFDB66', '#7E2DD2', '#85A900', '#FF0056', '#A42400', '#00AE7E', '#683D3B', '#BDC6FF', '#263400', '#BDD393', '#00B917', '#9E008E', '#001544', '#C28C9F', '#FF74A3', '#01D0FF', '#004754', '#E56FFE', '#788231', '#0E4CA1', '#91D0CB', '#BE9970', '#968AE8', '#BB8800', '#43002C', '#DEFF74', '#00FFC6', '#FFE502', '#620E00', '#008F9C', '#98FF52', '#7544B1', '#B500FF', '#00FF78', '#FF6E41', '#005F39', '#6B6882', '#5FAD4E', '#A75740', '#A5FFD2', '#FFB167', '#009BFF', '#E85EBE'];
                /**
                 * Restartuje čítač barev pro nový čip
                 */
                PinModel.restartColors = function () {
                    PinModel.colorIndex = 0;
                };
                PinModel.prototype = {
                    /***********************public**************************/
                    /**
                     * @returns {Array} pole indexů bitů, které jsou tomuto internímu čipu přiřazeny
                     */
                    getBitsAssigned: function () {
                        return this._bitsAssigned;
                    },
                    /**
                     * @param {Array} bitsAssigned pole indexů bitů, které jsou tomuto internímu čipu přiřazeny
                     */
                    setBitsAssigned: function (bitsAssigned) {
                        this._bitsAssigned = bitsAssigned;
                    },
                    /**
                     * @returns {String} barva pinu v HEX
                     */
                    getColor: function () {
                        return this._color;
                    },
                    /**
                     * @returns {String} název pinu
                     */
                    getName: function () {
                        return this._name;
                    },
                    /**
                     * Jedná se o vstup/výstup nebo interní pin?
                     * @returns {int} vstup = 1, výstup = 2 nebo interní pin = false/null
                     */
                    isInOut: function () {
                        return this._inOut;
                    },
                    /**
                     * Vygeneruje pro pin unikátní barvu
                     */
                    generateColor: function () {
                        if (PinModel.colorIndex >= PinModel.colors.length) {
                            PinModel.colorIndex = 0;
                        }
                        this._color = PinModel.colors[PinModel.colorIndex++];
                    },
                    /**
                     * Vstup byl změněn a tudíž v této metodě dojde k 
                     * přeformátování hodnoty do konkrétních bitů pinu
                     */
                    inputChanged: function () {
                        var bitss = this.value.toString().split('');
                        for (var index in this._bits) {
                            this._bits[index].setValue(Number(bitss[index]));
                        }
                    },
                    /**
                     * Výstup byl změněn a tudíž v této metodě dojde k 
                     * přeformátování bitů pinu do jedné binární hodnoty
                     */
                    outputChanged: function () {
                        var string = '';
                        for (var index in this._bits) {
                            string += Number(this._bits[index].getValue());
                        }
                        this.value = string;
                    },
                    /**
                     * @returns {Array}{BitModel} jednotlivé bity pinu
                     */
                    getBits: function () {
                        return this._bits;
                    }
                    /***********************private*************************/
                };
                return PinModel;
            }]);