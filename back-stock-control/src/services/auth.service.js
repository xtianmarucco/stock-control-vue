const bcrypt = require('bcrypt')
const usersRepo = require('../repositories/users.repository')
const { createError } = require('../utils/handleError')

const login = async (email, password) => {
  if (!email || !password)
    throw createError('Email and password are required', 'VALIDATION_ERROR', 400)

  const user = await usersRepo.findByEmail(email)
  if (!user) throw createError('Invalid credentials', 'UNAUTHORIZED', 401)

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) throw createError('Invalid credentials', 'UNAUTHORIZED', 401)

  return { id: user.id, email: user.email, full_name: user.full_name, role: user.role }
}

module.exports = { login }
