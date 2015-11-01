// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var User            = require('../models/user');

// expose this function to our app using module.exports
module.exports = function(passport) {
    console.log("accessed passport function");
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        console.log("accessed serializeUser");
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
      console.log("accessed deserialize");
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });


    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
        console.log("accessed callback");
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {
          console.log('accessed process...');
        // find a user whose username is the same as the forms username
        // we are checking to see if the user trying to login already exists
          User.findOne({ 'local.username' :  username }, function(err, user) {
              console.log('accessed User.findOne...');
              // if there are any errors, return the error
              if (err){
                console.log(err);
                return done(err);
              }



              // check to see if theres already a user with that username
              if (user) {
                  console.log("user exists!");
                  return done(null, false, {message: 'That username is already taken.'});
              } else {
                  console.log('accessed make new user...');
                  // if there is no user with that username
                  // create the user
                  var newUser            = new User();

                  // set the user's local credentials
                  newUser.local.username    = username;
                  newUser.local.password = newUser.generateHash(password);
                  newUser.local.isAdmin = false;

                  // save the user
                  newUser.save(function(err) {
                      if (err)
                          throw err;
                      return done(null, newUser);
                  });
              }

          });

        });

    }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with username and password from our form
        console.log("accessed login callback");
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.username' :  username }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, {message: 'No user found.'});

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, {message: 'Oops! Wrong password.'});
            // all is well, return successful user
            return done(null, user);
        });

    }));

};