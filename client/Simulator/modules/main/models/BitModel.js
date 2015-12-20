/* global angular */

'use strict';

angular.module('app')

        /**
         * Představuje jeden bit na pinu
         */
        .factory('BitModel', [function () {
                
                var Bit = function () {
                    this.value = 0;
                    this.callbacks = [];
                };

                return Bit;
            }]);