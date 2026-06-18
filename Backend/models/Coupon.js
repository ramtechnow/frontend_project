const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'flat'],
    default: 'percentage',
  },
  discountValue: {
    type: Number,
    required: true, // e.g., 20 means 20% OR flat ₹20 off
  },
  minOrderAmount: {
    type: Number,
    default: 0, // minimum cart total required to apply coupon
  },
  maxUses: {
    type: Number,
    default: 0, // 0 = unlimited
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  expiresAt: {
    type: Date,
    default: null, // null = never expires
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Coupon', CouponSchema);
