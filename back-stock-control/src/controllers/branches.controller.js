const pool = require('../db');

/**
 * Get stock summary by category for a specific branch
 * @param {*} req - Express request object (expects branch_id in params)
 * @param {*} res - Express response object
 */
const getStockSummaryByCategory = async (req, res) => {
  const branchId = req.params.id

  try {
    const result = await pool.query(
      `SELECT p.category_name AS category, SUM(s.total) AS total
       FROM stock s
       JOIN products p ON s.product_id = p.id
       WHERE s.branch_id = $1
       GROUP BY p.category_name
       ORDER BY p.category_name`,
      [branchId]
    )

    // Convertimos total a número por si viene como texto
    const data = result.rows.map(row => ({
      category: row.category,
      total: Number(row.total)
    }))

    res.json(data)
  } catch (error) {
    console.error("❌ Error fetching stock summary by category:", error)
    res.status(500).json({ error: "Error fetching stock summary by category" })
  }
}

module.exports = {
  getStockSummaryByCategory,
};