/**
 * Ověří, zda je uživatel přihlášen.
 * Jedná se o middleware metodu.
 */
function ensureAuthorized(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.send(403);
    }
}

module.exports = {
    ensureAuthorized : ensureAuthorized
};


