const prisma = require('../lib/prisma')

const MOVEMENT_INCLUDE = {
  items: { include: { product: true } },
  fromBranch: true,
  toBranch: true,
  reasonCategory: true
}

const enrichWithUser = async (movements) => {
  const arr = Array.isArray(movements) ? movements : [movements]
  const ids = [...new Set(arr.map(m => m.user_id).filter(Boolean))]

  const userMap = new Map()
  if (ids.length) {
    const users = await prisma.$queryRaw`SELECT id, full_name FROM users WHERE id = ANY(${ids}::int[])`
    users.forEach(u => userMap.set(Number(u.id), u))
  }

  const enriched = arr.map(m => ({
    ...m,
    createdBy: m.user_id ? (userMap.get(Number(m.user_id)) ?? null) : null
  }))

  return Array.isArray(movements) ? enriched : enriched[0]
}

const findAll = async (filters = {}) => {
  const { branch_id, type, from, to } = filters
  const where = {}

  if (branch_id) {
    const id = Number(branch_id)
    where.OR = [{ from_branch_id: id }, { to_branch_id: id }]
  }
  if (type) where.movement_type = type
  if (from || to) {
    where.created_at = {}
    if (from) where.created_at.gte = new Date(from)
    if (to) {
      const end = new Date(to)
      end.setDate(end.getDate() + 1)
      where.created_at.lt = end
    }
  }

  const movements = await prisma.stock_movements.findMany({
    where,
    include: MOVEMENT_INCLUDE,
    orderBy: { created_at: 'desc' }
  })

  return enrichWithUser(movements)
}

const findById = async (id) => {
  const movement = await prisma.stock_movements.findUnique({ where: { id }, include: MOVEMENT_INCLUDE })
  if (!movement) return null
  return enrichWithUser([movement]).then(arr => arr[0])
}

const findReasonCategoryById = (id) =>
  prisma.reason_categories.findUnique({ where: { id } })

const findSourceStock = async (branchId, productIds) => {
  if (!productIds.length) return []

  return prisma.branch_stock.findMany({
    where: {
      branch_id: branchId,
      product_id: { in: productIds }
    },
    select: {
      product_id: true,
      total: true
    }
  })
}

const createWithItems = async ({ movement_type, from_branch_id, to_branch_id, reason_category_id, reason, items, user_id }) =>
  prisma.$transaction(async (tx) => {
    const movement = await tx.stock_movements.create({
      data: {
        movement_type,
        from_branch_id,
        to_branch_id: to_branch_id ?? null,
        reason_category_id: reason_category_id ?? null,
        reason: reason ?? null,
        user_id: user_id ?? null
      }
    })

    for (const { product_id, quantity } of items) {
      await tx.stock_movement_items.create({
        data: { movement_id: movement.id, product_id, quantity }
      })

      await upsertStock(tx, from_branch_id, product_id, quantity)

      if (movement_type === 'TRANSFER' && to_branch_id) {
        await upsertStock(tx, to_branch_id, product_id, Math.abs(quantity))
      }
    }

    return movement
  })

async function upsertStock(tx, branchId, productId, quantity) {
  const existing = await tx.branch_stock.findFirst({
    where: { branch_id: branchId, product_id: productId }
  })
  if (existing) {
    await tx.branch_stock.update({
      where: { id: existing.id },
      data: { total: { increment: quantity }, updated_at: new Date() }
    })
  } else {
    await tx.branch_stock.create({
      data: { branch_id: branchId, product_id: productId, total: quantity }
    })
  }
}

module.exports = {
  findAll,
  findById,
  findReasonCategoryById,
  findSourceStock,
  createWithItems
}
