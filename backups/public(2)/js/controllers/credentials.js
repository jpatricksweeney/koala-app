myApp.controller('CredentialsController',
  ['$scope', 'Authentication', '$location', '$firebaseObject',
  function($scope, Authentication, $location, $firebaseObject) {
      
  window.scrollTo(0, 0);
      
    /* Get user's profile */
    cref = firebase.database().ref('/company');
    var obj = $firebaseObject(cref);
    $scope.company = obj;

    obj.$loaded(function(){
        $('#login button').css({'background-color': '#' + $scope.company.highlightcolor});
        $('#login a').css({'color': '#' + $scope.company.highlightcolor});
        $('#btnEmailReset').css({'background-color': '#' + $scope.company.highlightcolor});
        $('#register button').css({'background-color': '#' + $scope.company.highlightcolor});
        $scope.highlightColor = {'color': '#' + $scope.company.highlightcolor};
    });      
      
      
      
  $scope.user = {};
      
  $scope.login = function() {
    Authentication.login($scope.user);
    $scope.myform.$setPristine();
  }; 

  $scope.logout = function() {
    Authentication.logout();
  };

  $scope.register = function() {
    Authentication.register($scope.user);
    $scope.myform.$setPristine();
  };
      
  $scope.pwReset = function(emailaddress) {
    $('#myModalPasswordReset').modal('hide');
    Authentication.pwReset(emailaddress);
  };
      
  $scope.requireAuth = function() {
    Authentication.requireAuth($scope.user);
  };  

}]);

