myApp.controller('ServicesController', ['$scope', '$rootScope', 'Authentication', '$firebaseArray', '$firebaseObject', '$routeParams', '$location', '$anchorScroll',

  function ($scope, $rootScope, Authentication, $firebaseArray, $firebaseObject, $routeParams, $location, $anchorScroll) {
      
      /* ------------------- Load profile data --------------------- */
      console.log('in services controller!');
      window.scrollTo(0, 0);
      
      $scope.homeServicesBackLink = false;
      if($routeParams.goto) {
          var serviceID = $routeParams.goto + '01';
          $location.hash(serviceID);
          $anchorScroll.yOffset = 140;  // Account for nav bar
          $anchorScroll();
          $scope.homeServicesBackLink = true;
      } 
      
      /* Get user's profile */
      cref = firebase.database().ref('/company');
      var obj = $firebaseObject(cref);
      $scope.company = obj;
      obj.$loaded(function () {
          $('#return-to-top').css({'background': '#' + $scope.company.highlightcolor});
          $scope.highlightColor = {'color': '#' + $scope.company.highlightcolor};
          $scope.highlightBackColor = {'background-color': '#' + $scope.company.highlightcolor };
          $('.header-style').css($scope.highlightColor);
          
          if($routeParams.goto) {
              $('#nav-section-services').css({"border-bottom":'6px solid #' + $scope.company.highlightcolor, 'outline':'none !important', 'padding-bottom': '2px'});
              $('#nav-section-home').css({"border-bottom":'none'});
          }
      });
      
      // Retrieve all specialists
      ref = firebase.database().ref('/users');
      var users = $firebaseArray(ref);
      $scope.specialists = users;
      $scope.staffOrder = "firstname";
      
      // convert firebase objects into arrays of objects so ng likes them.
      $scope.services = [];
      firebase.database().ref('/services').once('value').then(function (snapshot) {
          myserv = snapshot.val();         
          Object.keys(myserv).forEach(function(key) {
              oneobj = {
                        servicecategory: myserv[key].servicecategory,
                        description: myserv[key].description,
                        picURL: myserv[key].picURL
                        };
              
              var slist = [];
              
              if( typeof myserv[key].servicelist !== 'undefined' ) {
                  myservlist = myserv[key].servicelist;
                  Object.keys(myservlist).forEach(function(key){
                      slist.push({
                                servicecategory: myservlist[key].servicecategory,
                                category: myservlist[key].category,
                                name: myservlist[key].name,
                                pricing: myservlist[key].pricing
                                });

                  });
              };
              oneobj.servicelist = slist;
              $scope.services.push(oneobj);
          });  
          $scope.$apply();  
      });
      
      
      
}]); // Controller