myApp.controller('AdminController', ['$scope', '$rootScope', '$firebaseAuth', '$firebaseArray', '$firebaseObject', 'Authentication'
  
    , function ($scope, $rootScope, $firebaseAuth, $firebaseArray, $firebaseObject, Authentication) {
        console.log('in admin controller!');
        $scope.tinymceOptions = {
            height: 300
            , plugins: 'advlist autolink lists link image charmap print preview anchor searchreplace visualblocks code fullscreen insertdatetime media table contextmenu paste code'
            , toolbar: 'undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media preview'
        };
        
       // get ALL appointments and load into array 
      $scope.appointments = [];
      firebase.database().ref('/bookings').once('value').then(function (snapshot) {
          myusers = snapshot.val(); 
          Object.keys(myusers).forEach(function(key) {
              mybookings = myusers[key];
              Object.keys(mybookings).forEach(function(key1) {
                  bookingObj = {
                      client: mybookings[key1].client,
                      clientEmail: mybookings[key1].clientEmail,
                      clientID: mybookings[key1].clientID,
                      clientMobile: mybookings[key1].clientMobile,
                      date: mybookings[key1].date,
                      dateBooked: mybookings[key1].dateBooked,
                      minutesToComplete: mybookings[key1].minutesToComplete,
                      service: mybookings[key1].service,
                      sortDate: mybookings[key1].sortDate,
                      specialist: mybookings[key1].specialist,
                      specialistID: mybookings[key1].specialistID,
                      deletekey: key1
                  }
                  $scope.appointments.push(bookingObj);
              });
              console.log($scope.appointments);
          });
          $scope.$apply();  
        });
        
        $scope.appointmentFilter = function(appointment) {
          var d = new Date;
          currentTime = d.getTime();
          if( $scope.hidePastAppointments ) {
              return (appointment.sortDate > currentTime )
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
                ref = firebase.database().ref('/canceledbookings/' + item.specialistID);
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
                
                // remove from local array
                var indexitem = 0;
                Object.keys($scope.appointments).forEach(function (key) {
                    if ($scope.appointments[key].deletekey == item.deletekey) {
                        delete $scope.appointments[indexitem];
                        $scope.$apply();
                    };
                    indexitem += 1;
                });
                
                ref = firebase.database().ref('/bookings/' + item.specialistID + '/' + item.deletekey);
                ref.remove();                
                
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
        
        
        /* Get user's info */
        uref = firebase.database().ref('/users/' + profUID);
        var obj = $firebaseObject(uref);
        $scope.user = obj;
        
        /* Get company info */
        cref = firebase.database().ref('/company');
        var obj = $firebaseObject(cref);
        $scope.company = obj;
        obj.$bindTo($scope, "company");
        
        obj.$loaded(function () {
            if (typeof $scope.company.monday === 'undefined') {
                $scope.company.monday = initializeHours();
            }
            if (typeof $scope.company.tuesday === 'undefined') {
                $scope.company.tuesday = initializeHours();
            };
            if (typeof $scope.company.wednesday === 'undefined') {
                $scope.company.wednesday = initializeHours();
            };
            if (typeof $scope.company.thursday === 'undefined') {
                $scope.company.thursday = initializeHours();
            };
            if (typeof $scope.company.friday === 'undefined') {
                $scope.company.friday = initializeHours();
            };
            if (typeof $scope.company.saturday === 'undefined') {
                $scope.company.saturday = initializeHours();
            };
            if (typeof $scope.company.sunday === 'undefined') {
                $scope.company.sunday = initializeHours();
            };
            if (!$scope.company.logopic) {
                $scope.company.logopic = '';
            }
            else {
                $('#addLogoImage').attr('src', $scope.company.logopic);
            };
            
            if( typeof $scope.company.homepagedescription === 'undefined') {
                $scope.company.homepagedescription = '';
            }
            
        });

        function initializeHours() {
            obj = {};
            obj.start = "8:00am";
            obj.end = "5:00pm";
            obj.on = false;
            return obj;
        };
        
        
        /* Get Services */
        sref = firebase.database().ref('/services');
        var serviceList = $firebaseArray(sref);
        $scope.services = serviceList;
        
        /* Get registered users (staff and customers) */
        uref = firebase.database().ref('/users');
        var userList = $firebaseArray(uref);
        $scope.users = userList;
        
        /* Get Products */
        pref = firebase.database().ref('/products');
        var productList = $firebaseArray(pref);
        $scope.products = productList;
        
        
        /* Delete staff member handler */
        $scope.deleteStaffmember = function (item) {
                console.log('delete staff member!!');
                // Confirm staff member delete
                $('#fullName').text(item.firstname + " " + item.lastname);
                $('#modalDeleteConfirm').modal('show');
                $('#pf_modalYes').on('click', function () {
                    $scope.users.$remove(item);
                });
            }
        
            /* Delete user handler */
        $scope.deleteUser = function (item) {
                console.log('delete user!!');
            console.log(item);
                // Confirm user delete
                $('#fullName').text(item.firstname + " " + item.lastname);
                $('#modalDeleteConfirm').modal('show');
                $('#pf_modalYesDeleteUser').on('click', function () {
                    console.log('in remove!!!!!!');
                    $scope.users.$remove(item);
                });
            }
        
            /* Delete service handler */
        $scope.deleteService = function (servicecat, serviceKey) {
                console.log('delete service handler!!');
                // Remove service in the category servicelist
                var categoryID = '';
                $scope.services.forEach(function (srv) {
                    if (srv.servicecategory == servicecat.servicecategory) {
                        categoryID = srv.$id;
                    }
                });
                ref = firebase.database().ref('/services/' + categoryID + '/servicelist/' + serviceKey);
                ref.remove();
                // Now remove this service in each users servicelist (cascade deletes to users that provide this service)
                $scope.users.forEach(function (u) {
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
            }
        
            /* Add service handler */
        $scope.addService = function (item) {
            console.log('in addService');
            var serviceID = '';
            $scope.services.forEach(function (srv) {
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
            ref = firebase.database().ref('/services/' + serviceID);
            ref.child('servicelist').push().set(svc);
            item.category = '';
            item.name = '';
            item.pricing = '';
        }
        $scope.updateServ = function (servicecat, service, serviceKey) {
            var categoryID = '';
            $scope.services.forEach(function (srv) {
                if (srv.servicecategory == servicecat.servicecategory) {
                    categoryID = srv.$id;
                }
            });
            ref = firebase.database().ref('/services/' + categoryID + '/servicelist/' + serviceKey);
            ref.set(service);
            // Update each user's service list to reflect change to service category
            $scope.users.forEach(function (u) {
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
        $scope.updateServiceCategories = function (serviceCat) {
                $scope.services.$save(serviceCat);
                // Update each services's servicecategory field
                myref = firebase.database().ref('/services/' + serviceCat.$id + '/servicelist/');
                var services = $firebaseArray(myref);
                services.$loaded().then(function () {
                    angular.forEach(services, function (item) {
                        serv = {};
                        serv.category = item.category;
                        serv.name = item.name;
                        serv.pricing = item.pricing;
                        serv.servicecategory = serviceCat.servicecategory;
                        $scope.updateServ(serviceCat, serv, item.$id);
                    })
                });
            }
            /* Add SERVICE CATEGORY handler */
        $scope.addServiceCategory = function (item) {
                console.log('in addServiceCategory');
                item.picURL = $('#addServiceCategoryImage').attr('src');
                $scope.services.$add(item);
                $scope.addCatform.servicecategory = null;
                $scope.addCatform.description = null;
                $('#uploader').val(0);
                $("#fileButton").val('');
                $('#addServiceCategoryImage').attr('src', '/images/default.png');
            }
            /* Delete SERVICE CATEGORY handler */
        $scope.deleteServiceCategory = function (item) {
                console.log('in DELETESERVICECATEGORY!');
                console.log(item);
                // Cascade delete of this service category to users (ie. delete from users servicelists)
                myref = firebase.database().ref('/services/' + item.$id + '/servicelist/');
                var services = $firebaseArray(myref);
                services.$loaded().then(function () {
                    angular.forEach(services, function (s) {
                        console.log(s);
                        $scope.deleteService(s.servicecategory, s.$id);
                    });
                });
                // now remove the high-level Service Category entry
                $scope.services.$remove(item);
            }
            /* Toggle staffmember status handler */
        $scope.toggleStaffmember = function (item) {
            console.log('toggle user staffmember flag');
            console.log(item);
            if (item.staffmember) {
                item.staffmember = false;
                // Now deactivate staff member's profile so it does not appear on Specialists page
                $scope.users.forEach(function (member) {
                    if (member.regUser === item.regUser) {
                        alert('staffmember profile deactivated!');
                        member.active = false;
                        $scope.users.$save(member);
                    };
                });
            }
            else {
                item.staffmember = true;
            }
            $scope.users.$save(item);
        }
            /* Toggle service update access handler - if checked, staff member can add/delete services */
        $scope.toggleServiceUpdateAccess = function (item) {
            console.log('toggle service update access flag');
            console.log(item);
            if (item.serviceUpdateAccess) {
                item.serviceUpdateAccess = false;
            }
            else {
                item.serviceUpdateAccess = true;
            }
            $scope.users.$save(item);
        }        
        
        $('#fileButton').on('change', function (e) {
            var file = e.target.files[0];
            var metadata = {
                contentType: 'image/*'
            };
            var storageRef = firebase.storage().ref().child('images/' + file.name);
            var uploadTask = storageRef.put(file, metadata);
            uploadTask.on('state_changed', function progress(snapshot) {
                var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                $('#uploader').val(percentage);
            }, function error(err) {
                alert('Image upload failed. Please try again.');
            }, function complete() {
                storageRef.getDownloadURL().then(function (url) {
                    $('#addServiceCategoryImage').attr('src', url);
                });
                // profile pic handler for deleting
                $('.close').on('click', function () {
                    // Confirm delete
                    $('#modalDeleteConfirm').modal('show');
                    $('#pf_modalYes').on('click', function () {
                        // Delete the file
                        storageRef.delete().then(function () {
                            document.getElementById("addServiceCategoryImage").src = '/images/dominic_profile.png';
                            $('#uploader').val(0);
                            $("#fileButton").val('');
                        }).catch(function (error) {
                            /* console.log('delete pic NOT successful'); */
                        });
                    });
                });
            }); // uploadTask.on
        });
        
        /* Delete company logo */
        $scope.deleteLogoPic = function () {
            // Confirm
            $('#modalDeleteImageConfirm').modal('show');
            $('#pf_modalYes').on('click', function () {
                // Delete the file
                console.log('in deleteImagePic!');
                var storageRef = firebase.storage().ref().child('images/' + $scope.company.filename);
                storageRef.delete().then(function () {
                    document.getElementById("addLogoImage").src = '/images/dominic_profile.png';
                    $scope.company.logopic = '';
                    $scope.company.filename = '';
                    $('#uploaderLogo').val(0);
                    $("#logoButton").val('');
                    $scope.$apply();
                }).catch(function (error) {});
            });
        };
        
        // Load company's logo
        $('#logoButton').on('change', function (e) {
            var file = e.target.files[0];
            var metadata = {
                contentType: 'image/*'
                    };
            var storageRef = firebase.storage().ref().child('images/' + file.name);
            var uploadTask = storageRef.put(file, metadata);
            uploadTask.on('state_changed', function progress(snapshot) {
                var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                $('#uploaderLogo').val(percentage);
            }, function error(err) {
                alert('Image upload failed. Please try again.');
            }, function complete() {
                storageRef.getDownloadURL().then(function (url) {
                    $('#addLogoImage').attr('src', url);
                    $scope.company.logopic = url;
                    $scope.company.filename = file.name;
                    $scope.$apply();
                });
            }); // uploadTask.on
        });
        
        // Main page rotator images
        $('#fileRotatorButton').unbind('change').on('change', function(e) {
          var file = e.target.files[0];
          var metadata = {contentType: 'image/*'};
          var storageRef = firebase.storage().ref().child('images/' + file.name);
          var uploadTask = storageRef.put(file, metadata);
          uploadTask.on('state_changed',
                function progress(snapshot) {
                    var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    $('#uploaderRotator').val(percentage);
                },
                function error(err)  {
                    alert('Image upload failed. Please try again.');
                },
                function complete() {
                    storageRef.getDownloadURL().then(function (url) {
                        //$('#addGalleryImage').attr('src', url);
                        alert('Picture successfully loaded!');
                        var obj = { 'url': url, 'filename': file.name};
                        ref = firebase.database().ref('/company/');
                        ref.child('rotatorpics').push(file.name).set(obj);
                        $('#uploaderRotator').val(0);
                        $scope.$apply();
                    });           
                }
            ); // uploadTask.on
        });
        
        $scope.deleteRotatorPic = function(item) {      
            $('#modalDeleteImageConfirm').modal('show');
            $('#pf_modalYes').on('click', function () {
            Object.keys($scope.company.rotatorpics).forEach(function(key) {
                var found = false;
                if( item.filename === $scope.company.rotatorpics[key].filename && !found ) {
                    ref = firebase.database().ref('/company/rotatorpics/' + key); 
                    ref.remove();
                    found = true;
                }
            });

            var storageRef = firebase.storage().ref().child('images/' + item.filename);
            storageRef.delete().then(function () {
            }).catch(function (error) {
                console.log('Error during deleteRotatorPic!');
            });
        });
    };
        
        
       // Gallery images
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
                        alert('Picture successfully loaded!');
                        var obj = { 'url': url, 'filename': file.name};
                        ref = firebase.database().ref('/company/');
                        ref.child('gallerypics').push(file.name).set(obj);
                        $('#uploaderGallery').val(0);
                        $scope.$apply();
                    });           
                }
            ); // uploadTask.on
        });
        
        $scope.deleteGalleryPic = function(item) {      
            $('#modalDeleteImageConfirm').modal('show');
            $('#pf_modalYes').on('click', function () {
            Object.keys($scope.company.gallerypics).forEach(function(key) {
                var found = false;
                if( item.filename === $scope.company.gallerypics[key].filename && !found ) {
                    ref = firebase.database().ref('/company/gallerypics/' + key); 
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
        
        
        // Footer images
        $('#fileFooterButton').unbind('change').on('change', function(e) {
          var file = e.target.files[0];
          var metadata = {contentType: 'image/*'};
          var storageRef = firebase.storage().ref().child('images/' + file.name);
          var uploadTask = storageRef.put(file, metadata);
          uploadTask.on('state_changed',
                function progress(snapshot) {
                    var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    $('#uploaderFooter').val(percentage);
                },
                function error(err)  {
                    alert('Image upload failed. Please try again.');
                },
                function complete() {
                    storageRef.getDownloadURL().then(function (url) {
                        alert('Picture successfully loaded!');
                        var obj = { 'url': url, 'filename': file.name};
                        ref = firebase.database().ref('/company/');
                        ref.child('footerpics').push(file.name).set(obj);
                        $('#uploaderFooter').val(0);
                        $scope.$apply();
                    });           
                }
            ); // uploadTask.on
        });
        
        $scope.deleteFooterPic = function(item) {      
            $('#modalDeleteImageConfirm').modal('show');
            $('#pf_modalYes').on('click', function () {
            Object.keys($scope.company.footerpics).forEach(function(key) {
                var found = false;
                if( item.filename === $scope.company.footerpics[key].filename && !found ) {
                    ref = firebase.database().ref('/company/footerpics/' + key); 
                    ref.remove();
                    found = true;
                }
            });

            var storageRef = firebase.storage().ref().child('images/' + item.filename);
            storageRef.delete().then(function () {
            }).catch(function (error) {
                console.log('Error during deleteFooterPic!');
            });
        });
    };   
        

    /* Add Product handler */
    $scope.addProduct = function (item) {
        console.log('in add Product');
        item.picURL = $('#addProductImage').attr('src');
        item.gallery1URL = $('#addGallery1Image').attr('src');
        item.gallery2URL = $('#addGallery2Image').attr('src');
        item.gallery3URL = $('#addGallery3Image').attr('src');
        $scope.products.$add(item);
        $scope.addProdform.name = null;
        $scope.addProdform.category = null;
        $scope.addProdform.price = null;
        $scope.addProdform.quantity = null;
        $scope.addProdform.sku = null
        $scope.addProdform.description = null;
        
        $('#produploader').val(0);
        $('#gallery1uploader').val(0);
        $('#gallery2uploader').val(0);
        $('#gallery3uploader').val(0);
        $("#fileButton").val('');
        $('#addProductImage').attr('src', '/images/default.png');
        $('#addGallery1Image').attr('src', '/images/default.png');
        $('#addGallery2Image').attr('src', '/images/default.png');
        $('#addGallery3Image').attr('src', '/images/default.png');
    }
    
    /* Delete Product handler */
    $scope.deleteProduct = function (item) {
        console.log('in DELETE Product!');
        console.log(item);
        $scope.products.$remove(item);
    }    
    
    /* Update product */
    $scope.updateProduct = function (prod) {
        $scope.products.$save(prod);
    }
    
    $('#fileProdButton').on('change', function (e) {
        console.log('in fileProdButton');
        var file = e.target.files[0];
        var metadata = {
            contentType: 'image/*'
        };
        var storageRef = firebase.storage().ref().child('images/' + file.name);
        var uploadTask = storageRef.put(file, metadata);
        uploadTask.on('state_changed', function progress(snapshot) {
            var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            $('#produploader').val(percentage);
        }, function error(err) {
            alert('Image upload failed. Please try again.');
        }, function complete() {
            storageRef.getDownloadURL().then(function (url) {
                $('#addProductImage').attr('src', url);
            });
    
        }); // uploadTask.on
    });

    $('#fileGallery1Button').on('change', function (e) {
        var file = e.target.files[0];
        var metadata = {
            contentType: 'image/*'
        };
        var storageRef = firebase.storage().ref().child('images/' + file.name);
        var uploadTask = storageRef.put(file, metadata);
        uploadTask.on('state_changed', function progress(snapshot) {
            var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            $('#gallery1uploader').val(percentage);
        }, function error(err) {
            alert('Image upload failed. Please try again.');
        }, function complete() {
            storageRef.getDownloadURL().then(function (url) {
                $('#addGallery1Image').attr('src', url);
            });
        });
    });    

    $('#fileGallery2Button').on('change', function (e) {
        var file = e.target.files[0];
        var metadata = {
            contentType: 'image/*'
        };
        var storageRef = firebase.storage().ref().child('images/' + file.name);
        var uploadTask = storageRef.put(file, metadata);
        uploadTask.on('state_changed', function progress(snapshot) {
            var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            $('#gallery2uploader').val(percentage);
        }, function error(err) {
            alert('Image upload failed. Please try again.');
        }, function complete() {
            storageRef.getDownloadURL().then(function (url) {
                $('#addGallery2Image').attr('src', url);
            });
        });
    }); 
        
    $('#fileGallery3Button').on('change', function (e) {
        var file = e.target.files[0];
        var metadata = {
            contentType: 'image/*'
        };
        var storageRef = firebase.storage().ref().child('images/' + file.name);
        var uploadTask = storageRef.put(file, metadata);
        uploadTask.on('state_changed', function progress(snapshot) {
            var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            $('#gallery3uploader').val(percentage);
        }, function error(err) {
            alert('Image upload failed. Please try again.');
        }, function complete() {
            storageRef.getDownloadURL().then(function (url) {
                $('#addGallery3Image').attr('src', url);
            });
        });
    });    
        
    $(document).ready(function() {
      jscolor.installByClassName("jscolor");
    });        
        
}]); // Controller

