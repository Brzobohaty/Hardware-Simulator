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
                var parts = []; //pole částí obvodu (obsahuje asociativní pole: {name, pins})
                var internalPins = {}; //mapa interních pinů, včetně vstupních a výstupních

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
                function getParts() {
                    return parts;
                }

                /**
                 * Zkompiluje celý obvod a případné chybové hlášky vloží přímo do daného pole
                 * @param {Array} rowsArray pole řádků s tokeny
                 * @return {boolean} true pokud nastala chyba při kompilaci
                 */
                function compile(rowsArray) {
                    tokens = rowsArray;
                    if (_compileHeader() && _compileInputs() && _compileOutputs() && _compileParts()) {
                        _setOutputFunctions();
                        return true;
                    }
                    return false;
                }

                //TODO
                function _setOutputFunctions() {
                    //vložení inputů do mapy
                    for (var i = 0; i < inputs.length; i++) {
                        internalPins[inputs[i].name] = inputs[i];
                    }

                    //vložení outputů do mapy
                    for (var i = 0; i < outputs.length; i++) {
                        internalPins[outputs[i].name] = outputs[i];
                    }

                    //vložení interních pinů do mapy
                    for (var i = 0; i < parts.length; i++) {
                        for (var property in parts[i].pins) {
                            if (parts[i].pins.hasOwnProperty(property)) {
                                if (!internalPins[parts[i].pins[property]]) {
                                    internalPins[parts[i].pins[property]] = {
                                        name: parts[i].pins[property],
                                        value: 0,
                                        callbacks: []
                                    };
                                }
                            }
                        }
                    }
                    
                    

                    /**
                     * Object představující jeden chip
                     * @param {String} name
                     * @param {object} inputs obsahuje pouze proměnné, které představují hodnoty na vstupu 
                     * @param {object} outputs obsahuje pouze proměnné, které představují hodnoty na výstupu
                     * @param {function} computeFcn
                     */
                    var Chip = function (name, inputs, outputs, computeFcn) {
                        this.name = name; //jméno chipu
                        this._compute = computeFcn; //výpočetní funkce chipu
                        this.inputs = inputs;
                        this.outputs = outputs;
                        
                    };
                    Chip.prototype = {
                        /**
                         * TODO
                         */
                        setPins : function (pins, partMap) {
                            for (var pinName in partMap.pins) {
                                if (this.inputs.hasOwnProperty(pinName)) {
                                    if (!this.inputs[pinName].used) {
                                        this.inputs[pinName] = pins[partMap.pins[pinName]];
                                        this.inputs[pinName].used = true;
                                        partMap.pins[pinName] = pins[partMap.pins[pinName]];
                                    } else {
                                        return 'Pin ' + pinName + ' má přiřazenu hodnotu podruhé.';
                                    }
                                } else if (this.outputs.hasOwnProperty(pinName)) {
                                    if (!this.outputs[pinName].used) {
                                        this.outputs[pinName] = pins[partMap.pins[pinName]];
                                        this.outputs[pinName].used = true;
                                        partMap.pins[pinName] = pins[partMap.pins[pinName]];
                                    } else {
                                        return 'Pin ' + pinName + ' má přiřazenu hodnotu podruhé.';
                                    }
                                } else {
                                    return 'Obvod ' + partMap.name + ' nemá pin s názvem ' + pinName;
                                }
                            }
                            if (this._allUsed()) {
                                this._compute();
                                this._setListener();
                                return 'nenastala chyba';

                            } else {
                                return 'nevyužité všechny piny';
                            }
                        },
                        
                        /**
                         * Nastaví listener pro vstupy tohoto obvodu 
                         * (při každé změně vstupu vypočítá hodnotu na výstupu a 
                         * zavolá callbacky napojené na výstupní pin)
                         */
                        _setListener : function () {
                            var chip = this;
                            for (var inputName in this.inputs) {
                                this.inputs[inputName].callbacks.push(function () {
                                    chip._compute();
                                    chip._runOutputCallbacks();
                                });
                            }
                        },
                        
                        /**
                         * Zavolá callbacky napojené na výstupní pin
                         */
                        _runOutputCallbacks : function () {
                            for (var outputName in this.outputs) {
                                for (var i = 0; i < this.outputs[outputName].callbacks.length; i++) {
                                    this.outputs[outputName].callbacks[i]();
                                }
                            }
                        },
                        
                        /**
                         * Zkontroluje zda mají všechny piny příznak "used" na true respektive, zda byly použity
                         * @returns {Boolean} true pokud jsou všechny piny použity
                         */
                        _allUsed : function () {
                            for (var pinName in this.inputs) {
                                if (!this.inputs[pinName].used) {
                                    return false;
                                }
                            }
                            for (var pinName in this.outputs) {
                                if (!this.outputs[pinName].used) {
                                    return false;
                                }
                            }
                            return true;
                        }
                    };

                    var not1 = new Chip('NOT', {'in': {value: 0}}, {'out': {value: 1}}, function () {
                        this.outputs['out'].value = !this.inputs['in'].value;
                    });
                    console.log(not1.setPins(internalPins, parts[0]));

                    var not2 = new Chip('NOT', {'in': {value: 0}}, {'out': {value: 1}}, function () {
                        this.outputs['out'].value = !this.inputs['in'].value;
                    });
                    console.log(not2.setPins(internalPins, parts[2]));

                    var and1 = new Chip('AND', {'a': {value: 0}, 'b': {value: 0}}, {'out': {value: 0}}, function () {
                        this.outputs['out'].value = this.inputs['a'].value & this.inputs['b'].value;
                    });
                    console.log(and1.setPins(internalPins, parts[1]));

                    var and2 = new Chip('AND', {'a': {value: 0}, 'b': {value: 0}}, {'out': {value: 0}}, function () {
                        this.outputs['out'].value = this.inputs['a'].value & this.inputs['b'].value;;
                    });
                    console.log(and2.setPins(internalPins, parts[3]));

                    var or = new Chip('OR', {'a': {value: 0}, 'b': {value: 0}}, {'out': {value: 0}}, function () {
                        this.outputs['out'].value = this.inputs['a'].value | this.inputs['b'].value;
                    });
                    console.log(or.setPins(internalPins, parts[4]));
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
                    inputs.push({'name': pinName, 'value': 0, 'callbacks': []});
                    _next();
                    while (curToken.content === ',') {
                        _next();
                        if (!(pinName = expectPinName())) {
                            return false;
                        }
                        inputs.push({'name': pinName, 'value': 0, 'callbacks': []});
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
                    outputs.push({'name': pinName, 'value': 0, 'callbacks': []});
                    _next();
                    while (curToken.content === ',') {
                        _next();
                        if (!(pinName = expectPinName())) {
                            return false;
                        }
                        outputs.push({'name': pinName, 'value': 0, 'callbacks': []});
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
                                'name': '',
                                'pins': {}
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
                    chip.pins[pinNameLeft] = pinNameRight;
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
                    } else {
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
