const prisma = require('../lib/prisma')

const findAll = ({ category, showInactive } = {}) => {
  const where = {}
  if (!showInactive) where.is_available = true
  if (category) where.category_name = category

  return prisma.products.findMany({
    where,
    orderBy: [{ category_name: 'asc' }, { name: 'asc' }]
  })
}

const findById = (id) => prisma.products.findUnique({ where: { id } })

const findCategories = async () => {
  const rows = await prisma.products.groupBy({
    by: ['category_name'],
    orderBy: { category_name: 'asc' }
  })
  return rows.map(r => r.category_name)
}

const findByName = (name) =>
  prisma.products.findFirst({
    where: { name: { equals: name, mode: 'insensitive' } }
  })

const create = async (data) => {
  return prisma.$transaction(async (tx) => {
    const product = await tx.products.create({ data })

    const branches = await tx.branches.findMany({
      where: { is_active: true },
      select: { id: true }
    })

    if (branches.length > 0) {
      await tx.branch_stock.createMany({
        data: branches.map(b => ({ product_id: product.id, branch_id: b.id, total: 0 })),
        skipDuplicates: true
      })
    }

    return product
  })
}

const update = (id, data) => prisma.products.update({ where: { id }, data })

const softDelete = (id) =>
  prisma.products.update({ where: { id }, data: { is_available: false } })

const hardDelete = (id) =>
  prisma.products.delete({ where: { id } })

module.exports = { findAll, findById, findByName, findCategories, create, update, softDelete, hardDelete }
