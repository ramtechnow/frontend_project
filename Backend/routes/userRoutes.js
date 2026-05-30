const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { fetchUser, fetchAdmin } = require('../middleware/auth');

// Auth routes
router.post('/signup', userController.signup);
router.post('/login', userController.login);

// Cart routes
router.get('/getcart', fetchUser, userController.getCart);
router.post('/addtocart', fetchUser, userController.addToCart);
router.post('/removefromcart', fetchUser, userController.removeFromCart);

// Admin routes
router.get('/admin/users', fetchAdmin, userController.getAllUsers);
router.post('/admin/updateuserrole', fetchAdmin, userController.updateUserRole);
router.post('/admin/deleteuser', fetchAdmin, userController.deleteUser);

module.exports = router;
