const express = require('express');
const crypto = require('crypto');
const passport = require('passport');
const { protect } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

const googleOauthEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CALLBACK_URL
);

const frontendBaseUrl = (
  process.env.FRONTEND_URL ||
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000')
).replace(/\/+$/, '');

const oauthConfigured = googleOauthEnabled && Boolean(frontendBaseUrl);

const STATE_COOKIE = 'oauth_state';

// Login-CSRF protection: bind the OAuth flow to this browser with a random
// `state` value stored in an httpOnly cookie and verified on the callback.
const startGoogleAuth = (req, res, next) => {
  const state = crypto.randomBytes(24).toString('hex');
  res.cookie(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 10 * 60 * 1000
  });
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    state
  })(req, res, next);
};

const verifyOauthState = (req, res, next) => {
  const expected = req.cookies && req.cookies[STATE_COOKIE];
  const received = typeof req.query.state === 'string' ? req.query.state : '';
  res.clearCookie(STATE_COOKIE);

  const a = Buffer.from(expected || '');
  const b = Buffer.from(received);
  if (!expected || a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.redirect(`${frontendBaseUrl}/login?error=google`);
  }
  next();
};

if (oauthConfigured) {
  router.get('/google', startGoogleAuth);

  router.get(
    '/google/callback',
    verifyOauthState,
    passport.authenticate('google', { session: false, failureRedirect: `${frontendBaseUrl}/login?error=google` }),
    authController.googleCallback
  );
} else {
  router.get('/google', (_req, res) => {
    res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL, and FRONTEND_URL in environment variables.'
    });
  });

  router.get('/google/callback', (_req, res) => {
    res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL, and FRONTEND_URL in environment variables.'
    });
  });
}

router.get('/me', protect, authController.me);

module.exports = router;
