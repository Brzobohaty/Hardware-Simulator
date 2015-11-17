/* global angular */

'use strict';
angular.module('app')

        /**
         * Model uživatele
         */
        .factory('ChipModel', ['CompilerService', 'ParserService', function (CompilerService, ParserService) {
                var plainText; //HDL v čisté textové podobě
                var rowsArray; //HDL na jednotlivé řádky
                var name; //název chipu
                var inputs = []; //pole vstupů (obsahuje asoc. pole: {name})
                var outputs = []; //pole výstupů (obsahuje asoc. pole: {name})

                return {
                    setPlainText: setPlainText,
                    getRows: getRows
                };

                /**
                 * @returns {Array} pole řádků kódu
                 */
                function getRows() {
                    return rowsArray;
                }

                /**
                 * Nastaví text HDL kódu modelu
                 * @param {String} plainTextt text HDL kódu v čisté textové podobě
                 */
                function setPlainText(plainTextt) {
                    plainText = plainTextt;
                    rowsArray = ParserService.parsePlainTextToRowsOfTokens(plainText);
                    CompilerService.compile(rowsArray);
                }
            }]);