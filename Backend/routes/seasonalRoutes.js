const express = require('express');
const router = express.Router();
const seasonalController = require('../controllers/seasonalController');
const { fetchAdmin } = require('../middleware/auth');

// Public route to get active announcement & particles settings
router.get('/api/seasonal/active', seasonalController.getSeasonalPromo);

// Admin-only route to save/update configurations
router.post('/admin/seasonal/save', fetchAdmin, seasonalController.saveSeasonalPromo);

module.exports = router;
