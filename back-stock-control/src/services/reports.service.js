const repo = require('../repositories/reports.repository')

const getStockReport = async (filters) => {
  const [rows, categories] = await Promise.all([
    repo.getStockReport(filters),
    repo.getStockCategories()
  ])

  // Collect ordered branch list from data
  const branchMap = new Map()
  for (const r of rows) {
    if (!branchMap.has(r.branch_id)) branchMap.set(r.branch_id, r.branch_name)
  }
  const branches = [...branchMap.entries()].map(([id, name]) => ({ id, name }))

  // Pivot rows into products
  const productMap = new Map()
  for (const r of rows) {
    if (!productMap.has(r.product_id)) {
      productMap.set(r.product_id, {
        product_id: r.product_id,
        product_name: r.product_name,
        category_name: r.category_name,
        stock: {}
      })
    }
    productMap.get(r.product_id).stock[r.branch_id] = r.total
  }

  const products = [...productMap.values()].map(p => ({
    ...p,
    total: Object.values(p.stock).reduce((sum, v) => sum + v, 0)
  }))

  return { branches, products, categories }
}

module.exports = { getStockReport }
