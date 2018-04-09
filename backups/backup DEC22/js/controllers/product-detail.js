myApp.controller('ProductDetailController', ['$scope', '$rootScope', '$firebaseObject', '$routeParams', 

  function ($scope, $rootScope, $firebaseObject, $routeParams) {

        console.log('in product controller!');
        window.scrollTo(0, 0);
      
        console.log('product id=' + $routeParams.prodID);
      
        firebase.database().ref('/products/' + $routeParams.prodID).once('value').then(function (snapshot) {
            console.log(snapshot.val());
            $scope.product = snapshot.val();
            $scope.productID = $routeParams.prodID;
        });
      
      
}]); // Controller