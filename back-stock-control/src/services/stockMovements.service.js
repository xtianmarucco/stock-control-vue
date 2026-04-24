const repo = require('../repositories/stockMovements.repository')
const { createError } = require('../utils/handleError')

const VALID_TYPES = ['TRANSFER', 'ADJUSTMENT', 'INTERNAL']

const getAll = (filters) => repo.findAll(filters)

const getById = async (id) => {
  const movement = await repo.findById(id)
  if (!movement) throw createError('Movement not found', 'NOT_FOUND', 404)
  return formatMovement(movement)
}

const create = async (payload) => {
  const { movement_type, from_branch_id, to_branch_id, reason_category_id, reason, items } = payload

  if (!movement_type || !VALID_TYPES.includes(movement_type))
    throw createError('Invalid or missing movement_type', 'VALIDATION_ERROR', 400)

  const sourceBranchId = Number(from_branch_id)
  const targetBranchId = to_branch_id == null ? null : Number(to_branch_id)
  const reasonCategoryId = reason_category_id == null ? null : Number(reason_category_id)

  if (!sourceBranchId)
    throw createError('from_branch_id is required', 'VALIDATION_ERROR', 400)

  if (!items || !Array.isArray(items) || items.length === 0)
    throw createError('Movement requires at least one item', 'VALIDATION_ERROR', 400)

  if (movement_type === 'TRANSFER') {
    if (!targetBranchId)
      throw createError('to_branch_id is required for TRANSFER', 'VALIDATION_ERROR', 400)
    if (sourceBranchId === targetBranchId)
      throw createError('Branches must be different for TRANSFER', 'VALIDATION_ERROR', 400)
  }

  if (movement_type !== 'TRANSFER' && !reasonCategoryId)
    throw createError('reason_category_id is required for this movement type', 'VALIDATION_ERROR', 400)

  if (movement_type === 'TRANSFER' && reasonCategoryId)
    throw createError('reason_category_id is not allowed for TRANSFER', 'VALIDATION_ERROR', 400)

  if (reasonCategoryId) {
    const reasonCategory = await repo.findReasonCategoryById(reasonCategoryId)

    if (!reasonCategory)
      throw createError('Reason category not found', 'NOT_FOUND', 404)

    if (reasonCategory.movement_type !== movement_type)
      throw createError('reason_category_id does not belong to the selected movement type', 'VALIDATION_ERROR', 400)
  }

  const normalizedItems = normalizeItems(items)
  await validateStockAvailability({ movement_type, from_branch_id: sourceBranchId, items: normalizedItems })

  const movement = await repo.createWithItems({
    movement_type,
    from_branch_id: sourceBranchId,
    to_branch_id: targetBranchId,
    reason_category_id: reasonCategoryId,
    reason,
    items: normalizedItems,
    user_id: payload.user_id
  })
  return { id: movement.id }
}

function normalizeItems(items) {
  return items.map((item, index) => {
    const productId = Number(item.product_id)
    const quantity = Number(item.quantity)

    if (!productId)
      throw createError(`Item ${index + 1}: product_id is required`, 'VALIDATION_ERROR', 400)

    if (!Number.isInteger(quantity) || quantity === 0)
      throw createError(`Item ${index + 1}: quantity must be a non-zero integer`, 'VALIDATION_ERROR', 400)

    return {
      product_id: productId,
      quantity
    }
  })
}

async function validateStockAvailability({ movement_type, from_branch_id, items }) {
  if (movement_type === 'INTERNAL' && items.every(item => item.quantity > 0)) return

  const outgoingItems = items.filter(item => item.quantity < 0 || movement_type === 'TRANSFER')
  if (!outgoingItems.length) return

  const requestedByProductId = new Map()

  for (const item of outgoingItems) {
    const requested = movement_type === 'TRANSFER' ? item.quantity : Math.abs(item.quantity)
    requestedByProductId.set(item.product_id, (requestedByProductId.get(item.product_id) ?? 0) + requested)
  }

  const productIds = [...requestedByProductId.keys()]
  const stockRows = await repo.findSourceStock(from_branch_id, productIds)
  const stockByProductId = new Map(stockRows.map(row => [row.product_id, Number(row.total ?? 0)]))

  for (const [productId, requested] of requestedByProductId.entries()) {
    const available = stockByProductId.get(productId) ?? 0

    if (requested > available) {
      throw createError(
        `Insufficient stock for product ${productId}. Available: ${available}, requested: ${requested}`,
        'INSUFFICIENT_STOCK',
        400
      )
    }
  }
}

function formatMovement(m) {
  return {
    id: m.id,
    movement_type: m.movement_type,
    from_branch_id: m.from_branch_id,
    from_branch_name: m.fromBranch?.name ?? null,
    to_branch_id: m.to_branch_id,
    to_branch_name: m.toBranch?.name ?? null,
    reason_category_id: m.reason_category_id,
    reason_category_label: m.reasonCategory?.label ?? null,
    reason: m.reason,
    created_at: m.created_at,
    created_by: m.createdBy ?? null,
    items: (m.items ?? []).map(i => ({
      product_id: i.product_id,
      product_name: i.product?.name ?? null,
      quantity: i.quantity
    }))
  }
}

module.exports = { getAll, getById, create, formatMovement }
