const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { fetchAdmin } = require('../middleware/auth');

// Public route to get all products
router.get('/allproducts', productController.getAllProducts);

// Admin route to add a product
router.post('/addproduct', fetchAdmin, productController.addProduct);

// Admin route to remove a product
router.post('/removeproduct', fetchAdmin, productController.removeProduct);

// Admin route to update a product
router.post('/updateproduct', fetchAdmin, productController.updateProduct);

module.exports = router;
