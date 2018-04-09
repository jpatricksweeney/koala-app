myApp.controller('AccountController', ['$scope', '$rootScope', '$firebaseAuth', '$firebaseArray', '$firebaseObject', 'Authentication'
  , function ($scope, $rootScope, $firebaseAuth, $firebaseArray, $firebaseObject, Authentication) {
      console.log('in account controller!');
      
      profUID = $rootScope.currentUser.uid;
      
      var d = new Date;
      $scope.currentTime = d.getTime();
      
      // convert firebase objects into an array of objects so ng likes them.
      $scope.appointments = [];
      firebase.database().ref('/bookings').once('value').then(function (snapshot) {
          allbookings = snapshot.val();
          
          if( allbookings ) {
              Object.keys(allbookings).forEach(function (key1) {
                  var myappts = allbookings[key1];
                  Object.keys(myappts).forEach(function (key2) {
                      var myappt = myappts[key2];
                      // we only want this user's appointments
                      if( myappt.clientID === profUID ) {
                        myappt.key = key2;
                        $scope.appointments.push(myappt);
                      }
                  });
              });
              $scope.$apply();
          }
      });

      /* Get user's info */
      uref = firebase.database().ref('/users/' + profUID);
      var obj = $firebaseObject(uref);
      $scope.user = obj;
      obj.$bindTo($scope, "user");
      
        $scope.cancelAppointment = function (item) {
            
            console.log('in cancel appointment');
            console.log(item);
            
            $("#confspecialist").text(item.specialist);
            $("#confbookdate").text(item.date);
            $("#confservice").text(item.service + ' (' + item.minutesToComplete + ' minutes)');
            $('#modalCancelConfirm').modal('show');
            $('#pf_modalYes2').unbind('click').on('click', function () {
                nowTime = new Date();
                ref = firebase.database().ref('/canceledbookings/' + item.specialistID);
                ref.push({
                    client: item.client
                    , clientEmail: item.clientEmail
                    , clientID: item.clientID
                    , clientMobile: item.clientMobile
                    , date: item.date
                    , dateBooked: item.dateBooked
                    , minutesToComplete: item.minutesToComplete
                    , service: item.service
                    , specialist: item.specialist
                    , specialistID: item.specialistID
                    , sortDate: item.sortDate
                    , cancelDate: nowTime.toString()
                });
                
                // Delete booking from firebase
                ref = firebase.database().ref('/bookings/' + item.specialistID + '/' + item.key).once('value').then(function (snapshot) {
                    console.log(snapshot.val());
                    snapshot.ref.remove();
                });               
                
                // Remove from scoped array
                $scope.appointments.forEach( function(appointment,index) {
                    if( appointment.key === item.key ) {
                        $scope.appointments.splice( index, 1 );
                        $scope.$apply();
                    }
                });
                
                emailjs.send("koalasolutions_us", "appointment_cancellation", {
                    destination_email: item.clientEmail
                    , company_name: "KOALA SOLUTIONS"
                    , reply_to: $scope.user.email
                    , specialist_email: $scope.user.email
                    , specialist_name: $scope.user.firstname + " " + $scope.user.lastname
                    , client_name: item.client
                    , message_html: "Your appointment with <strong>" + item.specialist + "</strong> on <strong>" + item.date + "</strong> has been successfully cancelled."
                    , cancel_details: "Cancelled service details: <strong>" + item.service + ' (' + item.minutesToComplete + ' minutes)</strong>'
                });
            });
           
        }
        
        
        $scope.deleteAppointment = function (item) {
            // Delete booking from firebase
            ref = firebase.database().ref('/bookings/' + item.specialistID + '/' + item.key).once('value').then(function (snapshot) {
                console.log(snapshot.val());
                snapshot.ref.remove();
            });

            // Remove from scoped array
            $scope.appointments.forEach( function(appointment,index) {
                if( appointment.key === item.key ) {
                    $scope.appointments.splice( index, 1 );
                    $scope.$apply();
                }
            });
        }        

        
        $scope.appointmentFilter = function (appointment) {
            var d = new Date;
            currentTime = d.getTime();
            if ($scope.hidePastAppointments) {
                return (appointment.sortDate > currentTime)
            }
            return true;
        }
      
}]); // Controller
