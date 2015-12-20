/* global angular */

'use strict';

angular.module('app')

        /**
         * Představuje jeden token HDL kódu (token zde může být i mezera nebo komentář)
         */
        .factory('TokenModel', [function () {

                var Token = function (content) {
                    /***********************public**************************/
                    
                    /***********************private*************************/
                    var _content = content;
                    var _errorMes = null;
                    var _that = this;
                    var _isTokenKeyword; //{boolean} příznak, zda se jedná o klíčové slovo
                    
                    /************************public*************************/
                    
                    /**
                     * @returns {Boolean} true, pokud je token klíčovým slovem
                     */
                    this.isKeyword = function () {
                        return _isTokenKeyword;
                    };
                    
                    /**
                     * @returns {String} Chybová hláška v případě chybné kompilace
                     */
                    this.getErrorMes = function () {
                        return _errorMes;
                    };
                    
                    /**
                     * @param {String} content Chybová hláška v případě chybné kompilace
                     */
                    this.setErrorMes = function (content) {
                        _errorMes = content;
                    };
                    
                    /**
                     * @returns {String} obsah tokenu
                     */
                    this.getContent = function () {
                        return _content;
                    };
                    
                    /***********************private**************************/
                    
                    /**
                     * Nastaví příznak, zda je token klíčovým slovem
                     */
                    function _isKeyWord() {
                        var regexp = /^CHIP|IN|OUT|PARTS$/;
                        _isTokenKeyword = regexp.test(_content);
                    }
                    
                    /********************************************************/
                    _isKeyWord();
                };

                return Token;
            }]);