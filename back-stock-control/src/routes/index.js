const express = require('express');
const router = express.Router();

// Importar rutas reales acá
const productsRoutes = require('./products.routes');
router.use('/products', productsRoutes);

module.exports = router;