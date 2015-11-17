/* global angular */

'use strict';

angular.module('app.authentication', []);
angular.module('app.simulator', []);
angular.module('app.editor', []);
angular.module('app.project', []);

angular.module('app', [
    'ui.router',
    'app.authentication',
    'app.simulator',
    'app.editor',
    'app.project',
    'ngStorage',
    'ngResource',
    'ui.bootstrap',
    'toaster',
    'ngAnimate',
    'angular-loading-bar'
]);


