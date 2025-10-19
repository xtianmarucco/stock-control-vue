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

module.exports = router;