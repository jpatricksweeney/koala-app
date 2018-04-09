myApp.controller('NavController', ['$scope', '$rootScope', 'Authentication', '$firebaseObject', '$location',
  function ($scope, $rootScope, Authentication, $firebaseObject, $location) {
      
        /* Get Company info */
        cref = firebase.database().ref('/company');
        var obj = $firebaseObject(cref);
        $scope.company = obj;
        obj.$bindTo($scope, "company");
        obj.$loaded(function () {
            if( typeof $scope.company.menuhome === 'undefined' || $scope.company.menuhome === '' ) {
                $scope.company.menuhome = 'Home';
            }
            if( typeof $scope.company.menuservices === 'undefined' || $scope.company.menuservices === '' ) {
                $scope.company.menuservices = 'Services';
            }
            if( typeof $scope.company.menuspecialists === 'undefined' || $scope.company.menuspecialists === '' ) {
                $scope.company.menuspecialists = 'Specialists';
            }
            if( typeof $scope.company.menucontact === 'undefined' || $scope.company.menucontact === '' ) {
                $scope.company.menucontact = 'Contact';
            }
            if( typeof $scope.company.menuaccount === 'undefined' || $scope.company.menuaccount === '' ) {
                $scope.company.menuaccount = 'Account';
            }
            if( typeof $scope.company.menuprofile === 'undefined' || $scope.company.menuprofile === '' ) {
                $scope.company.menuprofile = 'Profile';
            }
            if( typeof $scope.company.menuadmin === 'undefined' || $scope.company.menuadmin === '' ) {
                $scope.company.menuadmin = 'Administrator';
            }
            if( typeof $scope.company.menulogin === 'undefined' || $scope.company.menulogin === '' ) {
                $scope.company.menulogin = 'Login';
            }
            if( typeof $scope.company.menulogout === 'undefined' || $scope.company.menulogout === '' ) {
                $scope.company.menulogout = 'Logout';
            }
   
            $("[id^=nav-section] ul a").hover(function(){
                    $(this).css("color", '#' + $scope.company.highlightcolor);
                }, function(){
                    $(this).css("color", "#fff");
            });
            
            if( $scope.company.navbarcolor ) {
                $("#main-nav").css({'background-color': '#' + $scope.company.navbarcolor});
            } else {
                $("#main-nav").css({'background-color': '#000'});
            }
        });
      
        $scope.logout = function () {
            console.log('logout');
            Authentication.logout();
        }
        
        $('.navbar-nav>li>a').on('click', function(){
            $('.navbar-collapse').collapse('hide');
        });      
        
}]); // Controller