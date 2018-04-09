myApp.controller('MainController', ['$scope', '$rootScope', '$firebaseAuth', '$firebaseArray', '$firebaseObject', 'Authentication', '$routeParams', '$location', '$anchorScroll'
  
    , function ($scope, $rootScope, $firebaseAuth, $firebaseArray, $firebaseObject, Authentication, $routeParams, $location, $anchorScroll) {
        console.log('in account controller!');
        
        if($routeParams.goto) {
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
        
        /* Get products */        
        pref = firebase.database().ref('/products');
        var prodobj = $firebaseArray(pref);
        $scope.products = prodobj;
        
        console.log($scope.products);
        
        prodobj.$loaded(function () {
            paypal.Button.render({

                env: 'sandbox', // sandbox | production

                // PayPal Client IDs - replace with your own
                // Create a PayPal app: https://developer.paypal.com/developer/applications/create
                client: {
                    sandbox:    'AZDxjDScFpQtjWTOUtWKbyN_bDt4OgqaF4eYXlewfBP4-8aqX3PiV8e1GWU6liB2CUXlkA59kJXE7M6R',
                    production: '<insert production client id>'
                },

                // Show the buyer a 'Pay Now' button in the checkout flow
                commit: true,

                // payment() is called when the button is clicked
                payment: function(data, actions) {

                    // Make a call to the REST api to create the payment
                    return actions.payment.create({
                        payment: {
                            transactions: [
                                {
                                    amount: { total: '0.01', currency: 'USD' }
                                }
                            ]
                        }
                    });
                },

                // onAuthorize() is called when the buyer approves the payment
                onAuthorize: function(data, actions) {

                    // Make a call to the REST api to execute the payment
                    return actions.payment.execute().then(function() {
                        window.alert('Payment Complete!');
                    });
                }

            }, '#paypal-button-container');  
        });
        
        
        // Retrieve all specialists
        ref = firebase.database().ref('/users');
        var users = $firebaseArray(ref);
        $scope.users = users;
        $scope.staffOrder = "firstname";
        
        // Determine if staffer has openings today
        users.$loaded(function () {
            $scope.users.forEach(function(staffer) {
                if(staffer.staffmember && staffer.active) {
                    staffer.hasHoursToday = true;
                    
                    var myHours = getStaffersHours(Date.today().getDay(), staffer);
                    // *** for test purposes *** var myHours = getStaffersHours(Date.today().add(1).days().getDay(), staffer);
                    
                    if(!myHours || !myHours.on) {
                        staffer.hasHoursToday = false;
                    }
                    
                    var todaysDate = Date.today().toString("d-MMM-yyyy");
                    //var startTime = new Date(todaysDate + ' ' + parseTime(myHours.start));  
                    var currentTime = new Date.now;
                    var startTime = currentTime;  // Day should start at current time!
                    var endTime = new Date(todaysDate + ' ' + parseTime(myHours.end)); 
                    var totalMinutesOnScheduleToday = getMinutesBetweenDates(startTime, endTime);
                    
                    aref = firebase.database().ref('/bookings/' + staffer.regUser);
                    var appts = $firebaseArray(aref);
                    var totalMinutesBookedToday = 0;
                    appts.$loaded(function () {
                        // Add up booked and blocked minutes
                        appts.forEach(function(slot) {
                            mydate = new Date(slot.$id);
                        
                            // add sameDay functionality to compare just the date (ie. minus the time portion)
                            Date.prototype.sameDay = function(d) {
                              return this.getFullYear() === d.getFullYear()
                                && this.getDate() === d.getDate()
                                && this.getMonth() === d.getMonth();
                            };
 
                            // *** for test purposes ***  if( Date.today().add(1).days().sameDay(mydate) ) { 
                            
                            if( Date.today().sameDay(mydate) && (mydate > currentTime)) {
                                totalMinutesBookedToday += slot.minutesToComplete;
                            }
                        });
                        var freeMinutes = totalMinutesOnScheduleToday - totalMinutesBookedToday;
                        if( freeMinutes < 30) {
                            staffer.hasHoursToday = false;
                        }
                    });
                }
            });
        });
        
        
        function getStaffersHours(DayOfWeek, staffer) {    
            if(DayOfWeek === 0) {
                return staffer.sunday;
            } else if(DayOfWeek === 1) {
                return staffer.monday;
            } else if(DayOfWeek === 2) {
                return staffer.tuesday;
            } else if(DayOfWeek === 3) {
                return staffer.wednesday;
            } else if(DayOfWeek === 4) {
                return staffer.thursday;
            } else if(DayOfWeek === 5) {
                return staffer.friday;
            } else if(DayOfWeek === 6) {
                return staffer.saturday;
            }
            else {return {}}
        } 
        
        function parseTime(time) {
            if(time) {
                return time.replace('am',' am').replace('pm', ' pm');
            } 
            return '';
        }

        function getMinutesBetweenDates(startDate, endDate) {
            if(startDate && endDate) {
                var diff = endDate.getTime() - startDate.getTime();
                return (diff / 60000);
            }
            return 0;
        };

        
      

}]); // Controller
