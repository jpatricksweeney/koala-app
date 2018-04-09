myApp.controller('ContactController', ['$scope', '$rootScope', '$firebaseObject', '$sce'
    , function ($scope, $rootScope, $firebaseObject, $sce) {
        console.log('in contact controller!');
        
        cref = firebase.database().ref('/company');
        var obj = $firebaseObject(cref);
        $scope.company = obj;
        
        obj.$loaded(function(){
            // Sanitize 
            $scope.company.googlemapiframe = $sce.trustAsResourceUrl($scope.company.googlemapiframe);
        });

}]); // Controller