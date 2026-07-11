const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
  },
  password: {
    type: String,
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  cartData: {
    type: Object,
    default: {},
  },
  wishlistData: {
    type: Array,
    default: [],
  },
  addresses: [{
    fullName: { type: String, required: true },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    phone: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
  }],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
