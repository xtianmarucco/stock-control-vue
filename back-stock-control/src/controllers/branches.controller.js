// back-stock-control/src/controllers/branches.controller.js
const pool = require('../db');

// 📊 Donut: resumen por categoría
const getStockSummaryByCategory = async (req, res) => {
  const branchId = req.params.id;

  try {
    const result = await pool.query(
      `SELECT p.category_name AS category, SUM(s.total) AS total
       FROM stock s
       JOIN products p ON s.product_id = p.id
       WHERE s.branch_id = $1
       GROUP BY p.category_name
       ORDER BY p.category_name`,
      [branchId]
    );

    const data = result.rows.map(row => ({
      category: row.category,
      total: Number(row.total)
    }));

    res.json(data);
  } catch (error) {
    console.error('❌ Error fetching stock summary by category:', error);
    res.status(500).json({ error: 'Error fetching stock summary by category' });
  }
};

// 🏪 Listado de sucursales
const getAllBranches = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM branches ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching branches:', error);
    res.status(500).json({ error: 'Error fetching branches' });
  }
};

// 📦 Tabla: stock detallado por branch (+ filtro opcional por categoría)
const getStockByBranch = async (req, res) => {
  const { id } = req.params;
  const { category } = req.query;

  try {
    let query = `
      SELECT 
        p.id,
        p.name,
        p.category_name,
        s.total AS stock_total
      FROM stock s
      JOIN products p ON s.product_id = p.id
      WHERE s.branch_id = $1
    `;
    const params = [id];

    if (category) {
      query += ` AND p.category_name = $2`;
      params.push(category);
    }

    query += ` ORDER BY p.category_name, p.name`;

    const result = await pool.query(query, params);

    const data = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      category_name: row.category_name,
      total: Number(row.stock_total)
    }));

    res.json(data);
  } catch (error) {
    console.error('❌ Error fetching stock by branch:', error);
    res.status(500).json({ error: 'Error fetching stock by branch' });
  }
};

module.exports = {
  getStockSummaryByCategory,
  getAllBranches,
  getStockByBranch
};