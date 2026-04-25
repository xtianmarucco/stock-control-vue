const prisma = require('../lib/prisma')

const findByUsername = async (username) => {
  const rows = await prisma.$queryRaw`SELECT id, username, password_hash, role, created_at FROM users WHERE username = ${username} LIMIT 1`
  return rows[0] ?? null
}

const findById = async (id) => {
  const rows = await prisma.$queryRaw`SELECT id, username, role, created_at FROM users WHERE id = ${id} LIMIT 1`
  return rows[0] ?? null
}

const findAll = () =>
  prisma.$queryRaw`SELECT id, username, role, created_at FROM users ORDER BY username`

const create = async ({ username, passwordHash, role }) => {
  const rows = await prisma.$queryRaw`
    INSERT INTO users (username, password_hash, role)
    VALUES (${username}, ${passwordHash}, ${role})
    RETURNING id, username, role, created_at
  `
  return rows[0]
}

const update = async (id, fields) => {
  const { username, passwordHash, role } = fields
  if (passwordHash) {
    await prisma.$executeRaw`
      UPDATE users SET username = ${username}, password_hash = ${passwordHash}, role = ${role} WHERE id = ${id}
    `
  } else {
    await prisma.$executeRaw`
      UPDATE users SET username = ${username}, role = ${role} WHERE id = ${id}
    `
  }
  return findById(id)
}

const remove = (id) =>
  prisma.$executeRaw`DELETE FROM users WHERE id = ${id}`

module.exports = { findByUsername, findById, findAll, create, update, remove }
