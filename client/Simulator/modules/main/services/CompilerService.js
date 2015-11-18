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
                var parts = []; //pole částí obvodu (obsahuje asociativní pole: {name, inputs, outputs})

                return {
                    compile: compile,
                    getName: getName,
                    getInputs: getInputs,
                    getOutputs: getOutputs,
                    getParts: getParts
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
                 * @returns {Array} pole částí obvodu
                 */
                function getParts(){
                    return parts;
                }

                /**
                 * Zkompiluje celý obvod a případné chybové hlášky vloží přímo do daného pole
                 * @param {Array} rowsArray pole řádků s tokeny
                 * @return {boolean} false pokud nastala chyba při kompilaci
                 */
                function compile(rowsArray) {
                    tokens = rowsArray;
                    if (_compileHeader() && _compileInputs() && _compileOutputs() && _compileParts()) {
                        return true;
                    }
                    return false;
                }

                /**
                 * Zkompiluje hlavičku obvodu
                 * @return {boolean} false pokud nastala chyba při kompilaci
                 */
                function _compileHeader() {
                    _next();
                    if (!expectKeyword('CHIP')) {
                        return false;
                    }
                    _next();
                    if (!(name = expectChipName())) {
                        return false;
                    }
                    _next();
                    if (!expectChar('{')) {
                        return false;
                    }
                    _next();
                    return true;
                }

                /**
                 * Zkompiluje vstupy
                 * @return {boolean} false pokud nastala chyba při kompilaci
                 */
                function _compileInputs() {
                    var pinName;
                    if (!expectKeyword('IN')) {
                        return false;
                    }
                    _next();
                    if (!(pinName = expectPinName())) {
                        return false;
                    }
                    inputs.push({'name':pinName});
                    _next();
                    while (curToken.content === ',') {
                        _next();
                        if (!(pinName = expectPinName())) {
                            return false;
                        }
                        inputs.push({'name':pinName});
                        _next();
                    }
                    if (!expectChar(';')) {
                        return false;
                    }
                    _next();
                    return true;
                }

                /**
                 * Zkompiluje výstupy obvodu
                 * @return {boolean} false pokud nastala chyba při kompilaci
                 */
                function _compileOutputs() {
                    var pinName;
                    if (!expectKeyword('OUT')) {
                        return false;
                    }
                    _next();
                    if (!(pinName = expectPinName())) {
                        return false;
                    }
                    outputs.push({'name':pinName});
                    _next();
                    while (curToken.content === ',') {
                        _next();
                        if (!(pinName = expectPinName())) {
                            return false;
                        }
                        outputs.push({'name':pinName});
                        _next();
                    }
                    if (!expectChar(';')) {
                        return false;
                    }
                    _next();
                    return true;
                }

                /**
                 * Zkompiluje části obvodu
                 * @return {boolean} false pokud nastala chyba při kompilaci
                 */
                function _compileParts() {
                    if (!expectKeyword('PARTS')) {
                        return false;
                    }
                    _next();
                    if (!expectChar(':')) {
                        return false;
                    }
                    _next();
                    if (!expectPart()) {
                        return false;
                    }
                    _next();
                    while (curToken.content !== '}') {
                        if (!expectPart()) {
                            return false;
                        }
                        _next();
                    }
                    return true;
                }

                /**
                 * Zkontroluje, zda následující sekvence tokenů představuje deklaraci části obvodu.
                 * Pokud ne, tak uloží do tokenu chybovou hlášku.
                 * @return {boolean} false pokud nastala chyba při kompilaci
                 */
                function expectPart() {
                    var chip =
                            {
                                'name' : '',
                                'inputs' : {},
                                'outputs' : {}
                            };
                    //TODO tady by se mělo kontrolovat zda takovej obvod existuje
                    if (!(chip.name = expectChipName())) {
                        return false;
                    }
                    _next();
                    if (!expectChar('(')) {
                        return false;
                    }
                    _next();
                    if (!expectPinAssignment(chip)) {
                        return false;
                    }
                    _next();
                    while (curToken.content === ',') {
                        _next();
                        if (!expectPinAssignment(chip)) {
                            return false;
                        }
                        _next();
                    }
                    if (!expectChar(')')) {
                        return false;
                    }
                    _next();
                    if (!expectChar(';')) {
                        return false;
                    }
                    parts.push(chip);
                    return true;
                }

                /**
                 * Zkontroluje, zda následující sekvence tokenů představuje přiřazení pinů.
                 * Pokud ne, tak uloží do tokenu chybovou hlášku.
                 * @param {object} chip definice chipu
                 * @return {boolean} false pokud nastala chyba při kompilaci
                 */
                function expectPinAssignment(chip) {
                    var pinNameLeft;
                    var pinNameRight;
                    if (!(pinNameLeft = expectPinName())) {
                        return false;
                    }
                    _next();
                    if (!expectChar('=')) {
                        return false;
                    }
                    _next();
                    if (!(pinNameRight = expectPinName())) {
                        return false;
                    }
                    chip.inputs[pinNameLeft] = pinNameRight;
                    return true;
                }

                /**
                 * Zkontroluje, zda je v současném tokenu validní jméno pinu a pokud ne, tak uloží do tokenu chybovou hlášku.
                 * @return {string/boolean} false pokud nastala chyba při kompilaci, jinak název pinu
                 */
                function expectPinName() {
                    if (!nameRegex.test(curToken.content)) {
                        curToken.errorMes = "Expected chip pin name. And chip pin name must start with letter and can containt just letters or digits. But found " + curToken.content;
                        return false;
                    }else{
                        return curToken.content;
                    }
                }

                /**
                 * Zkontroluje, zda je v současném tokenu validní jméno chipu a pokud ne, tak uloží do tokenu chybovou hlášku.
                 * @return {string/boolean} false pokud nastala chyba při kompilaci, jinak název obvodu
                 */
                function expectChipName() {
                    if (!nameRegex.test(curToken.content)) {
                        curToken.errorMes = "Expected chip name. And chip name must start with letter and can containt just letters or digits. But found " + curToken.content;
                        return false;
                    } else {
                        return curToken.content;
                    }
                }

                /**
                 * Zkontroluje, zda je v současném tokenu daný znak a pokud ne, tak uloží do tokenu chybovou hlášku.
                 * @param {string} char znak
                 * @return {boolean} false pokud nastala chyba při kompilaci
                 */
                function expectChar(char) {
                    if (curToken.content !== char) {
                        curToken.errorMes = "Expected " + char + " but found " + curToken.content;
                        return false;
                    }
                    return true;
                }

                /**
                 * Zkontroluje, zda je v současném tokenu dané klíčové slovo a pokud ne, tak uloží do tokenu chybovou hlášku.
                 * @param {string} keyword očekávané klíčové slovo
                 * @return {boolean} false pokud nastala chyba při kompilaci
                 */
                function expectKeyword(keyword) {
                    if (curToken.content !== keyword) {
                        curToken.errorMes = "Expected " + keyword + " but found " + curToken.content;
                        return false;
                    }
                    return true;
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
