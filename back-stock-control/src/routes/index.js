const express = require('express');
const router = express.Router();

const productsRoutes = require('./products.routes');
const branchesRoutes = require('./branches.routes');
const stockRoutes = require('./stock.routes');
const stockMovementsRoutes = require('./stockMovements.routes');

router.use('/products', productsRoutes);
router.use('/branches', branchesRoutes);
router.use('/stock', stockRoutes);
router.use('/stock-movements', stockMovementsRoutes);

module.exports = router;