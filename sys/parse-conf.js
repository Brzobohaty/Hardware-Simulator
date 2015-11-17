var fs = require("fs");

module.exports = function (filepath) {
    var i, content, regex, result = {};

    regex = /^([^#\s]{1}\S+)\s+(\S+)$/gm;

    function replacer(match, p1, p2) {
        result[p1] = p2;
        return [p1, p2];
    }

    content = fs.readFileSync(filepath, 'utf8');

    content.replace(regex, replacer);

    return result;
};