const pool = require('../db');

/**
 * Get stock summary by category for a specific branch
 * @param {*} req - Express request object (expects branch_id in params)
 * @param {*} res - Express response object
 */
const getStockSummaryByCategory = async (req, res) => {
  const { id: branchId } = req.params;

  try {
    // 1. Validar que el branch exista (opcional pero recomendable)
    const branchCheck = await pool.query('SELECT * FROM branches WHERE id = $1', [branchId]);
    if (branchCheck.rowCount === 0) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    // 2. Ejecutar la consulta SQL para agrupar stock por categoría
    const query = `
      SELECT 
        p.category,
        SUM(s.total) AS total
      FROM stock s
      JOIN products p ON s.product_id = p.id
      WHERE s.branch_id = $1
      GROUP BY p.category
      ORDER BY total DESC
    `;
    const result = await pool.query(query, [branchId]);

    // 3. Devolver los resultados como JSON
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching stock summary by category:', error);
    res.status(500).json({ error: 'Error fetching stock summary' });
  }
};

module.exports = {
  getStockSummaryByCategory,
};