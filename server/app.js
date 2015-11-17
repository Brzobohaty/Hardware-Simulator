var express = require('express');
var config = require('./config.js');
var app = express();
var fs = require('fs');
var wrench = require('wrench');

config.connectToDB(app);
config.setUpViewEngine(app);
config.setUpMiddleWare(app);

//import routovacích souborů
var user = require('./routes/user');

// routování
app.use('/rest-api/user/', user);

// run Simulator app
app.get('/', function (req, res) {
    var indexFile = buildIndexWithAngularModules('Simulator');
    res.send(indexFile); // load the single view file (angular will handle the page changes on the front-end)
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;

function buildIndexWithAngularModules(appName) {

    var indexFilePath = 'client/' + appName + '/index.html';
    var indexContent = fs.readFileSync(indexFilePath, 'utf8');

    var structureScan = wrench.readdirSyncRecursive('client/' + appName + '/modules');
    var shallow = [];
    for (var i = 0; i < structureScan.length; i++) {
        var regexp = /^[a-zA-Z0-9_-]+$/;
        if (regexp.test(structureScan[i])) {
            shallow.push(structureScan[i]);
        }
    }

    var includeString = '\n\r';
    for (var i = 0; i < shallow.length; i++) {
        includeString += buildModuleIncludeString('client/' + appName + '/modules/' + shallow[i], shallow[i], appName);
        includeString += '\n\r';
    }

    return indexContent.replace("{{angularFiles}}", includeString);
}

function buildModuleIncludeString(modulePath, moduleName, appName) {
    var includeModuleFolderNames = ["controllers", "directives", "models", "services", "filters"];
    var includeString = "", includeFiles, i, j;
    includeString += "\t<!-- Module " + moduleName + " -->\n\r";
    includeString += '\t<script src="/' + appName + '/modules/' + moduleName + '/' + moduleName + '.js"></script>\n\r';
    for (i = 0; i < includeModuleFolderNames.length; i++) {
        try {
            includeFiles = wrench.readdirSyncRecursive(modulePath + '/' + includeModuleFolderNames[i]);
            for (j = 0; j < includeFiles.length; j++) {
                includeString += '\t<script src="/' + appName + '/modules/' + moduleName + '/' + includeModuleFolderNames[i] + '/' + includeFiles[j] + '"></script>\n\r';
            }
        } catch (e) {

        }
    }
    return includeString;
}