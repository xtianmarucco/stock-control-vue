const pool = require('../db');

/**
 * GET /api/products
 * Devuelve todos los productos con campos básicos
 */
const getAllProducts = async (req, res) => {
  try {
    const query = `
      SELECT 
        id, sku, name, category_name, brand_name,
        image_url, weight
      FROM products
      ORDER BY name
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching all products:', error);
    res.status(500).json({ error: 'Error fetching products' });
  }
};

/**
 * GET /api/products/category/:category
 * Devuelve productos por categoría (coincidencia exacta)
 */
const getProductsByCategory = async (req, res) => {
  const { category } = req.params;

  try {
    const query = `
      SELECT 
        id, sku, name, category_name, brand_name,
        image_url, weight
      FROM products
      WHERE category_name = $1
      ORDER BY name
    `;
    const result = await pool.query(query, [category]);
    res.json(result.rows);
  } catch (error) {
    console.error(`❌ Error fetching products by category: ${category}`, error);
    res.status(500).json({ error: 'Error fetching category products' });
  }
};

module.exports = {
  getAllProducts,
  getProductsByCategory,
};

/**
 * GET /api/products/with-stock
 * Devuelve todos los productos con stock total sumado por producto
 * Si se pasa ?branch=ID → filtra por sucursal
 */
const getProductsWithStock = async (req, res) => {
  const branchId = req.query.branch;

  try {
    // Base query con LEFT JOIN para incluir productos sin stock
    const query = `
      SELECT 
        p.id,
        p.name,
        p.category_name,
        p.brand_name,
        p.image_url,
        p.weight,
        COALESCE(SUM(s.total), 0) AS stock
      FROM products p
      LEFT JOIN stock s ON s.product_id = p.id
      ${branchId ? 'WHERE s.branch_id = $1' : ''}
      GROUP BY p.id, p.name, p.category_name, p.brand_name, p.image_url, p.weight
      ORDER BY p.name;
    `;

    const result = branchId
      ? await pool.query(query, [branchId])
      : await pool.query(query);

    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching products with stock:', error);
    res.status(500).json({ error: 'Error fetching products with stock' });
  }
};

module.exports = {
  getAllProducts,
  getProductsByCategory,
  getProductsWithStock, // ✅ nuevo
};