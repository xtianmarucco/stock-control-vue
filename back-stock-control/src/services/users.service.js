const bcrypt = require('bcrypt')
const repo = require('../repositories/users.repository')
const { createError } = require('../utils/handleError')

const VALID_ROLES = ['admin', 'colaborador']

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const getAll = () => repo.findAll()

const getById = async (id) => {
  const user = await repo.findById(id)
  if (!user) throw createError('User not found', 'NOT_FOUND', 404)
  return user
}

const create = async ({ email, fullName, dni, password, role }) => {
  if (!email?.trim() || !isValidEmail(email.trim()))
    throw createError('Valid email is required', 'VALIDATION_ERROR', 400)
  if (!fullName?.trim())
    throw createError('Full name is required', 'VALIDATION_ERROR', 400)
  if (!dni?.trim())
    throw createError('DNI is required', 'VALIDATION_ERROR', 400)
  if (!password)
    throw createError('Password is required', 'VALIDATION_ERROR', 400)
  if (!VALID_ROLES.includes(role))
    throw createError('Invalid role', 'VALIDATION_ERROR', 400)

  const existing = await repo.findByEmail(email.trim())
  if (existing) throw createError('Email already in use', 'CONFLICT', 409)

  const passwordHash = await bcrypt.hash(password, 10)
  return repo.create({ email: email.trim().toLowerCase(), fullName: fullName.trim(), dni: dni.trim(), passwordHash, role })
}

const update = async (id, { email, fullName, dni, password, role }) => {
  await getById(id)
  if (!email?.trim() || !isValidEmail(email.trim()))
    throw createError('Valid email is required', 'VALIDATION_ERROR', 400)
  if (!fullName?.trim())
    throw createError('Full name is required', 'VALIDATION_ERROR', 400)
  if (!dni?.trim())
    throw createError('DNI is required', 'VALIDATION_ERROR', 400)
  if (!VALID_ROLES.includes(role))
    throw createError('Invalid role', 'VALIDATION_ERROR', 400)

  const existing = await repo.findByEmail(email.trim())
  if (existing && existing.id !== id) throw createError('Email already in use', 'CONFLICT', 409)

  const passwordHash = password ? await bcrypt.hash(password, 10) : null
  return repo.update(id, { email: email.trim().toLowerCase(), fullName: fullName.trim(), dni: dni.trim(), passwordHash, role })
}

const remove = async (id, currentUserId) => {
  if (id === currentUserId) throw createError('Cannot delete your own account', 'VALIDATION_ERROR', 400)
  await getById(id)
  return repo.remove(id)
}

module.exports = { getAll, getById, create, update, remove }
