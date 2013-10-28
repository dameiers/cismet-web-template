function SignInController ($scope, $location, logInService) {
    $scope.loginText = "Sign in";
    $scope.logInService = logInService;
    $scope.roles = logInService.getRoles();
    $scope.login = function () {
        var username = $scope.username;
        var password = $scope.password;
        var rememberMe = logInService.rememberMe;
        if (logInService.isLoggedIn()) {
            //we are already logged in and the login button is pressed again so we want to logout
            logInService.logout();
            $scope.loginText = "Sign in";
        } else {
            var promise = logInService.login(username, password, rememberMe);
            var successCallback = function () {
                $scope.loginText = "Sign out";
                $location.path("/main");
            };
            var errorCallback = function () {
            };
            promise.then(successCallback, errorCallback, null);
        }

    };
}
;

function MainController ($scope) {
    $scope.leafNodes = {};
    (function () {
        var options = {
        };
        ci.getAllObjectsOfClass("crisma", "persons", options).then(function (data) {
            var nodes = data.data.$collection;
            var leafNodes = [];
            var i, currNode;
            for (i = 0; i < nodes.length; i++) {
                currNode = nodes[i];
//                if (currNode.childworldstates.length === 0) {
                    leafNodes.push(currNode);
//                }
            }
//            $scope.$apply(function () {
                $scope.leafNodes = leafNodes;
//            });
        });
    })();
    $scope.getNodeText = function (node) {
        return node.name;
    };
}
;
