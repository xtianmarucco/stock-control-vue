const express = require('express');
const router = express.Router();
const { createStockMovement,getStockMovements } = require('../controllers/stockMovements.controller');
console.log('✅ stockMovements routes loaded');
router.post('/', createStockMovement);
router.get("/", getStockMovements);
console.log('✅ stockMovements routes loaded');

module.exports = router;