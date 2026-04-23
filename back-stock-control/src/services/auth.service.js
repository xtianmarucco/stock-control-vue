const bcrypt = require('bcrypt')
const usersRepo = require('../repositories/users.repository')
const { createError } = require('../utils/handleError')

const login = async (username, password) => {
  if (!username || !password)
    throw createError('Username and password are required', 'VALIDATION_ERROR', 400)

  const user = await usersRepo.findByUsername(username)
  if (!user) throw createError('Invalid credentials', 'UNAUTHORIZED', 401)

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) throw createError('Invalid credentials', 'UNAUTHORIZED', 401)

  return { id: user.id, username: user.username }
}

module.exports = { login }
