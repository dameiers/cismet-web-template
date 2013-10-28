var serviceModule = angular.module('myApp.services', ['ngCookies']);

var logInService = function ($q, $location, $cookieStore, $http) {
    var isLoggedIn = false;
    var password;
                var arr = new Array();
    arr.push("user1");
    arr.push("user2");
    arr.push("user3");
    var loginServiceObj = {
        rememberMe: false,
        username: 'foo',
        getRoles:function(){
            return arr;
        },
        setLoggedIn: function (flag) {
            isLoggedIn = flag;
        },
        isLoggedIn: function () {
            return isLoggedIn;
        },
        canAutoLogIn: function () {
            var authString = $cookieStore.get('authString');
            if (authString) {
                loginServiceObj.rememberMe = true;
                return true;
            }
            return false;
        },
        autoLogin: function () {
            var authString = $cookieStore.get('authString');
            loginServiceObj.username = $cookieStore.get('username');
            if (authString) {
                var deferred = $q.defer();
                ci.getBackend().setDefaultAuthenticationString(authString);
                var promise = ci.validateUser();
                promise.then(function (data) {
                    if (data.status >= 200 && data.status < 300) {
                        loginServiceObj.setLoggedIn(true);
//                        $location.ulr("/main");
                    }
                    deferred.resolve();
                }, function (data) {
                    $location.url("/");
                    deferred.reject();
                });
                return deferred.promise;
            }
        },
        login: function (user, pw, rememberMe) {
            loginServiceObj.username = user+'@'+loginServiceObj.domain;
            password = pw;
            var deferred = $q.defer();
            var authString = btoa(loginServiceObj.username + ":" + password);
            if (rememberMe) {
                $cookieStore.put('authString', authString);
                $cookieStore.put('username', loginServiceObj.username);
            }
            ci.getBackend().setDefaultAuthenticationString(authString);
            var promise = ci.validateUser();
            promise.then(function (data) {
//                if (data.status >= 200 && data.status < 300) {
                    loginServiceObj.setLoggedIn(true);
//                }
                deferred.resolve();
            }, function (data) {
                $location.url("/");
                deferred.reject();
            });
            return deferred.promise;
        },
        logout: function () {
            password = null;
            loginServiceObj.username = null;
            $cookieStore.remove('authString');
            $cookieStore.remove('username');
            ci.getBackend().setDefaultAuthentication(null, null);
            loginServiceObj.setLoggedIn(false);
            $location.url("/");
        }
    };
    var promise = $http.get('../app/assets/defaultDomain.json');
    promise.success(function (data) {
        loginServiceObj.domain = data.defaultDomain;
    });
    return loginServiceObj;
};

serviceModule.factory('logInService', function ($q, $location, $cookieStore, $http) {
    return logInService($q, $location, $cookieStore, $http);
});
