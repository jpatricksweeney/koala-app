myApp.controller('FooterController', ['$scope', '$rootScope', '$firebaseAuth', '$firebaseArray', '$firebaseObject', 'Authentication'
    , function ($scope, $rootScope, $firebaseAuth, $firebaseArray, $firebaseObject, Authentication) {
        console.log('in footer controller!');
        
        /* Get company info */
        cref = firebase.database().ref('/company');
        var obj = $firebaseObject(cref);
        $scope.company = obj;
        
        obj.$loaded(function () {
            console.log('company data loaded');
            
            if( !(typeof $scope.company.facebook === 'undefined') ) {
                $scope.company.facebook = 'https://www.facebook.com/' + $scope.company.facebook;
            }
            if( !(typeof $scope.company.twitter === 'undefined') ) {
                $scope.company.twitter = 'https://www.twitter.com/' + $scope.company.twitter;
            }
            if( !(typeof $scope.company.instagram === 'undefined') ) {
                $scope.company.instagram = 'https://www.instagram.com/' + $scope.company.instagram;
            }
            if( !(typeof $scope.company.google === 'undefined') ) {
                $scope.company.google = 'https://plus.google.com/' + $scope.company.google;
            } 

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
            } else {
                $("#myfooter").attr('style', 'background-color:#' + $scope.company.footercolor + ' !important;');
            }
        });        
        
        $scope.logout = function () {
            console.log('in logout!');
            Authentication.logout();
            alert('Logout successful.');
        }
        
}]); // Controller