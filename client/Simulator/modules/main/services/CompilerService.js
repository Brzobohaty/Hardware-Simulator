/* global angular */

'use strict';

angular.module('app')

        /**
         * Kompilátor HDL
         */
        .factory('CompilerService', ['ParserService', 'ChipSimulationService', 'PinModel', function (ParserService, ChipSimulationService, PinModel) {
                var tokens; //dvourozměrné pole řádků a tokenů
                var curToken; //současný token
                var currentRow = 0; //současné číslo řádek
                var currentTokenOnRow = 0; //současné pořadí tokenu na řádku
                var notTokenRegex = /^<span class=.*<\/span>$|\s+|\n/; //regex pro komentáře a bílé znaky
                var nameRegex = /^[A-Za-z][A-Za-z0-9]*$/; //regex pro názvy chipů a pinů
                var numberRegex = /^[0-9]*$/; //regex pro čísla
                var partId = 0; //čítač id částí obvodu
                var chip; //Obecná obálka chipu
                var scope;
                var chips; //seznam všech nahraných chipů v apliakci

                return {
                    compile: compile,
                    setChipsArray: setChipsArray
                };

                /**
                 * @param {Array} chipss pole všech chipů v aplikaci
                 */
                function setChipsArray(chipss) {
                    chips = chipss;
                }

                /**
                 * Zkompiluje celý obvod a případné chybové hlášky vloží přímo do daného pole
                 * @param {Object} chipp object představující chip a obsahující text HDL v surové podobě
                 */
                function compile(chipp, scopee) {
                    currentRow = 0;
                    currentTokenOnRow = 0;
                    partId = 0;
                    chip = chipp;
                    PinModel.restartColors();
                    chip.compileError = null;
                    chip.parts = null;
                    chip.progress = null;
                    chip.simulatedChip = null;
                    chip.name = null;
                    ChipSimulationService.reset();
                    tokens = ParserService.parsePlainTextToRowsOfTokens(chip.plainText);
                    chip.tokens = tokens;
                    scope = scopee;
                    if (_compileHeader() && _compileInputs() && _compileOutputs() && _compileParts() && _setParts()) {
                        chip.simulatedChip = ChipSimulationService.getSimulatedChip();
                        chip.compileError = false;
                        return;
                    }
                    if (!chip.compileError) {
                        chip.compileError = {'row': currentRow + 1, 'message': curToken.getErrorMes()};
                    }
                }

                /**
                 * Vytvoří části obvodu tvořené jinými čipy a přiřadí jim správné piny 
                 * @return {Boolean} false pokud nastala chyba při kompilaci
                 */
                function _setParts() {
                    for (var i = 0; i < ChipSimulationService.getSimulatedChip().parts.length; i++) {
                        if (!ChipSimulationService.addChipPart(ChipSimulationService.getSimulatedChip().parts[i], chip)) {
                            return false;
                        }
                    }
                    return true;
                }

                /**
                 * Naplní dané speciální pole a pole interních pinů daným pinem.
                 * @param {Object} tokenOfPin token pinu
                 * @param {Array} specialArray pole do kterého se má vložit pin kromě pole pro interní piny (může být null)
                 * @param {PinModel} pin
                 */
                function _pushPinToArrays(tokenOfPin, specialArray, pin) {
                    if (specialArray) {
                        specialArray.push(pin);
                        pin.setInOut();
                    }
                    ChipSimulationService.getSimulatedChip().addInternalPin(pin,tokenOfPin);
                }

                /**
                 * Zjistí, zda není v aplikaci již nahraný jiný chip se stejným názvem.
                 * @param {String} chipName název právě vytvářeného chipu
                 * @returns {Boolean} true pokud je chip unikátní
                 */
                function isChipUnique(chipName) {
                    if (_.findWhere(chips, {name: chipName})) {
                        var errMes = 'Chip with that name is not unique';
                        curToken.setErrorMes(errMes); 
                        chip.compileError = {'row': currentRow + 1, 'message': errMes};
                        return false;
                    }
                    return true;
                }

                /**
                 * Zkompiluje hlavičku obvodu
                 * @return {boolean} false pokud nastala chyba při kompilaci
                 */
                function _compileHeader() {
                    curToken = tokens[0][0];
                    if (curToken.getContent() !== 'CHIP') {
                        _next();
                    }
                    if (!expectKeyword('CHIP')) {
                        return false;
                    }
                    _next();
                    if (!(ChipSimulationService.getSimulatedChip().name = expectChipName())) {
                        return false;
                    }
                    if (!isChipUnique(ChipSimulationService.getSimulatedChip().name)) {
                        return false;
                    }
                    chip.name = ChipSimulationService.getSimulatedChip().name;
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
                    if (!expectInputOutputPin(ChipSimulationService.getSimulatedChip().inputs)) {
                        return false;
                    }
                    while (curToken.getContent() === ',') {
                        _next();
                        if (!expectInputOutputPin(ChipSimulationService.getSimulatedChip().inputs)) {
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
                    if (!expectInputOutputPin(ChipSimulationService.getSimulatedChip().outputs)) {
                        return false;
                    }
                    while (curToken.getContent() === ',') {
                        _next();
                        if (!expectInputOutputPin(ChipSimulationService.getSimulatedChip().outputs)) {
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
                    while (curToken.getContent() !== '}') {
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
                                'id': ++partId,
                                'name': '',
                                'pins': {},
                                'nameToken': curToken,
                                'row': currentRow
                            };
                    curToken.partId = partId;
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
                    while (curToken.getContent() === ',') {
                        _next();
                        if (!expectPinAssignment(chip)) {
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
                    ChipSimulationService.getSimulatedChip().parts.push(chip);
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
                    var pinRight;
                    var leftToken = curToken;
                    if (!(pinNameLeft = expectPinName())) {
                        return false;
                    }
                    if (chip.pins.hasOwnProperty(pinNameLeft)) {
                        curToken.setErrorMes('"' + pinNameLeft + '" pin occurs again');
                        return false;
                    }
                    _next();
                    if (!expectChar('=')) {
                        return false;
                    }
                    _next();
                    var rightToken = curToken;
                    if (!(pinRight = expectInternalPin())) {
                        return false;
                    }
                    chip.pins[pinNameLeft] = {
                        'name': pinNameLeft,
                        'assignment': pinRight.getName(),
                        'bitsAssigned': pinRight.bitsAssigned,
                        'leftToken': leftToken,
                        'rightToken': rightToken
                    };
                    return true;
                }
                
                /**
                 * Zkontroluje, zda je v následujících tokenech validní deklarace pinu a pokud ne, tak uloží do tokenu chybovou hlášku.
                 * @param {Array} specialArray pole vstupů nebo výstupů nebo null
                 * @returns {string/boolean} false pokud nastala chyba při kompilaci, jinak pin
                 */
                function expectInputOutputPin(specialArray) {
                    var pinName;
                    if (!(pinName = expectPinName())) {
                        return false;
                    }
                    var tokenOfPin = curToken;
                    var pinBitSize = 1;
                    _next();
                    if (curToken.getContent() === '[') {
                        _next();
                        if (!numberRegex.test(curToken.getContent())) {
                            curToken.setErrorMes('Expected number but found "' + curToken.getContent() + '"');
                            return false;
                        }
                        pinBitSize = curToken.getContent();
                        _next();
                        if (!expectChar(']')) {
                            return false;
                        }
                        _next();
                    }
                    var pin = new PinModel(pinName, pinBitSize);
                    _pushPinToArrays(tokenOfPin, specialArray, pin);
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
                    var tokenOfPin = curToken;
                    var pinBitSize = 1;
                    var bitsAssigned = [];
                    _next();
                    if (curToken.getContent() === '[') {
                        _next();
                        if (!numberRegex.test(curToken.getContent())) {
                            curToken.setErrorMes('Expected number but found "' + curToken.getContent() + '"');
                            return false;
                        }
                        bitsAssigned.push(curToken.getContent());
                        _next();
                        if (!expectChar(']')) {
                            return false;
                        }
                        _next();
                    }else{
                        bitsAssigned.push(0);
                    }
                    var pin = new PinModel(pinName, pinBitSize, bitsAssigned);
                    _pushPinToArrays(tokenOfPin, null, pin);
                    return pin;
                }

                /**
                 * Zkontroluje, zda je v současném tokenu validní jméno pinu a pokud ne, tak uloží do tokenu chybovou hlášku.
                 * @return {string/boolean} false pokud nastala chyba při kompilaci, jinak název pinu
                 */
                function expectPinName() {
                    if (!nameRegex.test(curToken.getContent())) {
                        curToken.setErrorMes('Expected chip pin name. And chip pin name must start with letter and can containt just letters or digits. But found "' + curToken.getContent() + '"');
                        return false;
                    } else {
                        return curToken.getContent();
                    }
                }

                /**
                 * Zkontroluje, zda je v současném tokenu validní jméno chipu a pokud ne, tak uloží do tokenu chybovou hlášku.
                 * @return {string/boolean} false pokud nastala chyba při kompilaci, jinak název obvodu
                 */
                function expectChipName() {
                    if (!nameRegex.test(curToken.getContent())) {
                        curToken.setErrorMes('Expected chip name. And chip name must start with letter and can containt just letters or digits. But found "' + curToken.getContent() + '"');
                        return false;
                    } else {
                        return curToken.getContent();
                    }
                }

                /**
                 * Zkontroluje, zda je v současném tokenu daný znak a pokud ne, tak uloží do tokenu chybovou hlášku.
                 * @param {string} char znak
                 * @return {boolean} false pokud nastala chyba při kompilaci
                 */
                function expectChar(char) {
                    if (curToken.getContent() !== char) {
                        curToken.setErrorMes('Expected "' + char + '" but found "' + curToken.getContent() + '"');
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
                    if (curToken.getContent() !== keyword) {
                        curToken.setErrorMes('Expected "' + keyword + '" but found "' + curToken.getContent() + '"');
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
                        _calcProgress();
                        currentTokenOnRow = 0;
                    }

                    for (currentRow; currentRow < tokens.length; currentRow++) {
                        _calcProgress();
                        for (currentTokenOnRow; currentTokenOnRow < tokens[currentRow].length; currentTokenOnRow++) {
                            curToken = tokens[currentRow][currentTokenOnRow];
                            if (!notTokenRegex.test(curToken.getContent())) {
                                return;
                            }
                        }
                        currentTokenOnRow = 0;
                    }
                }

                /**
                 * Vypočítání compilačního postupu v procentech
                 */
                function _calcProgress() {
                    chip.progress = currentRow / (tokens.length / 100);
                    if (scope) {
                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                    }
                }
            }]);
