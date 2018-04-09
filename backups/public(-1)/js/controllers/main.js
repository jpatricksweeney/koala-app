myApp.controller('MainController', ['$scope', '$rootScope', '$firebaseAuth', '$firebaseArray', '$firebaseObject', 'Authentication', '$routeParams', '$location', '$anchorScroll'
  
    , function ($scope, $rootScope, $firebaseAuth, $firebaseArray, $firebaseObject, Authentication, $routeParams, $location, $anchorScroll) {
        console.log('in account controller!');
        
        if($routeParams.goto) {
            console.log('IN GOTOTOTOTO')
          $location.hash($routeParams.goto);
          $anchorScroll();
        }
        
        /* Get user's profile */
        cref = firebase.database().ref('/company');
        var obj = $firebaseObject(cref);
        $scope.company = obj;
        
        obj.$loaded(function () {
            console.log('company data loaded');

            $scope.company.myrotatorpics = [];
            if( typeof $scope.company.rotatorpics !== 'undefined' ) {
                Object.keys($scope.company.rotatorpics).forEach(function (key) {
                    oneobj = {
                        url: $scope.company.rotatorpics[key].url
                    };
                    $scope.company.myrotatorpics.push(oneobj);
                });
            };
            
            var numimages = $scope.company.myrotatorpics.length;
            x = (Math.floor(Math.random() * numimages));
            randomimage = ($scope.company.myrotatorpics[x].url);
            $("#bannersection").attr('style', 'background-image: url(' + randomimage + ')'); 
            
            $scope.company.mygallerypics = [];
            if( typeof $scope.company.gallerypics !== 'undefined' ) {
                Object.keys($scope.company.gallerypics).forEach(function (key) {
                    oneobj = {
                        url: $scope.company.gallerypics[key].url
                    };
                    $scope.company.mygallerypics.push(oneobj);
                });
            };

            $('header .button').css({'background-color': '#' + $scope.company.highlightcolor});
            $('.service-list').css({'color': '#' + $scope.company.highlightcolor});
            $('#return-to-top').css({'background': '#' + $scope.company.highlightcolor});
            
            $scope.highlightBackColor = {'background-color': '#' + $scope.company.highlightcolor };
            
            if($routeParams.goto) {
                $('#nav-section-home').css({"border-bottom":'6px solid #' + $scope.company.highlightcolor, 'outline':'none !important', 'padding-bottom': '2px'});
                $('#nav-section-services').css({"border-bottom":'none'});
                $('#nav-section-specialists').css({"border-bottom":'none'});
                $('#nav-section-appointment').css({"border-bottom":'none'});
            }
            
            $( document ).ready(function() {
                $('#nav-section-home').css({"border-bottom":'6px solid #' + $scope.company.highlightcolor, 'outline':'none !important', 'padding-bottom': '2px'});
                $('#nav-section-services').css({"border-bottom":'none'});
                $('#nav-section-specialists').css({"border-bottom":'none'});
                $('#nav-section-appointment').css({"border-bottom":'none'});
            });            
        });
        
        /* Get services */        
        cref = firebase.database().ref('/services');
        var servobj = $firebaseArray(cref);
        $scope.services = servobj;
        
        // Retrieve all specialists
        ref = firebase.database().ref('/users');
        var users = $firebaseArray(ref);
        $scope.users = users;
        $scope.staffOrder = "firstname";
        
        
}]); // Controller
