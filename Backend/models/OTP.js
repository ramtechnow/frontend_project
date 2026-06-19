const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
  target: { // Can be a phone number (+91...) or email address
    type: String,
    required: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['login', 'reset'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // Document automatically deleted after 5 minutes (300 seconds)
  }
});

module.exports = mongoose.model('OTP', OTPSchema);
