/* global angular */

'use strict';

angular.module('app')

        /**
         * Kompilátor HDL
         */
        .factory('CompilerService', ['ParserService', function (ParserService) {
                var tokens; //dvourozměrné pole řádků a tokenů
                var curToken; //současný token
                var currentRow = 0; //současné číslo řádek
                var currentTokenOnRow = 0; //současné pořadí tokenu na řádku
                var notTokenRegex = /^<span class=.*<\/span>$|\s+|\n/; //regex pro komentáře a bílé znaky
                var nameRegex = /^[A-Za-z][A-Za-z0-9]*$/; //regex pro názvy chipů a pinů
                var name; //název chipu
                var inputs = []; //pole vstupů (obsahuje asoc. pole: {name})
                var outputs = []; //pole výstupů (obsahuje asoc. pole: {name})

                return {
                    compile: compile,
                    getName : getName,
                    getInputs : getInputs,
                    getOutputs : getOutputs,
                    getSimulateFunction : getSimulateFunction
                };
                
                 /**
                 * @returns {Array} výstupy chipu
                 */
                function getOutputs() {
                    return outputs;
                }

                /**
                 * @returns {Array} vstupy chipu
                 */
                function getInputs() {
                    return inputs;
                }

                /**
                 * @returns {String} název chipu
                 */
                function getName() {
                    return name;
                }

                /**
                 * Zkompiluje celý obvod a případné chybové hlášky vloží přímo do daného pole
                 * @param {Array} rowsArray pole řádků s tokeny
                 */
                function compile(rowsArray) {
                    tokens = rowsArray;
                    _compileHeader();
                    _compileInputs();
                    _compileOutputs();
                    _compileParts();
                }

                /**
                 * Zkompiluje hlavičku obvodu
                 */
                function _compileHeader() {
                    _next();
                    if (curToken.content !== 'CHIP') {
                        curToken.errorMes = "Expected keyword CHIP but found " + curToken.content;
                    }
                    _next();
                    name = expectChipName();
                    _next();
                    if (curToken.content !== '{') {
                        curToken.errorMes = "Expected { but found " + curToken.content;
                    }
                    _next();
                }

                /**
                 * Zkompiluje vstupy
                 */
                function _compileInputs() {
                    if (curToken.content !== 'IN') {
                        curToken.errorMes = "Expected keyword IN but found " + curToken.content;
                    }
                    _next();
                    expectPinName();
                    _next();
                    while (curToken.content === ',') {
                        _next();
                        expectPinName();
                        _next();
                    }
                    expectSemicolon();
                    _next();
                }

                /**
                 * Zkompiluje výstupy obvodu
                 */
                function _compileOutputs() {
                    if (curToken.content !== 'OUT') {
                        curToken.errorMes = "Expected keyword OUT but found " + curToken.content;
                    }
                    _next();
                    expectPinName();
                    _next();
                    while (curToken.content === ',') {
                        _next();
                        expectPinName();
                        _next();
                    }
                    expectSemicolon();
                    _next();
                }

                /**
                 * Zkompiluje části obvodu
                 */
                function _compileParts() {
                    if (curToken.content !== 'PARTS') {
                        curToken.errorMes = "Expected keyword PARTS but found " + curToken.content;
                    }
                    _next();
                    if (curToken.content !== ':') {
                        curToken.errorMes = "Expected : but found " + curToken.content;
                    }
                }

                /**
                 * Zkontroluje, zda je v současném tokenu středník a pokud ne, tak uloží do tokenu chybovou hlášku.
                 */
                function expectSemicolon() {
                    if (curToken.content !== ';') {
                        curToken.errorMes = "Expected ; but found " + curToken.content;
                    }
                }

                /**
                 * Zkontroluje, zda je v současném tokenu validní jméno pinu a pokud ne, tak uloží do tokenu chybovou hlášku.
                 */
                function expectPinName() {
                    if (!nameRegex.test(curToken.content)) {
                        curToken.errorMes = "Expected chip pin name. And chip pin name must start with letter and can containt just letters or digits. But found " + curToken.content;
                    }
                }

                /**
                 * Zkontroluje, zda je v současném tokenu validní jméno chipu a pokud ne, tak uloží do tokenu chybovou hlášku.
                 * @return {string} název obvodu
                 */
                function expectChipName() {
                    if (!nameRegex.test(curToken.content)) {
                        curToken.errorMes = "Expected chip name. And chip name must start with letter and can containt just letters or digits. But found " + curToken.content;
                    }else{
                        return curToken.content;
                    }
                    return 'Syntax error';
                }

                /**
                 * Přeskočí všechny bílé znaky, komentáře a do současného tokenu uloží první opravdový token, který najde
                 */
                function _next() {
                    if (currentTokenOnRow < tokens[currentRow].length) {
                        currentTokenOnRow++;
                    } else {
                        currentRow++;
                        currentTokenOnRow = 0;
                    }

                    for (currentRow; currentRow < tokens.length; currentRow++) {
                        for (currentTokenOnRow; currentTokenOnRow < tokens[currentRow].length; currentTokenOnRow++) {
                            curToken = tokens[currentRow][currentTokenOnRow];
                            if (!notTokenRegex.test(curToken.content)) {
                                return;
                            }
                        }
                        currentTokenOnRow = 0;
                    }
                }
            }]);
