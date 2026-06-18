const Coupon = require('../models/Coupon');

// ── Admin: Create coupon ──────────────────────────────────────────────────────
exports.createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxUses, expiresAt } = req.body;
    if (!code || !discountValue) {
      return res.status(400).json({ success: false, error: 'code and discountValue are required' });
    }
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Coupon code already exists' });
    }
    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType: discountType || 'percentage',
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      maxUses: maxUses || 0,
      expiresAt: expiresAt || null,
    });
    await coupon.save();
    res.json({ success: true, coupon });
  } catch (err) {
    console.error('Create coupon error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// ── Admin: List all coupons ───────────────────────────────────────────────────
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// ── Admin: Toggle coupon active/inactive ─────────────────────────────────────
exports.toggleCoupon = async (req, res) => {
  try {
    const { couponId } = req.body;
    const coupon = await Coupon.findById(couponId);
    if (!coupon) return res.status(404).json({ success: false, error: 'Coupon not found' });
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json({ success: true, coupon });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// ── Admin: Delete coupon ──────────────────────────────────────────────────────
exports.deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.body;
    await Coupon.findByIdAndDelete(couponId);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// ── User: Validate & apply coupon ─────────────────────────────────────────────
exports.applyCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code || cartTotal === undefined) {
      return res.status(400).json({ success: false, error: 'code and cartTotal are required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Invalid coupon code' });
    }
    if (!coupon.isActive) {
      return res.status(400).json({ success: false, error: 'This coupon is no longer active' });
    }
    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      return res.status(400).json({ success: false, error: 'This coupon has expired' });
    }
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ success: false, error: 'This coupon has reached its usage limit' });
    }
    if (cartTotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        error: `Minimum order amount for this coupon is $${coupon.minOrderAmount}`
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((cartTotal * coupon.discountValue) / 100);
    } else {
      discountAmount = Math.min(coupon.discountValue, cartTotal);
    }

    const finalTotal = cartTotal - discountAmount;

    res.json({
      success: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      finalTotal,
      message: `Coupon applied! You save $${discountAmount}`
    });
  } catch (err) {
    console.error('Apply coupon error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// ── Internal: Increment used count after order placed ───────────────────────
exports.incrementCouponUsage = async (code) => {
  try {
    if (!code) return;
    await Coupon.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usedCount: 1 } }
    );
  } catch (err) {
    console.warn('Failed to increment coupon usage:', err);
  }
};
