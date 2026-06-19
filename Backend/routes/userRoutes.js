const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { fetchUser, fetchAdmin } = require('../middleware/auth');

// Auth routes
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.post('/auth/send-login-otp', userController.sendLoginOtp);
router.post('/auth/verify-login-otp', userController.verifyLoginOtp);
router.post('/auth/forgot-password', userController.forgotPassword);
router.post('/auth/reset-password', userController.resetPassword);

// Cart routes
router.get('/getcart', fetchUser, userController.getCart);
router.post('/addtocart', fetchUser, userController.addToCart);
router.post('/removefromcart', fetchUser, userController.removeFromCart);

// Wishlist routes
router.get('/getwishlist', fetchUser, userController.getWishlist);
router.post('/addtowishlist', fetchUser, userController.addToWishlist);
router.post('/removefromwishlist', fetchUser, userController.removeFromWishlist);

// Admin routes
router.get('/admin/verify', fetchAdmin, userController.verifyAdmin);
router.get('/admin/users', fetchAdmin, userController.getAllUsers);
router.post('/admin/updateuserrole', fetchAdmin, userController.updateUserRole);
router.post('/admin/deleteuser', fetchAdmin, userController.deleteUser);

module.exports = router;
