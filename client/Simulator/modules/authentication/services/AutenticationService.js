/* global angular */

'use strict';

angular.module('app.authentication')

        /**
         * Přihlášení uživatele a držení informace o přihlášeném uživateli
         * http://mherman.org/blog/2015/07/02/handling-user-authentication-with-the-mean-stack/#.VjOFNR_PikA
         */
        .factory('AuthenticationService', ['$http', '$rootScope', '$localStorage', function ($http, $rootScope, $localStorage) {
                return {
                    login: login,
                    logout: logout,
                    isLoggedIn: isLoggedIn
                };

                /**
                 * Přihlášení uživatele
                 * @param {JSON} data email a heslo uživatele
                 */
                function login(data) {
                    return $http.post($rootScope.serverURL + '/user/login', data).then(_saveToken);
                }

                /**
                 * Odhlášení uživatele
                 */
                function logout() {
                    //TODO musí se zde vymazat současný user
                    delete $localStorage.token;
                }

                /**
                 * @returns {Boolean} vrací true pokud je uživatel přihlášen
                 */
                function isLoggedIn() {
                    if ($localStorage.token) {
                        return true;
                    } else {
                        return false;
                    }
                }

                /**
                 * Uloží token ze serveru do lokálního uložiště uživatele.
                 */
                function _saveToken(response) {
                    $localStorage.token = response.data.token;
                }
            }]);