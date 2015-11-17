/* global angular */

'use strict';

angular.module('app')

        /**
         * Kompilátor HDL
         */
        .factory('CompilerService', [function () {
                var currentRow; //řádek, na kterém se zrovna kompilátor nachází
                var allCountRows; //počet řádků kódu
                var tokens;
                var errors = [];

                return {
                    compile: compile,
                    getRowsCount : getRowsCount,
                    getErrors: getErrors
                };

                function compile(plainText) {
                    allCountRows = _getRowsCount(plainText);
                    var codeWitoutComents = _clearComments(plainText);
                    var codeCountRows = _getRowsCount(codeWitoutComents);
                    currentRow = allCountRows-codeCountRows+1;
                    tokens = _splitToTokens(codeWitoutComents);
                    compileHeader();
                    return errors;
                }
                
                function getErrors(){
                    return errors;
                }
                
                /**
                 * @returns {int} počet všech řádků kódu i s komentářema
                 */
                function getRowsCount(){
                    return allCountRows;
                }

                /**
                 * Spočítá počet řádků v textu.
                 * @param {string} text
                 * @returns {int} počet řádků
                 */
                function _getRowsCount(text){
                    var rows = 0;
                    for (var i = 0; i < text.length; ++i){
                        if (text[i] === '\n'){
                            rows++;
                        }
                    }
                    return rows+1;
                }

                /**
                 * Odstraní všechny druhy komentáře z daného kódu
                 * @param {String} code HDL kód
                 * @returns {String} HDL kód bez komentářů 
                 */
                function _clearComments(code) {
                    var clearedText;
                    var commentPattern = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:\/\/.*))/g;
                    clearedText = code.replace(commentPattern, '');
                    clearedText = clearedText.trim();
                    return clearedText;
                }

                /**
                 * Rozdělí kód na jednotlivé tokeny
                 * @param {string} code kód v HDL
                 * @returns {array} pole tokenů
                 */
                function _splitToTokens(code) {
                    var regexp = /[ ]+|(,|;|:|=|{|}|\(|\)|\n)/g;
                    var splited = code.split(regexp);

                    return _clearArray(splited);
                }

                /**
                 * Odstraní z pole nedefinované hodnoty nebo prázdné řetězce.
                 * @param {array} array
                 * @returns {array}
                 */
                function _clearArray(array) {
                    for (var i = 0; i < array.length; i++) {
                        if (array[i] === undefined || array[i] === "") {
                            array.splice(i, 1);
                            i--;
                        }
                    }
                    return array;
                }

                function compileHeader() {
                    var token = tokens.shift();;
                    if(token !== 'CHIP'){
                        if(!errors[currentRow]){
                            errors[currentRow] = []; 
                        }
                        errors[currentRow].push("Expected CHIP but found "+token);
                    }
                }
            }]);
