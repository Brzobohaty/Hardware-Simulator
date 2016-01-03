/* global angular */

'use strict';

angular.module('app')

        /**
         * Kompilátor HDL
         */
        .factory('CompilerService', ['ParserService', 'PinModel', 'SimulatedChipModel', function (ParserService, PinModel, SimulatedChipModel) {
                var _tokens; //dvourozměrné pole řádků a tokenů
                var _curToken; //{TokenModel} současný token
                var _currentRow = 0; //{int} současné číslo řádek
                var _currentTokenOnRow = 0; //{int} současné pořadí tokenu na řádku
                var _notTokenRegex = /^<span class=.*<\/span>$|\s+|\n/; //regex pro komentáře a bílé znaky
                var _nameRegex = /^[A-Za-z][A-Za-z0-9]*$/; //regex pro názvy chipů a pinů
                var _numberRegex = /^[0-9]*$/; //regex pro čísla
                var _chip; //{ChipModel} Obecná obálka chipu
                var _scope;
                var _chips; //{ChipModel} seznam všech nahraných chipů v aplikaci
                var _simulatedChip; //{SimulatedChipModel} simulovatelný chip

                return {
                    compile: compile,
                    setChipsArray: setChipsArray
                };

                /**
                 * @param {Array} chipss pole všech chipů v aplikaci
                 */
                function setChipsArray(chipss) {
                    _chips = chipss;
                }

                /**
                 * Zkompiluje celý obvod a případné chybové hlášky vloží přímo do daného pole
                 * @param {ChipModel} chipp object představující chip a obsahující text HDL v surové podobě
                 * @param {Scope} scopee
                 */
                function compile(chipp, scopee) {
                    _currentRow = 0;
                    _currentTokenOnRow = 0;
                    _chip = chipp;
                    PinModel.restartColors();
                    _simulatedChip = new SimulatedChipModel();
                    _tokens = ParserService.parsePlainTextToRowsOfTokens(_chip.getPlainText());
                    _chip.setTokens(_tokens);
                    _scope = scopee;
                    if (_compileHeader() && _compileInputs() && _compileOutputs() && _compileParts() && _simulatedChip.makeChipParts(_chip)) {
                        _chip.setSimulatedChip(_simulatedChip);
                        _chip.clearCompileError();
                        return;
                    }
                    if (!_chip.compileError) {
                        _chip.setCompileError(_currentRow + 1, _curToken.getErrorMes());
                    }
                }

                /**
                 * Zjistí, zda není v aplikaci již nahraný jiný chip se stejným názvem.
                 * @param {String} chipName název právě vytvářeného chipu
                 * @returns {Boolean} true pokud je chip unikátní
                 */
                function isChipUnique(chipName) {
                    var foundedChips = _chips.filter(function (chip) {
                        return chip.getName() === chipName;
                    });
                    if (foundedChips.length > 0) {
                        var errMes = 'Chip with that name is not unique';
                        _curToken.setErrorMes(errMes);
                        _chip.setCompileError(_currentRow + 1, errMes);
                        return false;
                    }
                    return true;
                }

                /**
                 * Zkompiluje hlavičku obvodu
                 * @return {boolean} false pokud nastala chyba při kompilaci
                 */
                function _compileHeader() {
                    _curToken = _tokens[0][0];
                    if (_curToken.getContent() !== 'CHIP') {
                        _next();
                    }
                    if (!expectKeyword('CHIP')) {
                        return false;
                    }
                    _next();
                    var chipName;
                    if (!(chipName = expectChipName())) {
                        return false;
                    }
                    if (!isChipUnique(chipName)) {
                        return false;
                    }
                    _chip.setName(chipName);
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
                    if (!expectKeyword('IN')) {
                        return false;
                    }
                    _next();
                    if (!expectInputOutputPin(1)) {
                        return false;
                    }
                    while (_curToken.getContent() === ',') {
                        _next();
                        if (!expectInputOutputPin(1)) {
                            return false;
                        }
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
                    if (!expectKeyword('OUT')) {
                        return false;
                    }
                    _next();
                    if (!expectInputOutputPin(2)) {
                        return false;
                    }
                    while (_curToken.getContent() === ',') {
                        _next();
                        if (!expectInputOutputPin(2)) {
                            return false;
                        }
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
                    while (_curToken.getContent() !== '}') {
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
                    var partName;
                    if (!(partName = expectChipName())) {
                        return false;
                    }
                    var part = _simulatedChip.addPart(partName, _curToken, _currentRow);
                    _next();
                    if (!expectChar('(')) {
                        return false;
                    }
                    _next();
                    if (!expectPinAssignment(part)) {
                        return false;
                    }
                    while (_curToken.getContent() === ',') {
                        _next();
                        if (!expectPinAssignment(part)) {
                            return false;
                        }
                    }
                    if (!expectChar(')')) {
                        return false;
                    }
                    _next();
                    if (!expectChar(';')) {
                        return false;
                    }
                    return true;
                }

                /**
                 * Zkontroluje, zda následující sekvence tokenů představuje přiřazení pinů.
                 * Pokud ne, tak uloží do tokenu chybovou hlášku.
                 * @param {ChipPartModel} part definice chipu
                 * @return {boolean} false pokud nastala chyba při kompilaci
                 */
                function expectPinAssignment(part) {
                    var pinNameLeft;
                    var pinRight;
                    var leftToken = _curToken;
                    if (!(pinNameLeft = expectPinName())) {
                        return false;
                    }
                    _next();
                    if (!expectChar('=')) {
                        return false;
                    }
                    _next();
                    var rightToken = _curToken;
                    if (!(pinRight = expectInternalPin())) {
                        return false;
                    }
                    if (!part.addPin(pinNameLeft, pinRight, leftToken, rightToken, pinRight.getBitsAssigned())) {
                        leftToken.setErrorMes('"' + pinNameLeft + '" pin occurs again');
                        return false;
                    }
                    return true;
                }

                /**
                 * Zkontroluje, zda je v následujících tokenech validní deklarace pinu a pokud ne, tak uloží do tokenu chybovou hlášku.
                 * @param {int} type indikátor, zda se jedná o vstup = 1, výstup = 2
                 * @returns {string/boolean} false pokud nastala chyba při kompilaci, jinak pin
                 */
                function expectInputOutputPin(type) {
                    var pinName;
                    if (!(pinName = expectPinName())) {
                        return false;
                    }
                    var tokenOfPin = _curToken;
                    var pinBitSize = 1;
                    _next();
                    if (_curToken.getContent() === '[') {
                        _next();
                        if (!_numberRegex.test(_curToken.getContent())) {
                            _curToken.setErrorMes('Expected number but found "' + _curToken.getContent() + '"');
                            return false;
                        }
                        pinBitSize = _curToken.getContent();
                        _next();
                        if (!expectChar(']')) {
                            return false;
                        }
                        _next();
                    }
                    var pin = new PinModel(pinName, pinBitSize, null, type);
                    var internalPin = _simulatedChip.addPin(pin);
                    tokenOfPin.setPin(internalPin);
                    return pin;
                }

                /**
                 * Zkontroluje, zda je v následujících tokenech validní přiřazení interního pinu a pokud ne, tak uloží do tokenu chybovou hlášku.
                 * @returns {string/boolean} false pokud nastala chyba při kompilaci, jinak pin
                 */
                function expectInternalPin() {
                    var pinName;
                    if (!(pinName = expectPinName())) {
                        return false;
                    }
                    var tokenOfPin = _curToken;
                    var pinBitSize = 1;
                    var bitsAssigned = [];
                    _next();
                    if (_curToken.getContent() === '[') {
                        _next();
                        if (!_numberRegex.test(_curToken.getContent())) {
                            _curToken.setErrorMes('Expected number but found "' + _curToken.getContent() + '"');
                            return false;
                        }
                        bitsAssigned.push(_curToken.getContent());
                        _next();
                        if (!expectChar(']')) {
                            return false;
                        }
                        _next();
                    } else {
                        bitsAssigned.push(0);
                    }
                    var pin = new PinModel(pinName, pinBitSize, bitsAssigned);
                    var internalPin = _simulatedChip.addPin(pin);
                    tokenOfPin.setPin(internalPin);
                    internalPin.setBitsAssigned(bitsAssigned);
                    return internalPin;
                }

                /**
                 * Zkontroluje, zda je v současném tokenu validní jméno pinu a pokud ne, tak uloží do tokenu chybovou hlášku.
                 * @return {string/boolean} false pokud nastala chyba při kompilaci, jinak název pinu
                 */
                function expectPinName() {
                    if (!_nameRegex.test(_curToken.getContent())) {
                        _curToken.setErrorMes('Expected chip pin name. And chip pin name must start with letter and can containt just letters or digits. But found "' + _curToken.getContent() + '"');
                        return false;
                    } else {
                        return _curToken.getContent();
                    }
                }

                /**
                 * Zkontroluje, zda je v současném tokenu validní jméno chipu a pokud ne, tak uloží do tokenu chybovou hlášku.
                 * @return {string/boolean} false pokud nastala chyba při kompilaci, jinak název obvodu
                 */
                function expectChipName() {
                    if (!_nameRegex.test(_curToken.getContent())) {
                        _curToken.setErrorMes('Expected chip name. And chip name must start with letter and can containt just letters or digits. But found "' + _curToken.getContent() + '"');
                        return false;
                    } else {
                        return _curToken.getContent();
                    }
                }

                /**
                 * Zkontroluje, zda je v současném tokenu daný znak a pokud ne, tak uloží do tokenu chybovou hlášku.
                 * @param {string} char znak
                 * @return {boolean} false pokud nastala chyba při kompilaci
                 */
                function expectChar(char) {
                    if (_curToken.getContent() !== char) {
                        _curToken.setErrorMes('Expected "' + char + '" but found "' + _curToken.getContent() + '"');
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
                    if (_curToken.getContent() !== keyword) {
                        _curToken.setErrorMes('Expected "' + keyword + '" but found "' + _curToken.getContent() + '"');
                        return false;
                    }
                    return true;
                }

                /**
                 * Přeskočí všechny bílé znaky, komentáře a do současného tokenu uloží první opravdový token, který najde
                 */
                function _next() {
                    if (_currentTokenOnRow < _tokens[_currentRow].length) {
                        _currentTokenOnRow++;
                    } else {
                        _currentRow++;
                        _calcProgress();
                        _currentTokenOnRow = 0;
                    }

                    for (_currentRow; _currentRow < _tokens.length; _currentRow++) {
                        _calcProgress();
                        for (_currentTokenOnRow; _currentTokenOnRow < _tokens[_currentRow].length; _currentTokenOnRow++) {
                            _curToken = _tokens[_currentRow][_currentTokenOnRow];
                            if (!_notTokenRegex.test(_curToken.getContent())) {
                                return;
                            }
                        }
                        _currentTokenOnRow = 0;
                    }
                }

                /**
                 * Vypočítání compilačního postupu v procentech
                 */
                function _calcProgress() {
                    _chip.setProgress(_currentRow / (_tokens.length / 100));
                    if (_scope) {
                        if (!_scope.$$phase) {
                            _scope.$apply();
                        }
                    }
                }
            }]);
