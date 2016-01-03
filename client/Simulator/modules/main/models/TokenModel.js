/* global angular */

'use strict';

angular.module('app')

        /**
         * Představuje jeden token HDL kódu (token zde může být i mezera nebo komentář)
         */
        .factory('TokenModel', [function () {

                /**
                 * Objekt tokenu
                 * @param {String} content obsah tokenu v surové podobě
                 */
                var TokenModel = function (content) {
                    /***********************public**************************/ 

                    /***********************private*************************/
                    this._pin = {}; //{PinModel} interní pin, který je repreyentován tímto tokenem
                    this._content = content; //{String} obsah tokenu v surové podobě
                    this._errorMes = null; //{String} Chybová hláška v případě chybné kompilace
                    this._partId = null; //{int} id části chipu, kterou tento token představuje
                    this._isTokenKeyword; //{boolean} příznak, zda se jedná o klíčové slovo

                    /********************************************************/
                    this._isKeyWord();
                };
                TokenModel.prototype = {
                    /************************public*************************/
                    /**
                     * Nastavení pinu, který je reprezentován tímto tokenem
                     * @param {PinModel} interní pin, který je repreyentován tímto tokenem 
                     */
                    setPin: function (pin) {
                        this._pin = pin;
                    },
                    /**
                     * @returns {PinModel} interní pin, který je repreyentován tímto tokenem 
                     */
                    getPin: function () {
                        return this._pin;
                    },
                    /**
                     * @returns {Boolean} true, pokud je token klíčovým slovem
                     */
                    isKeyword: function () {
                        return this._isTokenKeyword;
                    },
                    /**
                     * @returns {String} Chybová hláška v případě chybné kompilace
                     */
                    getErrorMes: function () {
                        return this._errorMes;
                    },
                    /**
                     * @param {String} content Chybová hláška v případě chybné kompilace
                     */
                    setErrorMes: function (content) {
                        this._errorMes = content;
                    },
                    /**
                     * @returns {int} id části chipu, kterou tento token představuje
                     */
                    getPartId: function () {
                        return this._partId;
                    },
                    /**
                     * @param {int} id části chipu, kterou tento token představuje
                     */
                    setPartId: function (id) {
                        this._partId = id;
                    },
                    /**
                     * @returns {String} obsah tokenu
                     */
                    getContent: function () {
                        return this._content;
                    },
                    /***********************private**************************/

                    /**
                     * Nastaví příznak, zda je token klíčovým slovem
                     */
                    _isKeyWord: function () {
                        var regexp = /^CHIP|IN|OUT|PARTS$/;
                        this._isTokenKeyword = regexp.test(this._content);
                    }
                };

                return TokenModel;
            }]);