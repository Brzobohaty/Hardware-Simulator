/* global angular */

'use strict';

angular.module('app')

        .config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function ($stateProvider, $urlRouterProvider, $httpProvider) {
                //přesměrování na simulátor při adrese "/"
                $urlRouterProvider.when("", ['$state', '$match', function ($state, $match) {
                        $state.go('main.simulator');
                    }]);
                $urlRouterProvider.when("/", ['$state', '$match', function ($state, $match) {
                        $state.go('main.simulator');
                    }]);

                $urlRouterProvider.otherwise('/404');

                $stateProvider
                        .state("otherwise", {
                            url: '/404',
                            templateUrl: "/Simulator/modules/main/views/404.html",
                            controller: '404Controller',
                            data: {authenticate: false}
                        })
                        .state('main', {
                            templateUrl: "/Simulator/modules/main/views/main.html",
                            controller: 'MainController',
                            data: {authenticate: false}
                        });

                /**
                 * Při každém HTTP requestu tohle podstrčí do hlavičky token uživatele
                 */
                $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function ($q, $location, $localStorage) {
                        return {
                            'request': function (config) {
                                config.headers = config.headers || {};
                                if ($localStorage.token) {
                                    config.headers.Authorization = 'Bearer ' + $localStorage.token;
                                }
                                return config;
                            },
                            'responseError': function (response) {
                                if (response.status === 401 || response.status === 403) {
                                    $location.path('/login');
                                }
                                return $q.reject(response);
                            }
                        };
                    }]);
            }])

        .run(['$rootScope', '$location', 'AuthenticationService', '$state', function ($rootScope, $location, AuthenticationService, $state) {
                //$rootScope.serverURL = "http://private-16e96f-forum6.apiary-mock.com";
                $rootScope.serverURL = "rest-api";

                /**
                 * Přehození na login, pokud stránka vyžaduje autentizaci a uživatel není přihlášen.
                 */
                $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                    if (toState.data.authenticate && !AuthenticationService.isLoggedIn()) {
                        event.preventDefault();
                        try {
                            $state.transitionTo('main.login');
                            $state.reload();
                        }
                        catch (err) {
                            $location.path('/login');
                        }
                    }
                });
            }]);