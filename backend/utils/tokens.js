const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const ACCESS_TOKEN_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '10m';
const REFRESH_TOKEN_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '1d';

// Secrets must come from the environment. There are no hardcoded fallbacks:
// in production a missing secret is a fatal misconfiguration; elsewhere an
// ephemeral random secret is generated per process (tokens are invalidated on
// restart) so a forgotten .env can never result in publicly-known signing keys.
const ephemeralSecrets = {};
const getSecret = (primaryName) => {
  const secret = process.env[primaryName] || process.env.JWT_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${primaryName} (or JWT_SECRET) must be set in production`);
  }

  if (!ephemeralSecrets[primaryName]) {
    ephemeralSecrets[primaryName] = crypto.randomBytes(48).toString('hex');
    console.warn(`[security] ${primaryName} is not set; using a temporary random secret for this process.`);
  }
  return ephemeralSecrets[primaryName];
};

const signAccessToken = (user) => {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email },
    getSecret('JWT_ACCESS_SECRET'),
    { expiresIn: ACCESS_TOKEN_EXPIRES }
  );
};

const signRefreshToken = (user) => {
  return jwt.sign(
    { sub: user._id.toString(), tokenType: 'refresh' },
    getSecret('JWT_REFRESH_SECRET'),
    { expiresIn: REFRESH_TOKEN_EXPIRES }
  );
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, getSecret('JWT_ACCESS_SECRET'));
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, getSecret('JWT_REFRESH_SECRET'));
};

const getTokenExpirationDate = (token) => {
  const payload = jwt.decode(token);
  if (!payload || !payload.exp) {
    return null;
  }
  return new Date(payload.exp * 1000);
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_EXPIRES,
  getTokenExpirationDate
};
