import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const usersRepo = require('../repositories/users.repository')
const bcrypt = require('bcrypt')
const { login } = require('../services/auth.service')

const mockUser = {
  id: 1,
  email: 'admin@heladeria.com',
  full_name: 'Admin',
  role: 'admin',
  password_hash: '$2b$10$hashedpassword',
}

beforeEach(() => {
  vi.spyOn(usersRepo, 'findByEmail').mockResolvedValue(null)
  vi.spyOn(bcrypt, 'compare').mockResolvedValue(false)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('login', () => {
  it('lanza VALIDATION_ERROR si falta el email', async () => {
    await expect(login('', 'password123'))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('lanza VALIDATION_ERROR si falta la contraseña', async () => {
    await expect(login('admin@heladeria.com', ''))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('lanza UNAUTHORIZED si el usuario no existe', async () => {
    usersRepo.findByEmail.mockResolvedValue(null)
    await expect(login('noexiste@mail.com', 'pass'))
      .rejects.toMatchObject({ code: 'UNAUTHORIZED', status: 401 })
  })

  it('lanza UNAUTHORIZED si la contraseña es incorrecta', async () => {
    usersRepo.findByEmail.mockResolvedValue(mockUser)
    bcrypt.compare.mockResolvedValue(false)
    await expect(login('admin@heladeria.com', 'wrongpass'))
      .rejects.toMatchObject({ code: 'UNAUTHORIZED', status: 401 })
  })

  it('retorna los datos del usuario si las credenciales son válidas', async () => {
    usersRepo.findByEmail.mockResolvedValue(mockUser)
    bcrypt.compare.mockResolvedValue(true)
    const result = await login('admin@heladeria.com', 'correctpass')
    expect(result).toEqual({
      id: 1,
      email: 'admin@heladeria.com',
      full_name: 'Admin',
      role: 'admin',
    })
    expect(result.password_hash).toBeUndefined()
  })
})
