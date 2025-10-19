const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/stock
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id,
        p.name AS product,
        b.name AS branch,
        s.big_chamber,
        s.small_chamber,
        s.salon_freezer,
        s.total,
        s.updated_at
      FROM stock s
      JOIN products p ON s.product_id = p.id
      JOIN branches b ON s.branch_id = b.id
      ORDER BY b.name, p.name
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching stock:', error);
    res.status(500).json({ error: 'Error fetching stock' });
  }
});

module.exports = router;