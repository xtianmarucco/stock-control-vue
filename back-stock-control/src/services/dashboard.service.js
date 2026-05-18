const repo = require('../repositories/dashboard.repository')

const getDashboardData = async () => {
  const [summary, recentMovements, lowStockProducts, categoriesRows] = await Promise.all([
    repo.getSummary(),
    repo.getRecentMovements(),
    repo.getLowStockProducts(),
    repo.getCategories()
  ])

  return {
    ...summary,
    recent_movements: recentMovements.map(m => ({
      id: Number(m.id),
      movement_type: m.movement_type,
      created_at: m.created_at,
      from_branch_name: m.from_branch_name,
      to_branch_name: m.to_branch_name,
      created_by: m.created_by,
      items_count: Number(m.items_count)
    })),
    low_stock_products: lowStockProducts.map(p => ({
      product_name: p.product_name,
      category_name: p.category_name,
      branch_name: p.branch_name,
      total: Number(p.total_packs)
    })),
    categories: categoriesRows.map(r => r.category_name)
  }
}

module.exports = { getDashboardData }
