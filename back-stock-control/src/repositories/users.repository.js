const prisma = require('../lib/prisma')

const findByEmail = async (email) => {
  const rows = await prisma.$queryRaw`
    SELECT id, email, full_name, dni, password_hash, role, created_at
    FROM users WHERE LOWER(email) = LOWER(${email}) LIMIT 1`
  return rows[0] ?? null
}

const findById = async (id) => {
  const rows = await prisma.$queryRaw`
    SELECT id, email, full_name, dni, role, created_at FROM users WHERE id = ${id} LIMIT 1`
  return rows[0] ?? null
}

const findAll = () =>
  prisma.$queryRaw`SELECT id, email, full_name, dni, role, created_at FROM users ORDER BY full_name`

const create = async ({ email, fullName, dni, passwordHash, role }) => {
  const rows = await prisma.$queryRaw`
    INSERT INTO users (email, full_name, dni, password_hash, role)
    VALUES (${email}, ${fullName}, ${dni}, ${passwordHash}, ${role})
    RETURNING id, email, full_name, dni, role, created_at`
  return rows[0]
}

const update = async (id, fields) => {
  const { email, fullName, dni, passwordHash, role } = fields
  if (passwordHash) {
    await prisma.$executeRaw`
      UPDATE users SET email = ${email}, full_name = ${fullName}, dni = ${dni}, password_hash = ${passwordHash}, role = ${role}
      WHERE id = ${id}`
  } else {
    await prisma.$executeRaw`
      UPDATE users SET email = ${email}, full_name = ${fullName}, dni = ${dni}, role = ${role}
      WHERE id = ${id}`
  }
  return findById(id)
}

const remove = (id) => prisma.$executeRaw`DELETE FROM users WHERE id = ${id}`

module.exports = { findByEmail, findById, findAll, create, update, remove }
