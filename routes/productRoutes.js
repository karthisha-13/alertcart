const express = require('express');
const router = express.Router();
const {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  checkProductNow,
} = require('../controllers/productController');

// @route   POST /api/products
// @desc    Add new product to track
router.post('/', addProduct);

// @route   GET /api/products
// @desc    Get all tracked products
router.get('/', getProducts);

// @route   GET /api/products/:id
// @desc    Get single product
router.get('/:id', getProductById);

// @route   PUT /api/products/:id
// @desc    Update product (target price / email)
router.put('/:id', updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete product
router.delete('/:id', deleteProduct);

// @route   POST /api/products/:id/check
// @desc    Manually trigger price check
router.post('/:id/check', checkProductNow);

module.exports = router;
