myApp.controller('FooterController', ['$scope', '$rootScope', '$firebaseAuth', '$firebaseArray', '$firebaseObject', 'Authentication'
    , function ($scope, $rootScope, $firebaseAuth, $firebaseArray, $firebaseObject, Authentication) {
        console.log('in footer controller!');
        
        /* Get company info */
        cref = firebase.database().ref('/company');
        var obj = $firebaseObject(cref);
        $scope.company = obj;
        
        obj.$loaded(function () {
            console.log('company data loaded');

            $scope.company.myfooterpics = [];
            if( typeof $scope.company.footerpics !== 'undefined' ) {
                Object.keys($scope.company.footerpics).forEach(function (key) {
                    oneobj = {
                        url: $scope.company.footerpics[key].url
                    };
                    $scope.company.myfooterpics.push(oneobj);
                });
                
            };
            
            var numimages = $scope.company.myfooterpics.length;
            if(numimages > 0) {
                x = (Math.floor(Math.random() * numimages));
                randomimage = ($scope.company.myfooterpics[x].url);
                $("#myfooter").attr('style', 'background-image: url(' + randomimage + ')');
            };
        });        
        
        $scope.logout = function () {
            console.log('in logout!');
            Authentication.logout();
            alert('Logout successful.');
        }
        
}]); // Controller