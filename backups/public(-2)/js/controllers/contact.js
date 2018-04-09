myApp.controller('ContactController', ['$scope', '$rootScope', '$firebaseObject', '$sce'
    , function ($scope, $rootScope, $firebaseObject, $sce) {
        console.log('in contact controller!');
        
        cref = firebase.database().ref('/company');
        var obj = $firebaseObject(cref);
        $scope.company = obj;
        
        obj.$loaded(function(){
            console.log($scope.company);
            
            // Sanitize 
            $scope.company.googlemapiframe = $sce.trustAsResourceUrl($scope.company.googlemapiframe);
            
            //$('#in-touch a').css({'color': '#' + $scope.company.highlightcolor});
            //$('#return-to-top').css({'background': '#' + $scope.company.highlightcolor});
            //$scope.highlightColor = {'color': '#' + $scope.company.highlightcolor};
            //$('.header-style').css($scope.highlightColor);
        });

}]); // Controller