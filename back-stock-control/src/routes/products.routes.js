const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductsByCategory,
  getProductsWithStock,
} = require('../controllers/products.controller');

router.get('/', getAllProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/with-stock', getProductsWithStock); // ✅ nuevo

module.exports = router;