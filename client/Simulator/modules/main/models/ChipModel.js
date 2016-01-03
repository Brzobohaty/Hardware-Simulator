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
                    this._fileName = fileName; // {String} název souboru
                    this._plainText = plainText; //{String} čistý text přečtený ze souboru
                    this._parts = null; //{Array} pole částí chipu (ChipPartModel)
                    this._name = null; //{String} název chipu
                    this._tokens = null; //{Array} dvourozměrné pole řádků a tokenů (TokenModel)

                    /********************************************************/
                };
                ChipModel.prototype = {
                    /************************public*************************/
                    /**
                     * Nastaví procentuálně kompletaci kompilace
                     * @param {int} progress postup v procentech
                     */
                    setProgress:function(progress){
                        this.progress = progress;
                    },
                    /**
                     * @param {int} rowNumber číslo řádku, kde chyba nastala
                     * @param {String} message chybová hláška
                     */
                    setCompileError: function (rowNumber, message) {
                        this.compileError = {'row': rowNumber, 'message': message};
                    },
                    /**
                     * @return {row, message} Object představující kompilační chybu obsahuje číslo řádku, kde chyba nastala a chybovou hlášku
                     */
                    getCompileError: function () {
                        return this.compileError;
                    },
                    /**
                     * Vymaže chyby v chipu
                     */
                    clearCompileError: function () {
                        this.compileError = null;
                    },
                    /**
                     * @param {SimulatedChipModel} simulovatelný chip
                     */
                    setSimulatedChip: function (simulatedChip) {
                        this.simulatedChip = simulatedChip;
                    },
                    /**
                     * @return {SimulatedChipModel} simulovatelný chip
                     */
                    getSimulatedChip: function () {
                        return this.simulatedChip;
                    },
                    /**
                     * @param {Array} parts pole částí chipu (ChipPartModel)
                     */
                    setParts: function (parts) {
                        this._parts = parts;
                    },
                    /**
                     * @returns {Array} pole částí chipu (ChipPartModel)
                     */
                    getParts: function () {
                        return this._parts;
                    },
                    /**
                     * @returns {String} název souboru
                     */
                    getFileName: function () {
                        return this._fileName;
                    },
                    /**
                     * @returns {String} čistý text přečtený ze souboru
                     */
                    getPlainText: function () {
                        return this._plainText;
                    },
                    /**
                     * @returns {String} název chipu
                     */
                    getName: function () {
                        return this._name;
                    },
                    /**
                     * @param {String} name název chipu
                     */
                    setName: function (name) {
                        this._name = name;
                    },
                    /**
                     * @param {Array} tokens dvourozměrné pole řádků a tokenů (TokenModel)
                     */
                    setTokens: function (tokens) {
                        this._tokens = tokens;
                    },
                    /**
                     * @return {Array} tokens dvourozměrné pole řádků a tokenů (TokenModel)
                     */
                    getTokens: function () {
                        return this._tokens;
                    },
                    /**
                     * Recompilace obvodu
                     */
                    recompile: function (scope) {
                        this.compileError = null;
                        this._parts = null;
                        this.progress = null;
                        this.simulatedChip = null;
                        this._name = null;
                        CompilerService.compile(this, scope);
                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                    }

                    /***********************private**************************/
                };

                return ChipModel;
            }]);