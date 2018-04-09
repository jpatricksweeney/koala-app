myApp.controller('AppointmentController', ['$scope', '$rootScope', '$firebaseObject', '$routeParams', '$firebaseArray', '$location', '$routeParams', 'Authentication', '$window',

  function ($scope, $rootScope, $firebaseObject, $routeParams, $firebaseArray, $location, $routeParams, Authentication, $window) {
        window.scrollTo(0, 0);
      
        $scope.selectingService = true;
        $scope.sessionbooked = false;      
      
        // Refactor
        var mySlotMinutes = 30;
        var allowOverflow = false;
        var dayCount = 1;
        var segmentMinutes = 30;

        /* Get user's profile */
        cref = firebase.database().ref('/company');
        var obj = $firebaseObject(cref);
        $scope.company = obj;   
        obj.$loaded(function(){ 
            $('#appointmentpage a').css({'color': '#' + $scope.company.highlightcolor});
            $('#return-to-top').css({'background': '#' + $scope.company.highlightcolor});
            $scope.highlightColor = {'color': '#' + $scope.company.highlightcolor};
            $scope.highlightBackgroundColor = {'background-color': '#' + $scope.company.highlightcolor};
            $('.header-style').css($scope.highlightColor);
        });      
      
        $( document ).ready(function() {
            $('#all-specialists').css({'border-bottom': '4px solid #121420'});
        });
      
        $scope.setServiceQuery = function(item) {
          $scope.userquery = item;
          $('#all-specialists').css({'border-bottom': 'none'});
        }
      
        $scope.setServiceQueryAll = function() {
          $scope.userquery = '';
          $('#all-specialists').css({'border-bottom': '4px solid #121420'});
        }    
      
        // datepicker initialized after workschedule is generated
        $("#datepicker").datepicker("setDate", 0);
    
        $('#datepicker').change(function(){
            $scope.selectDate = $('#datepicker').val();
            $scope.$apply();
            $('.time-slot input:not(:checked) ~ label').css({'background-color':'#'+$scope.company.highlightcolor});
        });     
      
        // Select service handler
        $scope.selectService = function(item) {
            $scope.selectingService = false;
            $scope.selectItem = item;
            $window.scrollTo(0, 140);
            
            // Calculate service duration and find first available appointment time
            var srvcMins = item.minutes;
            var srvcHrs = item.hours;
            srvcMins = srvcMins.substring(0,srvcMins.search(' '));
            srvcHrs = srvcHrs.substring(0,srvcHrs.search(' '));
            var serviceTime = parseInt(srvcMins) + parseInt(srvcHrs * 60);
            findFirstAvailableTime(21, 30, $scope.myWorkSchedule, serviceTime, Date.today()); 
            $window.scrollTo(0, 0);
        }

        // Service selector is an accordion control
        $scope.accordionHandler = function($event,item) {
            var el = $event.currentTarget;
            el.classList.toggle("active");
            var panel = el.nextElementSibling;
            if (panel.style.maxHeight){
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            }         
        };
      
/* -------------------------------------------------------------------------------------------------------------------- */
        // $$REFACTOR the time range functions
        $scope.isMorningTime = function(slot) {
            var morningStartTime = new Date();
            morningStartTime.setHours(0, 30, 0);  // Set time to 12:00 AM
            var morningCutoffTime = new Date();
            morningCutoffTime.setHours(12, 0, 0);  // Set time to 12:00PM
            var slotTime = new Date();
            var hours = parseInt(slot.start.substr(0,2));
            var minutes = parseInt(slot.start.substr(3,2));
            if( slot.start.slice(-2) === 'PM' ) {
                hours = parseInt(slot.start.substr(0,2));
                hours += 12;
            } 
            slotTime.setHours(hours,minutes,0);
            
            if( (slotTime.getTime() > morningStartTime.getTime()) && (slotTime.getTime() < morningCutoffTime.getTime()) ) {
                return true;
            } 
            return false;
        };
      
        // $$REFACTOR the time range functions     
        $scope.isAfternoonTime = function(slot) {
            var afternoonStartTime = new Date();
            afternoonStartTime.setHours(11, 30, 0);  // Set time to 11:30 AM
            var afternoonCutoffTime = new Date();
            afternoonCutoffTime.setHours(16, 00, 0);  // Set time to 04:00 PM
            
            var slotTime = new Date();
            var hours = parseInt(slot.start.substr(0,2));
            var minutes = parseInt(slot.start.substr(3,2));
            if( slot.start.slice(-2) === 'PM' ) {
                hours = parseInt(slot.start.substr(0,2));
                if( hours !== 12 ) {
                    hours = hours + 12;
                }
            }

            slotTime.setHours(hours,minutes,0);
            
            if( (slotTime.getTime() > afternoonStartTime.getTime()) && (slotTime.getTime() < afternoonCutoffTime.getTime()) ) {
                return true;
            } 
            return false;
        }
        
        // $$REFACTOR the time range functions
        $scope.isEveningTime = function(slot) {
            var eveningStartTime = new Date();
            eveningStartTime.setHours(15, 30, 0);  // Set time to 3:30 PM
            var eveningCutoffTime = new Date();
            eveningCutoffTime.setHours(20, 00, 0);  // Set time to 8:00 PM
            
            var slotTime = new Date();
            var hours = parseInt(slot.start.substr(0,2));
            var minutes = parseInt(slot.start.substr(3,2));
            if( slot.start.slice(-2) === 'PM' ) {
                hours = parseInt(slot.start.substr(0,2));
                if( hours !== 12 ) {
                    hours = hours + 12;
                }
            }

            slotTime.setHours(hours,minutes,0);
            
            if( (slotTime.getTime() > eveningStartTime.getTime()) && (slotTime.getTime() < eveningCutoffTime.getTime()) ) {
                return true;
            } 
            return false;
        }        
        
        $scope.isLateTime = function(slot) {
            var lateStartTime = new Date();
            lateStartTime.setHours(19, 30, 0);  // Set time to 8:00 PM
            var lateCutoffTime = new Date();
            lateCutoffTime.setHours(24, 00, 0);  // Set time to midnight
            
            var slotTime = new Date();
            var hours = parseInt(slot.start.substr(0,2));
            var minutes = parseInt(slot.start.substr(3,2));
            if( slot.start.slice(-2) === 'PM' ) {
                hours = parseInt(slot.start.substr(0,2));
                if( hours !== 12 ) {
                    hours = hours + 12;
                }
            }

            slotTime.setHours(hours,minutes,0);
            
            if( (slotTime.getTime() > lateStartTime.getTime()) && (slotTime.getTime() < lateCutoffTime.getTime()) ) {
                return true;
            } 
            return false;
        }         
/* -------------------------------------------------------------------------------------------------------------------- */ 
      
        // Datepicker setup
        $scope.today = function () {
          $scope.selectDate = new Date();
          $('#datepicker').datepicker('setDate', $scope.selectDate);
          $scope.selectDate = $scope.selectDate.toString('MMMM dd, yyyy');
        };
        $scope.today();

        $scope.options = {
          minDate: new Date()
          , showWeeks: false
        };
        $scope.setDate = function (year, month, day) {
          $scope.selectDate = new Date(year, month, day);
        };   
      
        $("#specialist-nav-section").click(function() {
            $(".specialist-underline").removeClass("specialist-underline");
        });      


        $scope.confirmBooking = function(slot) {
            // Display booking details
            d1 = slot.timestamp.toString("dddd, MMMM d, yyyy - h:mm tt");
            
            // save booking
            nowTime = new Date();
            var mobileNumber = 'n/a';
            if ( $scope.client.mobile ) {
                mobileNumber = $scope.client.mobile;
            }
            
            var blockedSlot = false;
            if( $scope.clientID === $scope.staffID ) {
                blockedSlot = true;
            }
            firebase.database().ref('/bookings/' + staffID + '/' + slot.timestamp).set({
                date: slot.timestamp.toString("dddd, MMMM d, yyyy - h:mm tt"),
                sortDate: slot.timestamp.getTime(),
                client: $scope.client.firstname + ' ' + $scope.client.lastname,
                clientID: $rootScope.currentUser.uid,
                clientEmail: $scope.client.email,
                clientMobile: mobileNumber,
                service: $scope.myService,
                minutesToComplete: $scope.serviceTime,
                dateBooked: nowTime.toString(),
                specialist: $scope.specialist.firstname + ' ' + $scope.specialist.  lastname,
                specialistID: staffID,
                blockedSlot: blockedSlot
            })
            .then(function(){
                generateBookingCalendar(dayCount, mySlotMinutes, $scope.myWorkSchedule, $scope.serviceTime, $scope.selectDate);
            })
            .catch(function(error) {
                console.log('error','Error in writeUserData');
                //Handle error
                var errorCode = error.code;
                var errorMessage = error.message;
                alert('Error during booking. Error message='+errorMessage)
            });

            
            if( $scope.staffID !== $scope.clientID ) {
                $("#confbookdate").text(d1);
                $("#confservice").text($scope.myService + ' (' + $scope.serviceTime + ' minutes)');
                $('#modalBookingConfirm').modal('show');                

                // If user click's yes, then display success
                $('#pf_modalYes').unbind('click').on('click', function () {
                    $scope.selectTime = slot.start;
                    $scope.sessionbooked = true;
                    $window.scrollTo(0, 0);
                    $scope.$apply();

                    emailjs.send("koalasolutions_us","appointment_confirmation",{
                        destination_email: $scope.client.email,
                        company_name: $scope.company.name,
                        reply_to: $scope.specialist.email,
                        specialist_email: $scope.specialist.email,
                        specialist_name: $scope.specialist.firstname + " " + $scope.specialist.lastname,
                        client_name: $scope.client.firstname,
                        message_html: "Your appointment with <strong>" + $scope.specialist.firstname + " " + $scope.specialist.lastname + "</strong> is confirmed for <strong>" + slot.timestamp.toString("dddd, MMMM d yyyy - h:mm tt") + "</strong>",
                        booking_details: "Service details: <strong>" + $scope.myService + ' (' + $scope.serviceTime + ' minutes)</strong>'
                    });
                });

                // If user click's NO, make timeslot available again
                $('#pf_modalNo').unbind('click').on('click', function () {
                    // remove locked booking slot
                    ref = firebase.database().ref('/bookings/' + staffID + '/' + slot.timestamp);
                    ref.remove();
                    generateBookingCalendar(dayCount, mySlotMinutes, $scope.myWorkSchedule, $scope.serviceTime, $scope.selectDate);                 
                });
            }
            
        };
    
        // Set default date in datepicker
        var d1 = Date.today();
        //d1.addDays(1);
        $scope.selectDate = d1.toString('MMMM d, yyyy');
      
        var days = [];  // Array holding the staffer's schedule 
        var segmentMinutes = 30;
        var allowOverflow = false;
      
        // Save incoming staff ID and currently logged user (the 'client')
        var staffID = $routeParams.uID;
        var clientID = $rootScope.currentUser.uid;
        $scope.clientID = clientID;
        $scope.staffID = staffID;
        
        firebase.database().ref('/users/' + clientID).once('value').then(function (snapshot) {
            $scope.client = snapshot.val();
        });      
        
        var myWorkSchedule = new Object();
        $scope.items = [];
        firebase.database().ref('/users/' + staffID).once('value').then(function (snapshot) {
            $scope.specialist = snapshot.val();
            
            // Arrayize the servicelist object
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
                $scope.items.push(oneobj);
            });
            
            var temp = [];
            $scope.items.forEach(function(s) {
                temp.push(s.servicecategory);
            });
            
            $scope.services = $.unique(temp);
            $scope.selectItem = $scope.items[0];
            
            myWorkSchedule["Monday"] = {
                'work': $scope.specialist.monday.on
                , 'start': $scope.specialist.monday.start
                , 'end': $scope.specialist.monday.end
            };
            myWorkSchedule["Tuesday"] = {
                'work': $scope.specialist.tuesday.on
                , 'start': $scope.specialist.tuesday.start
                , 'end': $scope.specialist.tuesday.end
            };
            myWorkSchedule["Wednesday"] = {
                'work': $scope.specialist.wednesday.on
                , 'start': $scope.specialist.wednesday.start
                , 'end': $scope.specialist.wednesday.end
            };
            myWorkSchedule["Thursday"] = {
                'work': $scope.specialist.thursday.on
                , 'start': $scope.specialist.thursday.start
                , 'end': $scope.specialist.thursday.end
            };
            myWorkSchedule["Friday"] = {
                'work': $scope.specialist.friday.on
                , 'start': $scope.specialist.friday.start
                , 'end': $scope.specialist.friday.end
            };
            myWorkSchedule["Saturday"] = {
                'work': $scope.specialist.saturday.on
                , 'start': $scope.specialist.saturday.start
                , 'end': $scope.specialist.saturday.end
            };
            myWorkSchedule["Sunday"] = {
                'work': $scope.specialist.sunday.on
                , 'start': $scope.specialist.sunday.start
                , 'end': $scope.specialist.sunday.end
            };            
            
            
            // Create datepicker and disable non-workdays
            $( "#datepicker" ).datepicker({ 
                dateFormat: 'MM d, yy',
                minDate: new Date(),
                maxDate: '+6M',
                beforeShowDay: blockNonWorkdays,
            });
      
            function blockNonWorkdays(date) {	
	           var dow = date.getDayName();
               return [myWorkSchedule[dow].work];
            }
            
            
        if( $routeParams.sID ) {
            $scope.items.forEach(function (item) {
                if( item.name === $routeParams.sID ) {
                    $scope.selectService(item);
                }
            });
        }            
            
            
        });
      
        $scope.myWorkSchedule = myWorkSchedule;

        function getMinutesBetweenDates(startDate, endDate) {
            var diff = endDate.getTime() - startDate.getTime();
            return (diff / 60000);
        };
      
        $scope.$watch('selectItem', function (newValue) {
            // If user has selected (or re-selected) a service, then get service time and build time slots
            if (newValue) {
                $scope.myService = newValue.name;
                var srvcMins = newValue.minutes;
                var srvcHrs = newValue.hours;
                srvcMins = srvcMins.substring(0,srvcMins.search(' '));
                srvcHrs = srvcHrs.substring(0,srvcHrs.search(' '));
                var serviceTime = parseInt(srvcMins) + parseInt(srvcHrs * 60);
                $scope.serviceTime = serviceTime;
                generateBookingCalendar(dayCount, mySlotMinutes, myWorkSchedule, serviceTime, $scope.selectDate); 
            };
        });
      
        $scope.$watch('selectDate', function (newDate) {
            // If user has selected (or re-selected) a service, then get service time and build time slots
            if (newDate && typeof $scope.selectItem !== 'undefined') {
                $scope.myService = $scope.selectItem.name;
                var srvcMins = $scope.selectItem.minutes;
                var srvcHrs = $scope.selectItem.hours;
                srvcMins = srvcMins.substring(0,srvcMins.search(' '));
                srvcHrs = srvcHrs.substring(0,srvcHrs.search(' '));
                var serviceTime = parseInt(srvcMins) + parseInt(srvcHrs * 60);
                $scope.serviceTime = serviceTime;
                generateBookingCalendar(dayCount, mySlotMinutes, myWorkSchedule, serviceTime, newDate); 
            };
        });      
      
        //
        // Find first available appoinment time
        // 
        function findFirstAvailableTime(dayCount, slotMinutes, myWorkSchedule, serviceTime, startdate) {        
            var slotsRequired = Math.ceil(serviceTime / slotMinutes);
            var days = [];
            for (i = 0; i < dayCount; i++) {
                
                var d1 = new Date(startdate);
                d1.addDays(i);
                var todaysDate = d1.toString("d-MMM-yyyy");
                var dayofWeek = d1.getDayName();
                var starttime = myWorkSchedule[dayofWeek].start;
                var endtime = myWorkSchedule[dayofWeek].end;
                var dow = d1.getDay();
                // Inject space into time to appease date parser
                starttime = starttime.replace('am', ' am');
                starttime = starttime.replace('pm', ' pm');
                endtime = endtime.replace('am', ' am');
                endtime = endtime.replace('pm', ' pm');
                d1 = new Date(todaysDate + ' ' + starttime);
                d2 = new Date(todaysDate + ' ' + endtime);
                // Calculate segments based on duration between starttime and endtime, divided by segment minutes
                workMinutes = getMinutesBetweenDates(d1, d2);
                segments = workMinutes / slotMinutes;
                slots = [];
                for (j = 0; j < segments; j++) {
                    slot = d1.clone();
                    // if this is a staffer's workday, then set 'booked' to false so clients can book appointments
                    isBooked = !myWorkSchedule[dayofWeek].work;
                    
                    // Has slot expired?
                    if( slot < new Date.now ){
                        isBooked = true;
                    }  
                    
                    slots.push({
                        'booked': isBooked  
                        , 'start': slot.toString("hh:mm tt")
                        , 'timestamp': slot
                    });
                    d1.addMinutes(slotMinutes);
                };
                day = {
                    'todaysDate': todaysDate
                    , 'dayofWeek': dayofWeek
                    , 'dow': dow
                    , 'timeslots': slots
                };
                days.push(day);
            };
    
            // Now we block out time slots based on current bookings
            firebase.database().ref('/bookings/' + staffID).once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    var bookingDate = childSnapshot.key;
                    var bookingDetails = childSnapshot.val();
                    var startOfBooking = new Date(bookingDate);
                    var pastBooking = startOfBooking.compareTo(Date.today()) == -1 ? true : false;
                    if (!pastBooking) {
                        var endOfBooking = startOfBooking.clone().addMinutes(bookingDetails.minutesToComplete - 1);
                        // Loop thru bookings to block out time slots on view 
                        days.forEach(function (day) {
                            day.timeslots.forEach(function (slot, index) {
                                if (slot.timestamp.between(startOfBooking, endOfBooking)) {
                                    slot.booked = true;
                                };
                                if (day.timeslots.length - 1 === index) { // Last slot of the day?
                                    // if this service takes longer than the last timeslot of the day, block if no overflow 
                                    if (serviceTime > slotMinutes) {
                                        if (!allowOverflow) {
                                            slot.booked = true;
                                        }
                                    }
                                }
                            });
                        });
                    };
                });
                
                // Find the first available slot
                var slotFound = false;
                days.forEach(function (day) {
                    day.timeslots.forEach(function (slot, index) {
                        if (!day.timeslots[index].booked && !slotFound) {
                            // lookahead to see if there are enough slots
                            var contiguousSlots = true;
                            for (i = 0; i < slotsRequired; i++) {
                                tempix = index + i;
                                if (tempix < day.timeslots.length) {
                                    if (day.timeslots[tempix].booked) {
                                        contiguousSlots = false;
                                    }
                                };
                            };
                            if (contiguousSlots) {
                                slotFound = true;
                                $scope.firstAvailable = day.timeslots[index].timestamp.toString("dddd, MMMM d, yyyy - h:mm tt");
                                $scope.selectDate = day.timeslots[index].timestamp.toString('MMMM dd, yyyy');
                                $('#datepicker').datepicker('setDate', $scope.selectDate);
                                $scope.$apply();
                            }
                        }
                    });
                });
            });
        };
      
        // GenerateBookingCalendar builds the calendar view based on how many days staffer specified in profile (advanced),
        // and the segment time (service time) associate to the service the user selected.  The result is a calendar where
        // available time slots can be selected for booking!
        function generateBookingCalendar(dayCount, slotMinutes, myWorkSchedule, serviceTime, startdate) {
            var slotsRequired = Math.ceil(serviceTime / slotMinutes);
            serviceTime = serviceTime - 1;  // So we don't block slot after a booking
            var days = [];
            for (i = 0; i < dayCount; i++) {
                // var d1 = Date.today(startdate);
                var d1 = new Date(startdate);
                d1.addDays(i);
                var todaysDate = d1.toString("d-MMM-yyyy");           
                var dayofWeek = d1.getDayName();
                var starttime = myWorkSchedule[dayofWeek].start;
                var endtime = myWorkSchedule[dayofWeek].end;
                var dow = d1.getDay();

                // Inject space into time to appease date parser
                starttime = starttime.replace('am', ' am');
                starttime = starttime.replace('pm', ' pm');
                endtime = endtime.replace('am', ' am');
                endtime = endtime.replace('pm', ' pm');
                
                d1 = new Date(todaysDate + ' ' + starttime);
                d2 = new Date(todaysDate + ' ' + endtime);
                
                // Calculate segments based on duration between starttime and endtime, divided by segment minutes
                workMinutes = getMinutesBetweenDates(d1, d2);
                segments = workMinutes / slotMinutes;
                slots = [];
                for (j = 0; j < segments; j++) {
                    slot = d1.clone();
                    
                    // if this is a staffer's workday, then set 'booked' to false so clients can book appointments
                    var isBooked = !myWorkSchedule[dayofWeek].work;
                    
                    // Has slot expired?
                    if( slot < new Date.now ){
                        isBooked = true;
                    }                    
                    
                    slots.push({
                        'booked': isBooked
                        , 'start': slot.toString("hh:mm tt")
                        , 'timestamp': slot
                    });
                    d1.addMinutes(slotMinutes);
                };
                day = {
                    'todaysDate': todaysDate
                    , 'dayofWeek': dayofWeek
                    , 'dow': dow
                    , 'timeslots': slots
                };
                days.push(day);
            };
            $scope.days = days;
            
            
            // Now we block out time slots based on current bookings
            firebase.database().ref('/bookings/' + staffID).on('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {                    
                    var bookingDate = childSnapshot.key;
                    var bookingDetails = childSnapshot.val();
                    var startOfBooking = new Date(bookingDate);
                    var pastBooking = startOfBooking.compareTo(Date.today()) == -1 ? true : false;
                    
                    if( !pastBooking ) {
                        var endOfBooking = startOfBooking.clone().addMinutes(bookingDetails.minutesToComplete - 1);
                    
                        // Loop thru bookings to block out time slots on view 
                        days.forEach(function (day) {
                            day.timeslots.forEach(function (slot, index) {
                                if( slot.timestamp.between(startOfBooking, endOfBooking)) {
                                    slot.booked = true;
                                };
                                
                                if( day.timeslots.length - 1 === index ) { // Last slot of the day?
                                    // if this service takes longer than the last timeslot of the day, block if no overflow 
                                    if( serviceTime > slotMinutes ) {
                                        if( !allowOverflow ) {
                                            slot.booked = true;
                                        }
                                    }
                                }
                                
                                if( slotsRequired > (day.timeslots.length - index) ) {
                                    if( !allowOverflow ) {
                                        slot.booked = true;
                                    };
                                };
                            });
                        });
                    
                        // Make a second pass and block out slots where there's not enough contiguous time for service
                        days.forEach(function (day) {
                            day.timeslots.forEach(function (slot, index) {
                                if( !day.timeslots[index].booked ) {        // Open slot?
                                    for(i = 0; i < slotsRequired; i++) {
                                        tempix = index + i;
                                        if( tempix < day.timeslots.length ) {
                                            startofAppointment = new Date(day.timeslots[tempix].timestamp);
                                            endofAppointment = startofAppointment.clone().addMinutes(slotMinutes);
                                            
                                            // End of a booking falls between an appointment slot (we have not blocked out yet, so BLOCK!)
                                            if( endOfBooking.between(startofAppointment, endofAppointment)) {
                                                day.timeslots[index].booked = true;
                                            };
                                        };
                                    };
                                };
                            });                    
                        });
                    };  // if not pastBooking
                });
                
                // Update the view
                $scope.$apply();
                $('.time-slot input:not(:checked) ~ label').css({'background-color':'#'+$scope.company.highlightcolor});
            });
        }; // generateBookingCalendar
      
      } // end main function                                    
]); // Controller
