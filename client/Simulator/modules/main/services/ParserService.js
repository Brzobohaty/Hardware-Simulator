/* global angular */

'use strict';

angular.module('app')

        /**
         * Parser HDL
         */
        .factory('ParserService', [function () {

                return {
                    parsePlainTextToRowsOfTokens: parsePlainTextToRowsOfTokens,
                    isKeyWord : isKeyWord
                };
                
                /**
                 * @param {string} token
                 * @returns {Boolean} true pokud je daný token klíčovým slovem
                 */
                function isKeyWord(token) {
                    var regexp = /^CHIP|IN|OUT|PARTS$/;
                    return regexp.test(token);
                }

                /**
                 * Přeparsuje čistý text kódu na pole jednotlivých řádků
                 * @param {string} plainText čistý HDL kód
                 * @return {array} pole řádků
                 */
                function parsePlainTextToRowsOfTokens(plainText) {
                    var highlightedText = _highlighteComments(plainText);
                    
                    var regexp = /\n/g;
                    var rows = highlightedText.split(regexp);

                    for (var i = 0; i < rows.length; i++) {
                        rows[i] = _makeArrayWithErrors(_splitToTokens(rows[i]));
                    }
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
                 * Místo jednotlivých tokenů vloží do pole asociativní pole s obsahem tokenu a chybovými hláškami
                 * @param {Array} arrayOfTokens pole tokenů
                 * @returns {Array} pole s asociativními poli
                 */
                function _makeArrayWithErrors(arrayOfTokens){
                    var arrayWithErrors = [];
                    var token;
                    while(token = arrayOfTokens.shift()){
                        arrayWithErrors.push({'content':token, 'errorMes':''});
                    }
                    return arrayWithErrors;
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