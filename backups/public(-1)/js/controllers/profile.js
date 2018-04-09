myApp.controller('ProfileController', ['$scope', '$rootScope', '$firebaseAuth', '$firebaseObject', 'Authentication', '$firebaseArray',
                                           
  function ($scope, $rootScope, $firebaseAuth, $firebaseObject, Authentication, $firebaseArray) {
      
      profUID = $rootScope.currentUser.uid;
      
      console.log('in profile controller. UID=' + profUID);
      
      // Retrieve canceled appointments
      canref = firebase.database().ref('/canceledbookings/' + profUID);
      var cancels = $firebaseArray(canref);
      $scope.cancels = cancels;
      $scope.canceldateOrder = "sortDate";      
      
      $scope.hours = ['0 hrs','1 hrs','2 hrs','3 hrs','4 hrs','5 hrs','6 hrs','7 hrs','8 hrs','9 hrs','10 hrs','11 hrs','12 hrs','13 hrs','14 hrs','15 hrs','16 hrs','17 hrs','18 hrs','19 hrs','20 hrs','21 hrs','22 hrs','23 hrs'];
      $scope.minutes = ['0 mins','5 mins','10 mins','15 mins','20 mins','25 mins','30 mins','35 mins','40 mins','45 mins','50 mins','55 mins'];
      
      $scope.myservdesc = '';
      
      $scope.appointmentFilter = function(appointment) {
          var d = new Date;
          currentTime = d.getTime();
          if( $scope.hidePastAppointments ) {
              return (appointment.sortDate > currentTime )
          }
          return true;
      }
      
      $scope.blockFilter = function(appointment) {
          if( $scope.hideBlockedAppointments && appointment.blockedSlot ) {
            return false;
          }
          return true;
      }      
      
      
      $scope.cancelAppointment = function (item) {
          console.log('in cancel appointment!');
          console.log(item);
            $("#confspecialist").text(item.specialist);
            $("#confbookdate").text(item.date);
            $("#confservice").text(item.service);
            $('#modalCancelConfirm').modal('show');                
            $('#pf_modalYes2').on('click', function () {
                nowTime = new Date();
                ref = firebase.database().ref('/canceledbookings/' + profUID);
                ref.push({
                    client: item.client,
                    clientEmail: item.clientEmail,
                    clientID: item.clientID,
                    clientMobile: item.clientMobile,
                    date: item.date,
                    dateBooked: item.dateBooked,
                    minutesToComplete: item.minutesToComplete,
                    service: item.service,
                    specialist: item.specialist,
                    specialistID: item.specialistID,
                    sortDate: item.sortDate,
                    cancelDate: nowTime.toString()
                });
                $scope.appointments.$remove(item);
                
                emailjs.send("koalasolutions_us","appointment_cancellation",{
                    destination_email:item.clientEmail,
                    company_name: "KOALA SOLUTIONS",
                    reply_to: $scope.user.email,
                    specialist_email: $scope.user.email,
                    specialist_name: $scope.user.firstname + " " + $scope.user.lastname,
                    client_name: item.client,
                    message_html: "Your appointment with <strong>" + $scope.user.firstname + " " + $scope.user.lastname + "</strong> on <strong>" + item.date + "</strong> has been successfully cancelled.",
                    cancel_details: "Cancelled service details: <strong>" + item.service + ' (' + item.minutesToComplete + ' minutes)</strong>'
                });
            });
      }
      
      
      $scope.updateDuration = function (item) {
          Object.keys($scope.user.servicelist).forEach(function (key) {
              if ($scope.user.servicelist[key].serviceKey == item.serviceKey) {
                  ref = firebase.database().ref('/users/' + profUID + '/servicelist/' + $scope.user.servicelist[key].ID);
                  ref.update({
                      'hours': item.hours
                  });
                  ref.update({
                      'minutes': item.minutes
                  });
              };
          });
      }
      
      $scope.updatePricing = function (item) {
          Object.keys($scope.user.servicelist).forEach(function (key) {
              if ($scope.user.servicelist[key].serviceKey == item.serviceKey) {
                  ref = firebase.database().ref('/users/' + profUID + '/servicelist/' + $scope.user.servicelist[key].ID);
                  ref.update({
                      'pricing': item.pricing
                  });
              };
          });
      }
      
      
      // convert firebase objects into arrays of objects so ng likes them.
      $scope.services = [];
      firebase.database().ref('/services').once('value').then(function (snapshot) {
          myserv = snapshot.val();         
          Object.keys(myserv).forEach(function(key) {
              oneobj = {
                        servicecategory: myserv[key].servicecategory,
                        description: myserv[key].description,
                        picURL: myserv[key].picURL,
                        };
              
              var slist = [];
              
              if( typeof myserv[key].servicelist !== 'undefined' ) {
                  myservlist = myserv[key].servicelist;
                  Object.keys(myservlist).forEach(function(key){
                      slist.push({
                                ID: myservlist[key].ID,
                                servicecategory: myservlist[key].servicecategory,
                                category: myservlist[key].category,
                                name: myservlist[key].name,
                                pricing: myservlist[key].pricing,
                                serviceKey: key,
                                hours: '0 hrs',
                                minutes: '30 mins',
                                on: false
                                });

                  });
              };
              oneobj.servicelist = slist;
              $scope.services.push(oneobj);
          });  
          
          // set initial state of services offered by this user (checkboxes)
          firebase.database().ref('/users/' + profUID + '/servicelist').once('value').then(function (snapshot) {
              userservlist = snapshot.val();
              Object.keys(userservlist).forEach(function(key) {
                  $scope.services.forEach(function(item) {
                      item.servicelist.forEach(function(svc) {
                          if( userservlist[key].serviceKey == svc.serviceKey ) {
                              svc.on = true;
                              svc.hours = userservlist[key].hours;
                              svc.minutes = userservlist[key].minutes;
                              svc.pricing = userservlist[key].pricing;
                              svc.description = userservlist[key].description;
                              svc.name = userservlist[key].name;
                              svc.ID = userservlist[key].ID;
                              svc.serviceKey = userservlist[key].serviceKey;
                              svc.servicecategory = userservlist[key].servicecategory;
                          }
                      });
                  })
              });
          });
                                                                                          
          $scope.$apply();  
      });
      
      /* Get user's profile */
      uref = firebase.database().ref('/users/' + profUID);
      var obj = $firebaseObject(uref);
      $scope.user = obj;
      obj.$bindTo($scope, "user");
      
      obj.$loaded(function(){
          if( typeof $scope.user.monday === 'undefined') {
              $scope.user.monday = initializeHours();
          } 
          if (typeof $scope.user.tuesday === 'undefined') {
              $scope.user.tuesday = initializeHours();
          };
          if (typeof $scope.user.wednesday === 'undefined') {
              $scope.user.wednesday = initializeHours();
          };
          if (typeof $scope.user.thursday === 'undefined') {
              $scope.user.thursday = initializeHours();
          };
          if (typeof $scope.user.friday === 'undefined') {
              $scope.user.friday = initializeHours();
          };
          if (typeof $scope.user.saturday === 'undefined') {
              $scope.user.saturday = initializeHours();
          };
          if (typeof $scope.user.sunday === 'undefined') {
              $scope.user.sunday = initializeHours();
          };
          
          if(!$scope.user.profilepic) {
              $scope.user.profilepic = '';
          } else {
              $('#addProfileImage').attr('src', $scope.user.profilepic);
          };
      });
      
      function initializeHours() {
          obj = {};
          obj.start = "8:00am";
          obj.end = "5:00pm";
          obj.on = false;
          return obj;
      };
      
      $scope.tinymceOptions = {
            height: 320,
            plugins: 'advlist autolink lists link image charmap print preview anchor searchreplace visualblocks code fullscreen insertdatetime media table contextmenu paste code',
            toolbar: 'undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media preview'
        };
      
      $scope.checkTimes = function(day) {
          if( typeof day.start === 'undefined' || typeof day.end === 'undefined' ) {
              return
          }
          
          var start = day.start;
          start = start.replace('am',' am').replace('pm', ' pm');
          
          var end = day.end;
          end = end.replace('am',' am').replace('pm', ' pm');
          
          var today = new Date().toString("d-MMM-yyyy");
          
          starter = new Date(today + ' ' + start);
          ender = new Date(today + ' ' + end);
          
          // display warning message if time range does not make sense
          // $$todo
      }
      
      // Load user's profile picture
      $('#fileButton').on('change', function(e) {
          var file = e.target.files[0];
          var metadata = {contentType: 'image/*'};
          var storageRef = firebase.storage().ref().child('images/' + file.name);
          var uploadTask = storageRef.put(file, metadata);
          uploadTask.on('state_changed',
                function progress(snapshot) {
                    var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    $('#uploaderProfile').val(percentage);
                },
                function error(err)  {
                    alert('Image upload failed. Please try again.');
                },
                function complete() {
                    storageRef.getDownloadURL().then(function (url) {
                        $('#addProfileImage').attr('src', url);
                        $scope.user.profilepic = url;
                        $scope.user.filename = file.name;
                        $scope.$apply();
                    });           
                }

        ); // uploadTask.on
    }); 
      
    // Load user's gallery pic
    $('#fileGalleryButton').unbind('change').on('change', function(e) {
      var file = e.target.files[0];
      var metadata = {contentType: 'image/*'};
      var storageRef = firebase.storage().ref().child('images/' + file.name);
      var uploadTask = storageRef.put(file, metadata);
      uploadTask.on('state_changed',
            function progress(snapshot) {
                var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                $('#uploaderGallery').val(percentage);
            },
            function error(err)  {
                alert('Image upload failed. Please try again.');
            },
            function complete() {
                storageRef.getDownloadURL().then(function (url) {
                    //$('#addGalleryImage').attr('src', url);
                    alert('Picture successfully loaded!');
                    var obj = { 'url': url, 'filename': file.name};
                    ref = firebase.database().ref('/users/' + $scope.user.$id);
                    ref.child('gallery').push(file.name).set(obj);
                    $('#uploaderGallery').val(0);
                    $scope.$apply();
                });           
            }
        ); // uploadTask.on
    });
      
    $scope.deleteProfilePic = function() {       
        // Confirm
        $('#modalDeleteImageConfirm').modal('show');
        $('#pf_modalYes').on('click', function () {
            // Delete the file
            console.log('in deleteProfilePic!');
            var storageRef = firebase.storage().ref().child('images/' + $scope.user.filename);
            storageRef.delete().then(function () {
                document.getElementById("addProfileImage").src = '';
                $scope.user.profilepic = '';
                $('#uploaderProfile').val(0);
                $("#fileButton").val('');
                $scope.$apply();
            }).catch(function (error) {
                
            });
        });
    };
      
    $scope.editServiceDescription = function(item) {
        $('#modalEditDescription-sericecategory').val(item.servicecategory);
        firebase.database().ref('/users/' + profUID + '/servicelist/' + item.ID).once('value').then(function (snapshot) {
            if( snapshot.hasChild('description') ) {
                $scope.myservdesc = snapshot.val().description;
            } else {
                $scope.myservdesc = '';
            }
            
            $scope.$apply();
            $('#modalEditDescription').modal('show');

            $('#modalEditDescription-save').unbind('click').on('click', function () {
                Object.keys($scope.user.servicelist).forEach(function (key) {
                  if ($scope.user.servicelist[key].serviceKey == item.serviceKey) {
                      ref = firebase.database().ref('/users/' + profUID + '/servicelist/' + $scope.user.servicelist[key].ID);
                      ref.update({
                          'description': $scope.myservdesc
                      });
                    };
                });             
            });
        
        });
    };      
      
      
    /* Get Global 'company' Services */
    sref = firebase.database().ref('/services');
    var serviceList = $firebaseArray(sref);
    $scope.globalservices = serviceList;      

    /* Add service handler */
    $scope.addService = function (item) {
        console.log('in addService');

        var serviceID = '';
        $scope.globalservices.forEach(function (srv) {
            if (srv.servicecategory == item.servicecategory) {
                serviceID = srv.$id;
            }
        });
        svc = {
            category: item.category
            , servicecategory: item.servicecategory
            , name: item.name
            , pricing: item.pricing
        }

        ref = firebase.database().ref('/services/' + serviceID + '/servicelist');
        var newKey = ref.push(svc).key;
        console.log(newKey);

        $scope.services.forEach(function(srv) {
            if(srv.servicecategory == item.servicecategory) {
                console.log('cat found!');
                console.log(srv.servicelist);
                console.log(item);
                srv.servicelist.push({
                            ID: newKey,
                            servicecategory: item.servicecategory,
                            category: item.category,
                            serviceKey: newKey,
                            name: item.name,
                            pricing: item.pricing,
                            hours: '0 hrs',
                            minutes: '30 mins',
                            on: false
                            }
                );
                console.log(srv.servicelist);
            }
        });

        item.category = '';
        item.name = '';
        item.pricing = '';
    }      


    /* Get global registered users (staff and customers) */
    uref = firebase.database().ref('/users');
    var userList = $firebaseArray(uref);
    $scope.globalusers = userList;        

    /* Delete service handler */
    $scope.deleteService = function (servicecat1, servicecat, serviceKey) {
            console.log('delete service handler!!');
            ref = firebase.database().ref('/services/' + servicecat1.$id + '/servicelist/' + serviceKey);
            ref.remove();
            // Now remove this service in each users servicelist (cascade deletes to users that provide this service)
            $scope.globalusers.forEach(function (u) {
                if (typeof u.servicelist !== 'undefined') {
                    myservlist = u.servicelist;
                    Object.keys(myservlist).forEach(function (key) {
                        if (serviceKey === myservlist[key].serviceKey) {
                            ref = firebase.database().ref('/users/' + u.regUser + '/servicelist/' + myservlist[key].ID);
                            ref.remove();
                        };
                    });
                };
            });

            /* remove local service version */
            var index = 0;
            $scope.services.forEach(function(srv) {
                console.log(srv);
                console.log(servicecat);
                if(srv.servicecategory == servicecat.servicecategory) {
                    srv.servicelist.forEach(function(item){
                        if(item.serviceKey === serviceKey) {
                            console.log('deleting local service item');
                            console.log(srv.servicelist);
                            console.log(index);
                            console.log(srv.servicelist[index]);
                            //delete srv.servicelist[index];
                            srv.servicelist.splice(index, 1);
                        }
                        index++;
                    });
                }
            });
        }    
        
        
        $scope.updateServ = function (servicecat, service, serviceKey) {
            var categoryID = '';
            $scope.globalservices.forEach(function (srv) {
                if (srv.servicecategory == servicecat.servicecategory) {
                    categoryID = srv.$id;
                }
            });
            ref = firebase.database().ref('/services/' + categoryID + '/servicelist/' + serviceKey);
            ref.set(service);
            // Update each user's service list to reflect change to service category
            $scope.globalusers.forEach(function (u) {
                if (typeof u.servicelist !== 'undefined') {
                    myservlist = u.servicelist;
                    Object.keys(myservlist).forEach(function (key) {
                        if (serviceKey === myservlist[key].serviceKey) {
                            ref = firebase.database().ref('/users/' + u.regUser + '/servicelist/' + myservlist[key].ID);
                            ref.update({
                                'servicecategory': service.servicecategory
                                , 'category': service.category
                                , 'name': service.name
                            });
                        };
                    });
                };
            });
        }        
        
        
        
    $scope.deleteGalleryPic = function(item) {
        
        console.log(item);
        
        $('#modalDeleteImageConfirm').modal('show');
        $('#pf_modalYes').on('click', function () {
            Object.keys($scope.user.gallery).forEach(function(key) {
                var found = false;
                if( item.filename === $scope.user.gallery[key].filename && !found ) {
                    ref = firebase.database().ref('/users/' + profUID + '/gallery/' + key); 
                    ref.remove();
                    found = true;
                }
            });

            var storageRef = firebase.storage().ref().child('images/' + item.filename);
            storageRef.delete().then(function () {
            }).catch(function (error) {
                console.log('Error during deleteGalleryPic!');
            });
        });
    };
      
    $scope.toggleService = function(item) {
        console.log('in toggleService!');
        console.log(item);
        
        // if checkbox is checked
        if( item.on ) {
            svc = {};
            svc.category = item.category;
            svc.servicecategory = item.servicecategory;
            svc.name = item.name;
            svc.pricing = item.pricing;
            svc.serviceKey = item.serviceKey;
            svc.hours = item.hours;
            svc.minutes = item.minutes;
            svc.description = '';
            svc.on = true;
            
            // Generate key for service item first so we can save with service object
            ref = firebase.database().ref('/users/' + profUID + '/servicelist');
            var newref = ref.push();
            var mykey = newref.key;
            svc.ID = mykey;
            ref.child(mykey).set(svc);
            
            // Update local version with new ID
            $scope.services.forEach(function(s1) {
                s1.servicelist.forEach(function(s2) {
                    if(s2.serviceKey == item.serviceKey) {
                        s2.ID = svc.ID;
                    }
                });
            });
            
        } else {
            // Match service selected and delete from database and local object since it's been unchecked
            Object.keys($scope.user.servicelist).forEach(function (key) {
                if ($scope.user.servicelist[key].serviceKey == item.serviceKey) {
                    ref = firebase.database().ref('/users/' + profUID + '/servicelist/' + $scope.user.servicelist[key].ID);
                    ref.remove();
                    delete $scope.user.servicelist[$scope.user.servicelist[key].ID];
                };
            });
        };
    }
      
    // Retrieve specialist's appointments
    ref = firebase.database().ref('/bookings/' + profUID);
    var apptsObj = $firebaseArray(ref);
    $scope.appointments = apptsObj;
    $scope.dateOrder = "sortDate"; 

    /* Draw the day-at-a-glance chart */
    apptsObj.$loaded().then(function() {
        var todaySchedule = [['Client', 'Start Time', 'End Time']];
        
        $scope.appointments.forEach(function(appt) {
            var today = Date.today();
            var appointmentDate = new Date(appt.$id);
            if(appointmentDate.compareTo(today) == 1) { 
                var startTime = appointmentDate;
                var endTime = startTime.clone().addMinutes(appt.minutesToComplete);
                if(appt.blockedSlot) {
                    todaySchedule.push(['blocked timeslot', startTime, endTime]);
                } else {
                    todaySchedule.push([appt.client, startTime, endTime]);
                }
            }
        })
        
        if(todaySchedule.length == 1) {
            var d1 = Date.today();
            var todaysDate = d1.toString("d-MMM-yyyy");
            startTime = new Date(todaysDate + ' 7:00 am');
            endTime = new Date(todaysDate + ' 8:00 am');
            todaySchedule.push(['This is generated data!', startTime, endTime]);
            startTime = new Date(todaysDate + ' 8:00 am');
            endTime = new Date(todaysDate + ' 9:00 am');
            todaySchedule.push(['Jeff Probst', startTime, endTime]);
            startTime = new Date(todaysDate + ' 9:30 am');
            endTime = new Date(todaysDate + ' 10:00 am');
            todaySchedule.push(['Gary Dell', startTime, endTime]);
            startTime = new Date(todaysDate + ' 10:30 am');
            endTime = new Date(todaysDate + ' 1:00 pm');
            todaySchedule.push(['Betty Smith', startTime, endTime]);
            startTime = new Date(todaysDate + ' 2:30 pm');
            endTime = new Date(todaysDate + ' 3:00 pm');
            todaySchedule.push(['Ed Knofler', startTime, endTime]);
            startTime = new Date(todaysDate + ' 3:15 pm');
            endTime = new Date(todaysDate + ' 4:00 pm');
            todaySchedule.push(['Tina Yothers', startTime, endTime]);
            startTime = new Date(todaysDate + ' 5:00 pm');
            endTime = new Date(todaysDate + ' 6:00 pm');
            todaySchedule.push(['Robert Rogers', startTime, endTime]);
            startTime = new Date(todaysDate + ' 7:00 pm');
            endTime = new Date(todaysDate + ' 7:15 pm');
            todaySchedule.push(['Janet Howard', startTime, endTime]);
        } 
        
        google.charts.load('current', {'packages':['timeline']});
        google.charts.setOnLoadCallback(drawChart);

        function drawChart() {
            var data = google.visualization.arrayToDataTable(todaySchedule);
          var options = {

          };

          var chart = new google.visualization.Timeline(document.getElementById('daychart'));

          chart.draw(data, options);
        }
    });
    
      
}]); // Controller


