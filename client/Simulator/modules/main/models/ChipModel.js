/* global angular */

'use strict';

angular.module('app')

        /**
         * Představuje object celého chipu
         */
        .factory('ChipModel', ['CompilerService', function (CompilerService) {
                /**
                 * Object představující jeden chip
                 * @param {String} fileName název souboru
                 * @param {String} plainText čistý text přečtený ze souboru
                 */
                var ChipModel = function (fileName, plainText) {
                    /***********************public**************************/
                    this.progress = null; //{int} hodnota vyjadřující procentuální stav kompilace
                    this.compileError = null; //{row, message} Object představující kompilační chybu obsahuje číslo řádku, kde chyba nastala a chybovou hlášku
                    this.simulatedChip = null; //{SimulatedChipModel} simulovatelná forma tohoto chipu

                    /***********************private*************************/
                    var _fileName = fileName; // {String} název souboru
                    var _plainText = plainText; //{String} čistý text přečtený ze souboru
                    var _parts = null; //{Array} pole částí chipu (ChipPartModel)
                    var _name = null; //{String} název chipu
                    var _tokens = null; //{Array} dvourozměrné pole řádků a tokenů (TokenModel)
                    var _that = this;

                    /************************public*************************/
                    
                    /**
                     * @param {Array} parts pole částí chipu (ChipPartModel)
                     */
                    this.setParts = function (parts) {
                        _parts = parts;
                    };

                    /**
                     * @returns {Array} pole částí chipu (ChipPartModel)
                     */
                    this.getParts = function () {
                        return _parts;
                    };

                    /**
                     * @returns {String} název souboru
                     */
                    this.getFileName = function () {
                        return _fileName;
                    };

                    /**
                     * @returns {String} čistý text přečtený ze souboru
                     */
                    this.getPlainText = function () {
                        return _plainText;
                    };
                    
                    /**
                     * @returns {String} název chipu
                     */
                    this.getName = function () {
                        return _name;
                    };
                    
                    /**
                     * @param {String} name název chipu
                     */
                    this.setName = function (name) {
                        _name = name;
                    };
                    
                    /**
                     * @param {Array} tokens dvourozměrné pole řádků a tokenů (TokenModel)
                     */
                    this.setTokens = function (tokens) {
                        _tokens = tokens;
                    };
                    
                    /**
                     * @return {Array} tokens dvourozměrné pole řádků a tokenů (TokenModel)
                     */
                    this.getTokens = function () {
                        return _tokens;
                    };

                    /**
                     * Recompilace obvodu
                     */
                    this.recompile = function (scope) {
                        this.compileError = null;
                        _parts = null;
                        this.progress = null;
                        this.simulatedChip = null;
                        _name = null;
                        CompilerService.compile(this, scope);
                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                    };

                    /***********************private**************************/

                    /********************************************************/
                };
                ChipModel.prototype = {
                    /**
                     * @param {int} rowNumber číslo řádku, kde chyba nastala
                     * @param {String} message chybová hláška
                     */
                    setCompileError : function (rowNumber, message) {
                        this.compileError = {'row': rowNumber, 'message': message};
                    },
                    
                    /**
                     * Vymaže chyby v chipu
                     */
                    clearCompileError : function () {
                        this.compileError = null;
                    },

                    /**
                     * @param {SimulatedChipModel} simulovatelný chip
                     */
                    setSimulatedChip : function (simulatedChip) {
                        this.simulatedChip = simulatedChip;
                    }
                };

                return ChipModel;
            }]);