var path = require('path');
var parseConf = require("../sys/parse-conf");

/**
 * Připojení k databázi
 */
function connectToDB() {
    var mongoose = require('mongoose');

    var configData = parseConf("custom-config.conf");
    var connectionString;
    if (configData["mongoDB-user"] && configData["mongoDB-pass"]) {
        connectionString = 'mongodb://' + configData["mongoDB-user"] + ':' + configData["mongoDB-pass"] + '@' + configData["mongoDB-host"] + ':' + configData["mongoDB-port"] + '/' + configData["mongoDB-db"];
    } else {
        connectionString = 'mongodb://' + configData["mongoDB-host"] + ':' + configData["mongoDB-port"] + '/' + configData["mongoDB-db"];
    }

    mongoose.connect(connectionString, function (err) {
        if (err) {
            console.log('connection error', err);
        } else {
            console.log('connection successful');
        }
    });
}

/**
 * Nastavení view enginu 
 */
function setUpViewEngine(app) {
    // view engine setup
    app.set('view engine', 'jade');
    app.set('views', path.join(__dirname, 'views'));
}

/**
 * Nastavení middleware component
 */
function setUpMiddleWare(app) {
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');
    var express = require('express');
    var favicon = require('serve-favicon');
    var logger = require('morgan');

    // uncomment after placing your favicon in /public
    //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, '/../client')));

    //Nastavení zabezpečení pro API
    app.use(function (req, res, next) {
        //Dovoluje přístup z jakékoli domény k API
        res.setHeader('Access-Control-Allow-Origin', '*');
        //Je možné posílat pouze POST, GET, PUT, DELETE requesty
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST', 'PUT', 'DELETE');
        //X-Requested-With a content-type hlavičky jsou povoleny
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
        next();
    });
}

module.exports = {
    //klíč serveru k vytvoření unikátního tokenu pro každého uživatele
    JWT_SECRET: 'ba51d54wq4d54wqdas4d5sa4d',
    connectToDB: connectToDB,
    setUpViewEngine: setUpViewEngine,
    setUpMiddleWare: setUpMiddleWare
};