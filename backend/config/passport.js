const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const configurePassport = () => {
  const googleOauthEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CALLBACK_URL
  );

  if (!googleOauthEnabled) {
    console.warn('Google OAuth is not configured. Skipping Google strategy setup.');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        passReqToCallback: true
      },
      async (_req, _accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          const googleId = profile.id;

          if (!email) {
            return done(new Error('Google account has no email'));
          }

          let user = await User.findOne({ googleId });
          if (user) {
            if (!user.emailVerified) {
              user.emailVerified = true;
              await User.saveWithUniqueStudentId(user);
            }
            return done(null, user);
          }

          user = await User.findOne({ email });
          if (user) {
            user.googleId = googleId;
            if (!user.emailVerified) {
              // Pre-account takeover protection: the local account was never
              // verified, so whoever registered it may not own this email.
              // Drop every local credential/session and make Google the only
              // way in.
              user.passwordHash = undefined;
              user.refreshTokenHash = undefined;
              user.emailOtpHash = undefined;
              user.emailOtpExpires = undefined;
              user.emailOtpSentAt = undefined;
              user.passwordResetOtpHash = undefined;
              user.passwordResetOtpExpires = undefined;
              user.passwordResetTokenHash = undefined;
              user.passwordResetTokenExpires = undefined;
              user.provider = 'google';
              user.emailVerified = true;
            } else {
              user.provider = user.provider === 'local' ? 'both' : user.provider;
            }
            await User.saveWithUniqueStudentId(user);
            return done(null, user);
          }

          const fullName = profile.displayName || profile.name?.givenName || 'Google User';

          user = await User.createWithUniqueStudentId({
            email,
            fullName,
            googleId,
            provider: 'google',
            emailVerified: true
          });

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};

module.exports = { configurePassport };
