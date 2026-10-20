const { verifyAccessToken } = require('../utils/tokens');
const User = require('../models/User');
const currencyMiddleware = require('./currencyConverter.middleware');

const protect = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = verifyAccessToken(token);

    // A valid signature is not enough: the account may have been deleted since
    // the token was issued.
    const userExists = await User.exists({ _id: decoded.sub });
    if (!userExists) {
      res.clearCookie('access_token');
      return res.status(401).json({
        success: false,
        message: 'User no longer exists. Please login again.'
      });
    }

    req.userId = decoded.sub;
    req.userEmail = decoded.email;

    // Pipe the request through currency middleware after authentication
    currencyMiddleware(req, res, next);
  } catch (error) {
    res.clearCookie('access_token');
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please login again.'
    });
  }
};

module.exports = { protect };
