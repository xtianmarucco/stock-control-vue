const prisma = require('../lib/prisma')

const getSummary = async () => {
  const [totalStock, lowStockCount, branchCount, movementsCount] = await Promise.all([
    prisma.$queryRaw`SELECT COALESCE(SUM(total), 0) AS total FROM branch_stock`,
    prisma.$queryRaw`SELECT COUNT(*) AS count FROM branch_stock WHERE total <= 3`,
    prisma.$queryRaw`SELECT COUNT(*) AS count FROM branches WHERE is_active = true`,
    prisma.$queryRaw`
      SELECT COUNT(*) AS count FROM stock_movements
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `
  ])

  return {
    total_stock: Number(totalStock[0].total),
    low_stock_count: Number(lowStockCount[0].count),
    active_branches_count: Number(branchCount[0].count),
    movements_last_7_days: Number(movementsCount[0].count)
  }
}

const getRecentMovements = () =>
  prisma.$queryRaw`
    SELECT
      sm.id,
      sm.movement_type,
      sm.created_at,
      fb.name AS from_branch_name,
      tb.name AS to_branch_name,
      u.full_name AS created_by,
      COUNT(smi.id) AS items_count
    FROM stock_movements sm
    LEFT JOIN branches fb ON sm.from_branch_id = fb.id
    LEFT JOIN branches tb ON sm.to_branch_id = tb.id
    LEFT JOIN users u ON sm.user_id = u.id
    LEFT JOIN stock_movement_items smi ON smi.movement_id = sm.id
    GROUP BY sm.id, fb.name, tb.name, u.full_name
    ORDER BY sm.created_at DESC
    LIMIT 8
  `

const getLowStockProducts = () =>
  prisma.$queryRaw`
    SELECT
      p.name AS product_name,
      p.category_name,
      b.name AS branch_name,
      bs.total
    FROM branch_stock bs
    JOIN products p ON bs.product_id = p.id
    JOIN branches b ON bs.branch_id = b.id
    WHERE bs.total <= 3
    ORDER BY bs.total ASC, p.name ASC
    LIMIT 20
  `

const getCategories = () =>
  prisma.$queryRaw`
    SELECT DISTINCT p.category_name
    FROM branch_stock bs
    JOIN products p ON bs.product_id = p.id
    ORDER BY p.category_name
  `

module.exports = { getSummary, getRecentMovements, getLowStockProducts, getCategories }
