const prisma = require('../lib/prisma')

const findAll = () =>
  prisma.reason_categories.findMany({
    orderBy: [{ movement_type: 'asc' }, { label: 'asc' }]
  })

const findById = (id) =>
  prisma.reason_categories.findUnique({
    where: { id }
  })

module.exports = { findAll, findById }
