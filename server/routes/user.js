var express = require('express');
var router = express.Router();
var User = require('../model-schema/User.js');
var jwt = require("jsonwebtoken");
var config = require("../config.js");
var authentication = require("../services/authentication.js");

/**
 * Login uživatele
 * Princip autentikace uživatele
 * http://code.tutsplus.com/tutorials/token-based-authentication-with-angularjs-nodejs--cms-22543
 */
router.post('/login', function (req, res) {
    User.findOne({username: req.body.email, password: req.body.password}, function (err, user) {
        if (err) {
            res.status(500);
            res.json({
                errorMessage: 'Omlouváme se, ale nastala neočekávaná chyba.'
            });
        } else {
            if (user) {
                res.status(200);
                res.json({
                    data: user,
                    token: user.token
                });
            } else {
                res.status(401);
                res.json({
                    errorMessage: 'Nesprávné přihlašovací údaje.'
                });
            }
        }
    });
});

/**
 * Registrace uživatele
 */
router.post('/', function (req, res) {
    User.findOne({username: req.body.email}, function (err, user) {
        if (err) {
            res.status(500);
            res.json({
                errorMessage: 'Omlouváme se, ale nastala neočekávaná chyba.'
            });
        } else {
            if (user) {
                res.status(409);
                res.json({
                    errorMessage: 'Uživatel se stejným emailem je již zaregistrován.'
                });
            } else {
                var userModel = new User();
                userModel.username = req.body.email;
                userModel.password = req.body.password;
                userModel.firstname = req.body.firstname;
                userModel.surname = req.body.surname;
                userModel.save(function (err, user) {
                    user.token = jwt.sign(user, config.JWT_SECRET);
                    user.save(function (err, user1) {
                        res.status(201);
                        res.send(user1);
                    });
                });
            }
        }
    });
});

/**
 * Vrátí přihlášeného usera
 * Zatím je id ignorováno a je vyhledáván uživatel přímo podle tokenu přihlášeného uživatele.
 */
router.get('/:id', authentication.ensureAuthorized, function (req, res) {
    User.findOne({token: req.token}, function (err, user) {
        if (err) {
            res.status(500);
            res.json({
                errorMessage: 'Omlouváme se, ale nastala neočekávaná chyba.'
            });
        } else {
            res.status(200);
            res.send(user);
        }
    });
});

module.exports = router;
