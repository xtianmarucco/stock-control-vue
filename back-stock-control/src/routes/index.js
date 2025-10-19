const express = require('express');
const router = express.Router();

// Importar rutas reales acá
const productsRoutes = require('./products.routes');
const branchesRoutes = require('./branches.routes');
const stockRoutes = require('./stock.routes');
router.use('/stock', stockRoutes);

router.use('/products', productsRoutes);
router.use('/branches', branchesRoutes);
router.use('/stock', stockRoutes);

module.exports = router;