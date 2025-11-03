const express = require('express');
const router = express.Router();

// Importar los controladores necesarios
const {
  getAllBranches,
  getStockSummaryByCategory,
  getStockByBranch,
} = require('../controllers/branches.controller');

// Ruta para obtener todas las branches
router.get('/', getAllBranches);

// Ruta para obtener el resumen de stock por categoría de una branch específica
router.get('/:id/stock-summary-by-category', getStockSummaryByCategory);

// Nueva ruta para obtener el stock detallado de una branch específica
router.get('/:id/stock', getStockByBranch);

module.exports = router;