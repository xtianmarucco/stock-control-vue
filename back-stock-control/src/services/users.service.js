const bcrypt = require('bcrypt')
const repo = require('../repositories/users.repository')
const { createError } = require('../utils/handleError')

const VALID_ROLES = ['admin', 'colaborador']

const getAll = () => repo.findAll()

const getById = async (id) => {
  const user = await repo.findById(id)
  if (!user) throw createError('User not found', 'NOT_FOUND', 404)
  return user
}

const create = async ({ username, password, role }) => {
  if (!username?.trim()) throw createError('Username is required', 'VALIDATION_ERROR', 400)
  if (!password) throw createError('Password is required', 'VALIDATION_ERROR', 400)
  if (!VALID_ROLES.includes(role)) throw createError('Invalid role', 'VALIDATION_ERROR', 400)

  const existing = await repo.findByUsername(username.trim())
  if (existing) throw createError('Username already taken', 'CONFLICT', 409)

  const passwordHash = await bcrypt.hash(password, 10)
  return repo.create({ username: username.trim(), passwordHash, role })
}

const update = async (id, { username, password, role }) => {
  await getById(id)
  if (!username?.trim()) throw createError('Username is required', 'VALIDATION_ERROR', 400)
  if (!VALID_ROLES.includes(role)) throw createError('Invalid role', 'VALIDATION_ERROR', 400)

  const existing = await repo.findByUsername(username.trim())
  if (existing && existing.id !== id) throw createError('Username already taken', 'CONFLICT', 409)

  const passwordHash = password ? await bcrypt.hash(password, 10) : null
  return repo.update(id, { username: username.trim(), passwordHash, role })
}

const remove = async (id, currentUserId) => {
  if (id === currentUserId) throw createError('Cannot delete your own account', 'VALIDATION_ERROR', 400)
  await getById(id)
  return repo.remove(id)
}

module.exports = { getAll, getById, create, update, remove }
