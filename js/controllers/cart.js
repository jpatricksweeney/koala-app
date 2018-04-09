myApp.controller('MycartController', ['$scope', '$rootScope', '$firebaseObject'
    , function ($scope, $rootScope, $firebaseObject) {
        console.log('in cart controller!');
        
        /* Get company info */
        cref = firebase.database().ref('/company');
        var obj = $firebaseObject(cref);
        $scope.company = obj;

}]); // Controller