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

const create = (data) => prisma.products.create({ data })

const update = (id, data) => prisma.products.update({ where: { id }, data })

const softDelete = (id) =>
  prisma.products.update({ where: { id }, data: { is_available: false } })

module.exports = { findAll, findById, findByName, findCategories, create, update, softDelete }
