myApp.controller('SpecialistsController', ['$scope', '$rootScope', 'Authentication', '$firebaseArray', '$firebaseObject', '$routeParams',

  function ($scope, $rootScope, Authentication, $firebaseArray, $firebaseObject, $routeParams) {
      
      /* ------------------- Load profile data --------------------- */
      console.log('in specialist controller!');
      
      window.scrollTo(0, 0);
      
      /* Get company info */
      cref = firebase.database().ref('/company');
      var obj = $firebaseObject(cref);
      $scope.company = obj;
      obj.$loaded(function () {
          $('#all-specialists').css({'color': '#' + $scope.company.highlightcolor});
          $('#return-to-top').css({'background': '#' + $scope.company.highlightcolor});
          $scope.highlightColor = {'color': '#' + $scope.company.highlightcolor};
          $scope.highlightBackColor = {'background-color': '#' + $scope.company.highlightcolor };
          $('.header-style').css($scope.highlightColor);
      });
      
      $( document ).ready(function() {
          $('#all-specialists').css({'border-bottom': '4px solid #121420'});
      });
      
      $scope.query = $routeParams.servQuery;
      
      // Retrieve all specialists
      ref = firebase.database().ref('/users');
      var users = $firebaseArray(ref);
      $scope.users = users;
      $scope.staffOrder = "firstname";

      $scope.services = [];
      
      // convert firebase objects into arrays of objects so ng likes them.
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
      
      $scope.setServiceQuery = function(item) {
          $scope.query = item;
          $('#all-specialists').css({'border-bottom': 'none'});
      }
      
      $scope.setServiceQueryAll = function() {
          $scope.query = '';
          $('#all-specialists').css({'border-bottom': '4px solid #121420'});
      }
      
}]); // Controller