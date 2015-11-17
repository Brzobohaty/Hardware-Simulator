'use strict';

angular.module('app.simulator')

        /**
         * Filter, který při iterování přes prázdné pole bude vytvářet posloupnost čísel od 1 do x
         */
        .filter('range', function () {
            return function (input, total) {
                total = parseInt(total);
                for (var i = 1; i <= total; i++)
                    input.push(i);
                return input;
            };
        });