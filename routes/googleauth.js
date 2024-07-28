const express = require('express')
const authRoute = express.Router();
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require("../model/userModel")



let userProfile;

authRoute.use(passport.initialize());
authRoute.use(passport.session());

authRoute.get('/success', (req, res) => res.send(userProfile));
authRoute.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
    cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});


passport.use(
    new GoogleStrategy({
    clientID: GOOGLE_AUTH_ID ,
    clientSecret:GOOGLE_AUTH_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
  },

  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log("Google profile", profile);
      let user = await User.findOne({ userEmail: profile.emails[0].value });

      if (!user) {
        user = new User({
          username: profile.displayName,
          userEmail: profile.emails[0].value,
          isBlocked: 0
        });
        await user.save();
      }

      done(null, user);
    } catch (error) {
      console.error("Error in GoogleStrategy:", error);
      done(error, null);
    }
  }
));

authRoute.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email']
  })
);

authRoute.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/signIn' }),
  (req, res) => {
    req.session.user_id = req.user._id
   res.redirect('/')
}
);

module.exports = authRoute;