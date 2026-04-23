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

  if (!from_branch_id)
    throw createError('from_branch_id is required', 'VALIDATION_ERROR', 400)

  if (!items || !Array.isArray(items) || items.length === 0)
    throw createError('Movement requires at least one item', 'VALIDATION_ERROR', 400)

  if (movement_type === 'TRANSFER') {
    if (!to_branch_id)
      throw createError('to_branch_id is required for TRANSFER', 'VALIDATION_ERROR', 400)
    if (from_branch_id === to_branch_id)
      throw createError('Branches must be different for TRANSFER', 'VALIDATION_ERROR', 400)
  }

  const movement = await repo.createWithItems(payload)
  return { id: movement.id }
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
    items: (m.items ?? []).map(i => ({
      product_id: i.product_id,
      product_name: i.product?.name ?? null,
      quantity: i.quantity
    }))
  }
}

module.exports = { getAll, getById, create, formatMovement }
