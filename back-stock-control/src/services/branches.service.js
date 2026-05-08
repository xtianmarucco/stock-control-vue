const repo = require('../repositories/branches.repository')
const { createError } = require('../utils/handleError')

const getAll = () => repo.findAll()

const getById = async (id) => {
  const branch = await repo.findById(id)
  if (!branch) throw createError('Branch not found', 'NOT_FOUND', 404)
  return branch
}

const getStockSummaryByCategory = async (branchId) => {
  await getById(branchId)
  return repo.findStockSummaryByCategory(branchId)
}

const getStockByBranch = async (branchId, category) => {
  const branch = await getById(branchId)
  const products = await repo.findStockByBranch(branchId, category)
  return {
    branch: { id: branch.id, name: branch.name },
    products: products.map(p => ({
      ...p,
      total: p.stock_total,
      low_stock: p.stock_total <= 3 * (p.unidades_x_pack ?? 1)
    }))
  }
}

const create = async ({ name, address }) => {
  if (!name?.trim()) throw createError('Name is required', 'VALIDATION_ERROR', 400)
  return repo.create({ name: name.trim(), address: address?.trim() || null })
}

const update = async (id, { name, address }) => {
  await getById(id)
  if (!name?.trim()) throw createError('Name is required', 'VALIDATION_ERROR', 400)
  return repo.update(id, { name: name.trim(), address: address?.trim() || null })
}

const remove = async (id) => {
  await getById(id)
  return repo.remove(id)
}

module.exports = { getAll, getById, getStockSummaryByCategory, getStockByBranch, create, update, remove }
