myApp.factory('Authentication', ['$rootScope', '$firebaseAuth', '$firebaseObject'
  , '$location', 'FIREBASE_URL', '$q'
  
    , function ($rootScope, $firebaseAuth, $firebaseObject, $location, FIREBASE_URL, $q) { 
        var config = {
            apiKey: "AIzaSyClUiXfMKmaFpMIUQburqXSOVADz8-ig2U"
            , authDomain: "koala-6f72a.firebaseapp.com"
            , databaseURL: "https://koala-6f72a.firebaseio.com"
            , storageBucket: "koala-6f72a.appspot.com"
            , messagingSenderId: "981643742980"
        };
        
        firebase.initializeApp(config);
        const auth = firebase.auth();
        
        auth.onAuthStateChanged(function (authUser) {
            if (authUser) {
                console.log('in AuthStateChanged');
                console.log(authUser);
                // USING *APPLY* TO FORCE DIGEST CYCLE and thus update of "currentUser"
                $rootScope.$apply(function () {
                    $rootScope.currentUser = authUser;
                    firebase.database().ref('/users/' + authUser.uid).once('value').then(function (snapshot) {
                        console.log('in authstate change ONCE');
                        $rootScope.isAdmin = false;
                        $rootScope.isUser = false;
                        $rootScope.isSpecialist = false;
                        if( snapshot.val().admin ) {
                            $rootScope.isAdmin = true;
                        }
                        if( snapshot.val().staffmember ) {
                            $rootScope.isSpecialist = true;
                        }
                        $rootScope.isUser = true;
                    }); 
                });
            }
            else {
                // No user is currently logged in
                $rootScope.$apply(function () {
                    $rootScope.currentUser = '';
                });
            }
        });
        
        var myObject = {
            
            login: function (user) {
                auth.signInWithEmailAndPassword(
                    user.email, 
                    user.password)
                .then(function (regUser) {
                    // if there's a path override, handle here
                    if( $rootScope.originalPath ) {
                        if( $rootScope.originalPath.indexOf('appointment') > -1 ) {
                            if($rootScope.pathParams.sID) {
                                $location.path('/appointment/' + $rootScope.pathParams.uID + '/' + $rootScope.pathParams.sID);
                            } else {
                                $location.path('/appointment/' + $rootScope.pathParams.uID);
                            }
                            $rootScope.originalPath = null;
                            $rootScope.pathParams.uID = null;
                        }
                    } else {
                        // else route to admin if adminstrator, otherwise profile/user page
                        firebase.database().ref('/users/' + regUser.uid).once('value').then(function (snapshot) {
                            if( snapshot.val().admin ) {
                                $location.path('/account');
                            } else if ( snapshot.val().staffmember ) {
                                $location.path('/profile');
                            } else { // User account
                                $location.path('/account');
                            }
                            $rootScope.$apply();
                        });
                    }
                }).catch(function (error) {
                    console.log('login failed!');
                    $rootScope.message = error.message;
                    $rootScope.$apply();
                });
            },
            
            logout: function () {
                console.log('logout success!');
                $rootScope.message = '';
                auth.signOut();
                
                $rootScope.isAdmin = false;
                $rootScope.isUser = false;
                $rootScope.isSpecialist = false;                
            },
            
            requireAuth: function () {
                // I've simulated $requireAuth since it does not appear to be supported any longer.
                if ($rootScope.currentUser == '') {
                    return $q.reject("AUTH_REQUIRED")
                }
            },
            
            checkAdmin: function () {
                if (!$rootScope.isAdmin) {
                    return $q.reject("NOT_ADMIN")
                }
            },
            
            
            pwReset: function (pw) {
                console.log('in password reset');
                console.log(pw);
                const promise = auth.sendPasswordResetEmail(pw);
                promise.catch(function (e) {
                    console.log('Password Reset Failed!');
                    console.log(e.message);
                });
            },
            
            register: function (user) {
                    console.log('in register new user!');
                    auth.createUserWithEmailAndPassword(user.email, user.password).then(function (regUser) {
                        console.log(regUser.uid);
                        firebase.database().ref('/users/' + regUser.uid).set({
                            email: user.email
                            , firstname: user.firstname
                            , lastname: user.lastname
                            , createdate: new Date().toDateString()
                            , regUser: regUser.uid
                        });
                        myObject.logout();
                        alert('registration successful!');
                        $location.path('/');
                    }).catch(function (error) {
                        console.log('Registration Failed!');
                        console.log(error.message);
                        $rootScope.message = error.message;
                        $rootScope.$apply();
                    });
                    $('#myModalRegistration').modal('hide');
                }
        };
        return myObject;
}]);