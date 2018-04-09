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
            $('#return-to-top').css({
                'background': '#' + $scope.company.highlightcolor
            });
            $scope.highlightColor = {
                'color': '#' + $scope.company.highlightcolor
            };
            $scope.highlightBackColor = {
                'background-color': '#' + $scope.company.highlightcolor
            };
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
            Object.keys(myserv).forEach(function (key) {
                oneobj = {
                    servicecategory: myserv[key].servicecategory
                    , description: myserv[key].description
                    , picURL: myserv[key].picURL
                };
                var slist = [];
                if (typeof myserv[key].servicelist !== 'undefined') {
                    myservlist = myserv[key].servicelist;
                    Object.keys(myservlist).forEach(function (key) {
                        slist.push({
                            servicecategory: myservlist[key].servicecategory
                            , category: myservlist[key].category
                            , name: myservlist[key].name
                            , pricing: myservlist[key].pricing
                        });
                    });
                };
                oneobj.servicelist = slist;
                // We only need the requested service for view
                if (oneobj.servicecategory == servicequery) {
                    $scope.services.push(oneobj);
                }
            });
            $scope.$apply();
        });
        $scope.selectSpecialist = function (item) {
            console.log(item);
            console.log($scope.selectedService);
            $('#mySelectSpecialistModal').modal('hide');
            
            // Kluge to work-around opacity not disappearing on hide
            $('.modal').removeClass('in');
            $('.modal').attr("aria-hidden","true");
            $('.modal').css("display", "none");
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            
            $location.path("/appointment/" + item.regUser + "/" + $scope.selectedService);
        }
        $scope.bookService = function (item) {
            console.log(item);
            $scope.selectedService = item.name;
            /* Figure out how many specialists offer this service...if only one, we don't need to prompt! */
            var specialistCount = 0;
            var userID = '';
            $scope.specialists.forEach(function (spec) {
                if (spec.staffmember && spec.active && spec.servicelist) {
                    console.log(spec.staffmember);
                    var serviceFound = false;
                    Object.keys(spec.servicelist).forEach(function (key) {
                        if (spec.servicelist[key].servicecategory == $scope.servicename) {
                            serviceFound = true;
                        }
                    });
                    if (serviceFound) {
                        specialistCount++;
                        userID = spec.regUser; // Save in case only one!
                    };
                }
            });
            if (specialistCount > 1) {
                $('#mySelectSpecialistModal').modal('show');
            }
            else { // if only one specialist, go directly to appointment scheduler
                $location.path("/appointment/" + userID + "/" + item.name);
            };
        }
}]); // Controller