const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/branches
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM branches ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching branches:', error);
    res.status(500).json({ error: 'Error fetching branches' });
  }
});

// Importar el controlador que acabamos de crear
const {
  getStockSummaryByCategory,
} = require('../controllers/branches.controller');

// Ruta original: GET /api/branches
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM branches ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching branches:', error);
    res.status(500).json({ error: 'Error fetching branches' });
  }
});

// ✅ Nueva ruta: GET /api/branches/:id/stock-summary-by-category
router.get('/:id/stock-summary-by-category', getStockSummaryByCategory);


module.exports = router;