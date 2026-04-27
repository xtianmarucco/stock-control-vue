const prisma = require('../lib/prisma')

const getStockReport = async ({ category } = {}) => {
  const categoryFilter = category ? prisma.$queryRaw`AND p.category_name = ${category}` : prisma.$queryRaw``

  const rows = await prisma.$queryRaw`
    SELECT
      p.id            AS product_id,
      p.name          AS product_name,
      p.category_name,
      b.id            AS branch_id,
      b.name          AS branch_name,
      COALESCE(bs.total, 0) AS total
    FROM products p
    CROSS JOIN branches b
    LEFT JOIN branch_stock bs ON bs.product_id = p.id AND bs.branch_id = b.id
    WHERE b.is_active = true
      AND (${category ?? null}::text IS NULL OR p.category_name = ${category ?? null})
    ORDER BY p.category_name, p.name, b.name
  `

  return rows.map(r => ({
    product_id: Number(r.product_id),
    product_name: r.product_name,
    category_name: r.category_name,
    branch_id: Number(r.branch_id),
    branch_name: r.branch_name,
    total: Number(r.total)
  }))
}

const getStockCategories = async () => {
  const rows = await prisma.$queryRaw`
    SELECT DISTINCT p.category_name
    FROM products p
    ORDER BY p.category_name
  `
  return rows.map(r => r.category_name)
}

module.exports = { getStockReport, getStockCategories }
