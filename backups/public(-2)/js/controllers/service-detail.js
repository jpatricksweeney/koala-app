myApp.controller('ServiceDetailController', ['$scope', '$rootScope', 'Authentication', '$firebaseArray', '$firebaseObject', '$routeParams', '$location', 

  function ($scope, $rootScope, Authentication, $firebaseArray, $firebaseObject, $routeParams, $location) {
      
      /* ------------------- Load profile data --------------------- */
      console.log('in services controller!');
      window.scrollTo(0, 0);
      
      var servicequery = $routeParams.servicename;
      $scope.servicename = $routeParams.servicename;
      
      /* Get user's profile */
      cref = firebase.database().ref('/company');
      var obj = $firebaseObject(cref);
      $scope.company = obj;
      obj.$loaded(function () {
          $('#return-to-top').css({'background': '#' + $scope.company.highlightcolor});
          $scope.highlightColor = {'color': '#' + $scope.company.highlightcolor};
          $scope.highlightBackColor = {'background-color': '#' + $scope.company.highlightcolor };
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
              
              // We only need the requested service for view
              if( oneobj.servicecategory == servicequery ) {
                  $scope.services.push(oneobj);
              }
          });  
          $scope.$apply();  
      });
}]); // Controller