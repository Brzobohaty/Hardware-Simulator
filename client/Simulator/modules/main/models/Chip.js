/* global angular */

'use strict';
angular.module('app')

        /**
         * Model uživatele
         */
        .factory('ChipModel', ['CompilerService', function (CompilerService) {
                var plainText; //HDL v čisté textové podobě
                var rowsArray; //HDL na jednotlivé řádky
                var name; //název chipu
                var inputs = []; //pole vstupů (obsahuje asoc. pole: {name})
                var outputs = []; //pole výstupů (obsahuje asoc. pole: {name})
                var rowsCount; //počet řádků kódu
                var errors;

                return {
                    getPlainText: getPlainText,
                    setPlainText: setPlainText,
                    getRows: getRows,
                    getCompileErrors: getCompileErrors,
                    getRowsCount: getRowsCount
                };

                /**
                 * @returns {int} počet všech řádků kódu i s komentářema
                 */
                function getRowsCount() {
                    return rowsCount;
                }

                function getCompileErrors() {
                    return errors;
                }

                /**
                 * @returns {Array} pole řádků kódu
                 */
                function getRows() {
                    return rowsArray;
                }

                /**
                 * @returns {String} textový podoba kódu
                 */
                function getPlainText() {
                    return plainText;
                }

                /**
                 * Nastaví text HDL kódu modelu
                 * @param {String} plainTextt text HDL kódu v čisté textové podobě
                 */
                function setPlainText(plainTextt) {
                    plainText = plainTextt;
                    rowsArray = _parsePlainTextToRows(plainText);
                    errors = CompilerService.compile(plainText);
                    rowsCount = CompilerService.getRowsCount();
                }

                /**
                 * Přeparsuje čistý text kódu na pole jednotlivých řádků
                 * @return {array} pole řádků
                 */
                function _parsePlainTextToRows() {
                    var highlightedText = _highlighteComments(plainText);

                    //var regexp = /CHIP|IN|OUT|PARTS/g;
                    //var highlightedText = highlightedText.replace(regexp, '<span class="keywords">$&</span>');

                    var regexp = /\n/g;
                    var rows = highlightedText.split(regexp);
                    
                    for(var i=0; i<rows.length ; i++){
                        rows[i] = _splitToTokens(rows[i]);
                    }
                    
                    //var codeWitoutComents = _clearComments(plainText);
                    //return _splitToTokens(codeWitoutComents);
                    return rows;
                }

                /**
                 * Ohraničení stylu komentáře
                 * @param {string} plainText HDL kód
                 * @returns {string} HTML kód
                 */
                function _highlighteComments(plainText) {
                    String.prototype.replaceAt = function (index, character) {
                        return this.substr(0, index) + character + this.substr(index + 1);
                    };

                    //Nahrazení znaku nového řádku ve víceřádkovém komentáři  
                    var multiRowCommentPattern = /\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\//g;
                    var match;
                    var highlightedText = plainText;
                    while ((match = multiRowCommentPattern.exec(highlightedText)) !== null) {
                        var length = multiRowCommentPattern.lastIndex;
                        for (var i = match.index; i < length; i++) {
                            if (highlightedText[i] === '\n') {
                                highlightedText = highlightedText.replaceAt(i, "</span>\n<span class='comment'>");
                                length += 29;
                                i += 30;
                            }
                        }
                    }

                    var commentPattern = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:\/\/.*))/g;
                    return highlightedText.replace(commentPattern, '<span class="comment">$&</span>');
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
                    var regexp = /([ ]+|,|;|:|=|{|}|\(|\))(?![^<]*(<\/span>))/g;
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
            }]);