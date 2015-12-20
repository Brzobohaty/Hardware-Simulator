/* global angular */

'use strict';

angular.module('app')

        /**
         * Představuje libovolný pin v obvodu
         */
        .factory('PinModel', ['BitModel', function (BitModel) {
                /**
                 * @param {String} name název pinu
                 * @param {int} bitSize šířka pinu v bitech
                 * @param {Array} bitsAssigned pole indexů bitů, které jsou tomuto internímu čipu přiřazeny (allow null)
                 */
                var Pin = function (name, bitSize, bitsAssigned) {
                    this.name = name; //název pinu
                    this.bits = []; //jednotlivé bity pinu (BitModel)
                    this.color; //barva pinu
                    this.inOut = false; //indikátor, zda se jedná o vstup/výstup nebo interní pin
                    this.value = 0; //hodnoty všech bitů v jedné hodnotě
                    this.bitsAssigned = bitsAssigned; //pole indexů bitů, které jsou tomuto internímu čipu přiřazeny

                    //deklarace bitů
                    for (var i = 0; i < bitSize; i++) {
                        this.bits[i] = new BitModel();
                    }
                };
                Pin.colorIndex = 0; //čítač barev
                Pin.colors = ['#00FF00', '#0000FF', '#FF0000', '#01FFFE', '#FFA6FE', '#006401', '#010067', '#95003A', '#007DB5', '#FF00F6', '#FFEEE8', '#774D00', '#90FB92', '#0076FF', '#D5FF00', '#FF937E', '#6A826C', '#FF029D', '#FE8900', '#7A4782', '#FFDB66', '#7E2DD2', '#85A900', '#FF0056', '#A42400', '#00AE7E', '#683D3B', '#BDC6FF', '#263400', '#BDD393', '#00B917', '#9E008E', '#001544', '#C28C9F', '#FF74A3', '#01D0FF', '#004754', '#E56FFE', '#788231', '#0E4CA1', '#91D0CB', '#BE9970', '#968AE8', '#BB8800', '#43002C', '#DEFF74', '#00FFC6', '#FFE502', '#620E00', '#008F9C', '#98FF52', '#7544B1', '#B500FF', '#00FF78', '#FF6E41', '#005F39', '#6B6882', '#5FAD4E', '#A75740', '#A5FFD2', '#FFB167', '#009BFF', '#E85EBE'];
                /**
                 * Restartuje čítač barev pro nový čip
                 */
                Pin.restartColors = function () {
                    Pin.colorIndex = 0;
                };
                Pin.prototype = {
                    getName: function () {
                        return this.name;
                    },
                    /**
                     * Nastaví tento pin jako vstupní/výstupní
                     */
                    setInOut: function () {
                        this.inOut = true;
                    },
                    /**
                     * Vygeneruje pro pin unikátní barvu
                     */
                    generateColor: function () {
                        if (Pin.colorIndex >= Pin.colors.length) {
                            Pin.colorIndex = 0;
                        }
                        this.color = Pin.colors[Pin.colorIndex++];
                    },
                    /**
                     * Vstup byl změněn a tudíž v této metodě dojde k 
                     * přeformátování hodnoty do konkrétních bitů pinu
                     */
                    inputChanged: function(){
                        //TODO tady by šli podle me rovnou volat ty callbacky
                        var bitss = this.value.toString().split('');
                        for(var index in this.bits){
                            this.bits[index].value = Number(bitss[index]);
                        }
                    },
                    /**
                     * Výstup byl změněn a tudíž v této metodě dojde k 
                     * přeformátování bitů pinu do jedné binární hodnoty
                     */
                    outputChanged: function(){
                        var string = '';
                        for(var index in this.bits){
                            string += Number(this.bits[index].value);
                        }
                        this.value = string;
                    }
                };
                return Pin;
            }]);