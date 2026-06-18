const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { fetchUser, fetchAdmin } = require('../middleware/auth');

// ── Admin routes ─────────────────────────────────────────────────────────────
router.post('/admin/coupons/create', fetchAdmin, couponController.createCoupon);
router.get('/admin/coupons', fetchAdmin, couponController.getAllCoupons);
router.post('/admin/coupons/toggle', fetchAdmin, couponController.toggleCoupon);
router.post('/admin/coupons/delete', fetchAdmin, couponController.deleteCoupon);

// ── User routes ───────────────────────────────────────────────────────────────
router.post('/applycoupon', fetchUser, couponController.applyCoupon);

module.exports = router;
