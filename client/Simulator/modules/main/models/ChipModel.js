/* global angular */

'use strict';

angular.module('app')

        /**
         * Představuje object celého chipu
         */
        .factory('ChipModel', ['CompilerService', function (CompilerService) {
                /**
                 * Object představující jeden chip
                 * @param {String} fileName název souboru
                 * @param {String} plainText čistý text přečtený ze souboru
                 */
                var Chip = function (fileName, plainText) {
                    this.fileName = fileName;
                    this.plainText = plainText;
                };
                Chip.prototype = {
                    
                    /**
                     * Recomilace obvodu
                     */
                    recompile: function (scope) {
                        CompilerService.compile(this, scope);
                        if(!scope.$$phase) {
                            scope.$apply();
                        }
                    }
                };

                return Chip;
            }]);