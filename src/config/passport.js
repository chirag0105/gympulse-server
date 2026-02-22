const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');

// Configure the Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy-client-id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret',
    callbackURL: "/api/auth/google/callback"
},
    async function (accessToken, refreshToken, profile, cb) {
        try {
            const email = profile.emails[0].value;
            const googleId = profile.id;
            const firstName = profile.name.givenName || 'Google';
            const lastName = profile.name.familyName || 'User';

            // Check if user already exists
            let user = await User.findOne({ where: { email } });

            if (user) {
                // Update existing user to link google account if empty
                if (!user.googleId) {
                    user.googleId = googleId;
                    await user.save();
                }
            } else {
                // Create a new client account
                user = await User.create({
                    email,
                    googleId,
                    firstName,
                    lastName,
                    role: 'client'
                    // password is null, which is fine now
                });
            }

            return cb(null, user);
        } catch (err) {
            return cb(err, null);
        }
    }
));

module.exports = passport;
