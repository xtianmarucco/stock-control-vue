// src/routes/products.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products' });
  }
});

module.exports = router;