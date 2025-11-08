const express = require('express');
const router = express.Router();
const { createStockMovement } = require('../controllers/stockMovements.controller');
console.log('✅ stockMovements routes loaded');
router.post('/', createStockMovement);
console.log('✅ stockMovements routes loaded');

module.exports = router;