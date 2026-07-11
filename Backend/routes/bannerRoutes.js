const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { fetchAdmin } = require('../middleware/auth');

// Public route to fetch banners for home/category pages
router.get('/banners/active', bannerController.getActiveBanners);

// Admin only routes for managing banners
router.post('/admin/banners/create', fetchAdmin, bannerController.createBanner);
router.get('/admin/banners/all', fetchAdmin, bannerController.getAllBanners);
router.post('/admin/banners/toggle', fetchAdmin, bannerController.toggleBannerStatus);
router.post('/admin/banners/delete', fetchAdmin, bannerController.deleteBanner);

module.exports = router;
