myApp.controller('SpecialistDetailController', ['$scope', '$rootScope', 'Authentication', '$firebaseObject', '$firebaseArray', '$routeParams',

  function ($scope, $rootScope, Authentication, $firebaseObject, $firebaseArray, $routeParams) {
        window.scrollTo(0, 0);
        /* ------------------- Load profile data --------------------- */
        console.log('in specialist detail controller!');      
      
        /* Get user's profile */
        cref = firebase.database().ref('/company');
        var obj = $firebaseObject(cref);
        $scope.company = obj;
        
        obj.$loaded(function(){
            $('#all-specialists').css({'color': '#' + $scope.company.highlightcolor});
            $('#specialist-detail button').css({'background-color': '#' + $scope.company.highlightcolor});
            $('#return-to-top').css({'background': '#' + $scope.company.highlightcolor});
            $('#specialist-detail-section1 a').css({'color': '#' + $scope.company.highlightcolor});
            $('#sd-back-button a').css({'color': '#' + $scope.company.highlightcolor});
            $scope.highlightColor = {'color': '#' + $scope.company.highlightcolor};
            $scope.highlightBackColor = {'background-color': '#' + $scope.company.highlightcolor};
            
            $('#nav-section-specialists').css({"border-bottom":'6px solid #' + $scope.company.highlightcolor, 'outline':'none !important', 'padding-bottom': '2px'});
            $('#nav-section-services').css({"border-bottom":'none'});  
            $('#nav-section-home').css({"border-bottom":'none'});            
        });
      
        $( document ).ready(function() {
            $('#all-specialists').css({'border-bottom': '4px solid #121420'});
        });
      
        // Retrieve all services
        ref = firebase.database().ref('/services');
        var servicesobj = $firebaseArray(ref);
        $scope.services = servicesobj;
      
        // retrieve the requested staff member's info
        ref = firebase.database().ref('/users/' + $routeParams.uID);
        var specialist = $firebaseObject(ref);
        specialist.$loaded().then(function () {
            $scope.specialist = specialist;
            
            if( !(typeof $scope.specialist.facebook === 'undefined') ) {
                $scope.specialist.facebook = 'https://www.facebook.com/' + $scope.specialist.facebook;
            }
            if( !(typeof $scope.specialist.twitter === 'undefined') ) {
                $scope.specialist.twitter = 'https://www.twitter.com/' + $scope.specialist.twitter;
            }
            if( !(typeof $scope.specialist.instagram === 'undefined') ) {
                $scope.specialist.instagram = 'https://www.instagram.com/' + $scope.specialist.instagram;
            }
            if( !(typeof $scope.specialist.google === 'undefined') ) {
                $scope.specialist.google = 'https://plus.google.com/' + $scope.specialist.google;
            }
            
            $scope.specialist.myservices = [];
            $scope.servicesfound = false;
            Object.keys($scope.specialist.servicelist).forEach(function (key) {
                oneobj = {
                    ID: $scope.specialist.servicelist[key].ID
                    , category: $scope.specialist.servicelist[key].category
                    , name: $scope.specialist.servicelist[key].name
                    , pricing: $scope.specialist.servicelist[key].pricing
                    , serviceKey: $scope.specialist.servicelist[key].serviceKey
                    , servicecategory: $scope.specialist.servicelist[key].servicecategory
                    , description: $scope.specialist.servicelist[key].description
                    , hours: $scope.specialist.servicelist[key].hours
                    , minutes: $scope.specialist.servicelist[key].minutes
                };
                $scope.specialist.myservices.push(oneobj);
                $scope.servicesfound = true;
                /* $scope.$appy(); */
            });
            
            $scope.specialist.mygallery = [];
            if( typeof $scope.specialist.gallery !== 'undefined' ) {
                Object.keys($scope.specialist.gallery).forEach(function (key) {
                    oneobj = {
                        url: $scope.specialist.gallery[key].url
                    };
                    $scope.specialist.mygallery.push(oneobj);
                });
            };
            
            var temp = [];
            $scope.specialist.myservices.forEach(function(s) {
                temp.push(s.servicecategory);
            });
            $scope.services = $.unique(temp);
            
        });
      
      $scope.setServiceQuery = function(item) {
          $scope.userquery = item;
      }
      
      $scope.setServiceQuery = function(item) {
          $scope.servquery = item;
          $('#all-specialists').css({'border-bottom': 'none'});
      }
      
      $scope.setServiceQueryAll = function() {
          $scope.servquery = '';
          $('#all-specialists').css({'border-bottom': '4px solid #121420'});
      }
      
      
    $scope.showDescription = function(item) {
        console.log(item);
        $('#myModalLabel').text(item.name);
        $('#modalDescHere').html(item.description);
        $('#myModalMessage').text(item.pricing);
        $('#modalDescription').modal('show');
    };       
      
      
   
      
}]); // Controller