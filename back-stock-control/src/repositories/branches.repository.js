const prisma = require('../lib/prisma')

const findAll = () =>
  prisma.branches.findMany({ orderBy: { name: 'asc' } })

const findById = (id) =>
  prisma.branches.findUnique({ where: { id } })

const findStockSummaryByCategory = async (branchId) => {
  const rows = await prisma.$queryRaw`
    SELECT p.category_name AS category, SUM(bs.total) AS total
    FROM branch_stock bs
    JOIN products p ON bs.product_id = p.id
    WHERE bs.branch_id = ${branchId}
    GROUP BY p.category_name
    ORDER BY p.category_name
  `
  return rows.map(r => ({ category: r.category, total: Number(r.total) }))
}

const findStockByBranch = async (branchId, category) => {
  const rows = category
    ? await prisma.$queryRaw`
        SELECT p.id, p.name, p.category_name, bs.total AS stock_total
        FROM branch_stock bs
        JOIN products p ON bs.product_id = p.id
        WHERE bs.branch_id = ${branchId} AND p.category_name = ${category}
        ORDER BY p.category_name, p.name
      `
    : await prisma.$queryRaw`
        SELECT p.id, p.name, p.category_name, bs.total AS stock_total
        FROM branch_stock bs
        JOIN products p ON bs.product_id = p.id
        WHERE bs.branch_id = ${branchId}
        ORDER BY p.category_name, p.name
      `

  return rows.map(r => ({
    id: Number(r.id),
    name: r.name,
    category_name: r.category_name,
    stock_total: Number(r.stock_total)
  }))
}

module.exports = { findAll, findById, findStockSummaryByCategory, findStockByBranch }
