var myApp = angular.module('myApp',
  ['ngRoute', 'firebase', 'ui.tinymce', 'ngSanitize', 'ngCart'])
  .constant('FIREBASE_URL', 'https://koala-6f72a.firebaseio.com');

myApp.run(['$rootScope', '$location',
  function($rootScope, $location) {
    $rootScope.$on('$routeChangeError',
      function(event, next, previous, error) {
        console.log('in routeChangeError!');
        if (error=='AUTH_REQUIRED') {
          //alert('Sorry, you must log in to access that page');
          // Save incoming state
          $rootScope.originalPath = next.originalPath;
          $rootScope.pathParams = next.pathParams;            
          $location.path('/login');
        }
        
        if (error=='NOT_ADMIN') {
            alert('Sorry, you must log in to access that page');
        }        
        
      });
}]);

// html filter (render text as html)
myApp.filter('html', ['$sce', function ($sce) { 
    return function (text) {
        return $sce.trustAsHtml(text);
    };    
}])

// remove 's' from 
myApp.filter('removelastchar', function() {
    return function(str) {
        if( str.substr(str.length-1, 1) === 's') {
            str = str.slice(0, str.length-1);
        }
        return str;
    };
});


myApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/login', {
        templateUrl: '/views/login.html',
        controller: 'CredentialsController'
    })
    .when('/register', {
        templateUrl: '/views/register.html',
        controller: 'CredentialsController'
    })
    .when('/profile', {
        templateUrl: 'views/profile.html',
        controller: 'ProfileController',
        resolve: { 
            currentAuth: function(Authentication) {
                return Authentication.requireAuth();
            } 
        }
    })
    .when('/admin', {
        templateUrl: 'views/admin.html',
        controller: 'AdminController',
        resolve: { 
            currentAuth: function(Authentication) {
                return Authentication.checkAdmin();
            } 
        }
    })
    .when('/account', {
        templateUrl: 'views/account.html',
        controller: 'AccountController',
        resolve: { 
            currentAuth: function(Authentication) {
                return Authentication.requireAuth();
            } 
        }
    })
    .when('/main', {
        templateUrl: 'views/main.html',
        controller: 'MainController'
    })
    .when('/main/:goto', {
        templateUrl: 'views/main.html',
        controller: 'MainController'
    })
    .when('/contact', {
        templateUrl: 'views/contact.html',
        controller: 'ContactController'
    })
    .when('/appointment/:uID', {
        templateUrl: 'views/appointment.html',
        controller: 'AppointmentController',
        resolve: { 
            currentAuth: function(Authentication) {
                return Authentication.requireAuth();
            } 
        }
    })
    .when('/appointment/:uID/:sID', {
        templateUrl: 'views/appointment.html',
        controller: 'AppointmentController',
        resolve: { 
            currentAuth: function(Authentication) {
                return Authentication.requireAuth();
            } 
        }
    })
    .when('/staffpicker', {
        templateUrl: 'views/staffpicker.html',
        controller: 'StaffPickerController',
    })
    .when('/specialists', {
        templateUrl: 'views/specialists.html',
        controller: 'SpecialistsController',
    })
    .when('/specialists/:servQuery', {
        templateUrl: 'views/specialists.html',
        controller: 'SpecialistsController',
    })
    .when('/specialist-detail/:uID', {
        templateUrl: 'views/specialist-detail.html',
        controller: 'SpecialistDetailController',
    })
    .when('/services', {
        templateUrl: 'views/services.html',
        controller: 'ServicesController',
    })
    .when('/service-detail/:servicename', {
        templateUrl: 'views/service-detail.html',
        controller: 'ServiceDetailController',
    })
    .when('/product-detail/:prodID', {
        templateUrl: 'views/product-detail.html',
        controller: 'ProductDetailController',
    })
    .when('/cart', {
        templateUrl: 'template/ngCart/cart.html',
        controller: 'CartController',
    })
    .otherwise({
        redirectTo: '/main'
    });
}]);