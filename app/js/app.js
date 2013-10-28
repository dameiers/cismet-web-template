/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var ciModule = angular.module('cismetApp', ['myApp.services', 'ngRoute']);


ciModule.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.
                when('/main', {templateUrl: 'partials/main.html', controller: MainController, resolve: {loggedin: checkLoggedin}})
    }]);

ciModule.config(function ($httpProvider) {
    $httpProvider.interceptors.push(function ($rootScope, $q) {
        return {
            'response': function (response) {
                return response || $q.when(response);
            },
            'responseError': function (rejection) {
                var deferred;
                if (rejection.status === 401) {
                    //401 => Unauthorized => show the user a log in popup;
                    deferred = $q.defer();
                    $rootScope.$broadcast('event:unauthorized');
                    return deferred.promise;
                } else {
                    return $q.reject(rejection);
                }
            },
            'requestError': function (rejection) {
                var deferred;
                if (rejection.status === 401) {
                    //401 => Unauthorized => show the user a log in popup;
                    deferred = $q.defer();
                    $rootScope.$broadcast('event:unauthorized');
                    return deferred.promise;
                } else {
                    return $q.reject(rejection);
                }
            }
        };
    });
});

ciModule.run(function (logInService, $timeout) {
    if (logInService.canAutoLogIn()) {
        var promise = logInService.autoLogin();
        var succesCallBack = function () {
        };
        var errorCallBack = function () {
//            $location.url("/");
        };
        promise.then(succesCallBack, errorCallBack, null);
    }
    $timeout(function () {
        ci.getBackend().backend.test();
    }, 2000);

});

var checkLoggedin = function ($q, logInService, $location) {
// Initialize a new promise 
    var deferred = $q.defer(); // Make an AJAX call to check if the user is logged in 
    if (logInService.isLoggedIn()) {
        deferred.resolve();
    } else {
        if (logInService.canAutoLogIn()) {
            var promise = logInService.autoLogin();
            var succesCallBack = function () {
                deferred.resolve();
            };
            var errorCallBack = function () {
                deferred.reject();
                $location.url("/");
            };
            promise.then(succesCallBack, errorCallBack, null);
        } else {
            deferred.reject();
            $location.url("/");
        }

    }
    return deferred.promise;
};


ciModule.directive('loginModal', function () {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: 'partials/loginModal.html',
        replace: true,
        link: function (scope, element, attrs) {

            scope.$on('event:unauthorized', function (event) {
                console.log("event unauthorized");
                $('#myModal').modal('show');
            });

            scope.$on('event:authorized', function (event) {
                $('#myModal').modal('hide');
            });

        },
        controller: function ($scope, logInService) {

            $scope.roles = logInService.getRoles();

            $scope.login = function () {
                var username = $scope.username;
                var password = $scope.password;
                var rememberMe = logInService.rememberMe;
                var promise = logInService.login(username, password, rememberMe);
                var successCallback = function () {
//                    window.history.back();
                    $scope.$broadcast('event:authorized');
                };
                var errorCallback = function () {
                };
                promise.then(successCallback, errorCallback, null);
            };
        }
    };
});

ciModule.directive('editComboBox', function () {
    return {
        restrict: 'E',
        require: '^ngModel',
        scope: {
            roles: '=ngModel',
            placeholder: '@',
            username: '=',
            width: '@'
        },
        templateUrl: 'partials/editComboBox.html',
        link: function (scope, element, attrs) {
            scope.inputStyle = {
                width: scope.width
            };
        },
        controller: function ($scope) {
            $scope.setSelectedItem = function (index) {
                $scope.username = $scope.roles[index];
            };
        }
    };
});