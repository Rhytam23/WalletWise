const crypto = require('crypto');

const generateOtp = () => {
  const value = Math.floor(100000 + Math.random() * 900000);
  return String(value);
};

const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

const otpExpiresAt = (minutes = 10) => new Date(Date.now() + minutes * 60 * 1000);

module.exports = {
  generateOtp,
  hashOtp,
  otpExpiresAt
};
