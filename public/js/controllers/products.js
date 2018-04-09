myApp.controller('ProductsController', ['$scope', '$rootScope', '$firebaseAuth', '$firebaseArray', '$firebaseObject', 'ngCart'
  
    , function ($scope, $rootScope, $firebaseAuth, $firebaseArray, $firebaseObject, ngCart) {
        console.log('in products controller');
        
        window.scrollTo(0, 0);
        
        /* Get company info */
        cref = firebase.database().ref('/company');
        var obj = $firebaseObject(cref);
        $scope.company = obj;
        
        obj.$loaded(function () {
            console.log('company data loaded');
            ngCart.setTaxRate($scope.company.paypaltaxrate);
            ngCart.setShipping(parseInt($scope.company.paypalshipping));
            $scope.highlightBackColor = {'background-color': '#' + $scope.company.highlightcolor };
        });
        
        /* Get products */        
        pref = firebase.database().ref('/products');
        var prodobj = $firebaseArray(pref);
        $scope.products = prodobj;
        
        /* Build category array */
        $scope.categories = [];
        $scope.brands = [];
        prodobj.$loaded(function () {
            $scope.products.forEach(function(item) {
                $scope.categories.push(item.category);
                $scope.brands.push(item.brand);
            });
            
            function unique(array) {
                return $.grep(array, function(el, index) {
                    return index == $.inArray(el, array);
                });
            }
            /* Elimate duplicates and sort */
            $scope.categories = unique($scope.categories);
            $scope.brands = unique($scope.brands);
            $scope.categories.sort();
            $scope.brands.sort();
        });
        
        $scope.setProdQuery = function(item) {
            item === 'All' ? $scope.prodquery = '' : $scope.prodquery = item;
        }
}]); // Controller
