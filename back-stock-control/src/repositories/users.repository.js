const prisma = require('../lib/prisma')

const findByUsername = (username) =>
  prisma.users.findUnique({ where: { username } })

const findById = (id) =>
  prisma.users.findUnique({ where: { id }, select: { id: true, username: true, created_at: true } })

module.exports = { findByUsername, findById }
