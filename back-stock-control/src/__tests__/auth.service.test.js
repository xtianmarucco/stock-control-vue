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

// ---------------------------------------------------------------------------
describe('requestPasswordReset', () => {
  const resetsRepo = require('../repositories/passwordResets.repository')
  const mailer = require('../lib/mailer')
  const { requestPasswordReset } = require('../services/auth.service')

  beforeEach(() => {
    vi.spyOn(resetsRepo, 'hasRecentRequest').mockResolvedValue(false)
    vi.spyOn(resetsRepo, 'replaceForUser').mockResolvedValue()
    vi.spyOn(mailer, 'sendMail').mockResolvedValue()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('lanza VALIDATION_ERROR si el email es inválido', async () => {
    await expect(requestPasswordReset('no-es-un-email'))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('no falla ni manda mail si el email no existe', async () => {
    usersRepo.findByEmail.mockResolvedValue(null)
    await expect(requestPasswordReset('noexiste@mail.com')).resolves.toBeUndefined()
    expect(resetsRepo.replaceForUser).not.toHaveBeenCalled()
    expect(mailer.sendMail).not.toHaveBeenCalled()
  })

  it('guarda solo el hash del token y manda el link con el token original', async () => {
    usersRepo.findByEmail.mockResolvedValue(mockUser)
    await requestPasswordReset('admin@heladeria.com')

    const { userId, tokenHash, ttlMinutes } = resetsRepo.replaceForUser.mock.calls[0][0]
    expect(userId).toBe(1)
    expect(ttlMinutes).toBe(30)
    expect(tokenHash).toMatch(/^[a-f0-9]{64}$/)

    const mail = mailer.sendMail.mock.calls[0][0]
    expect(mail.to).toBe('admin@heladeria.com')
    const token = mail.text.match(/reset-password\?token=([a-f0-9]+)/)[1]
    expect(token).not.toBe(tokenHash)
    const crypto = require('crypto')
    expect(crypto.createHash('sha256').update(token).digest('hex')).toBe(tokenHash)
  })

  it('no reenvía si hubo un pedido reciente', async () => {
    usersRepo.findByEmail.mockResolvedValue(mockUser)
    resetsRepo.hasRecentRequest.mockResolvedValue(true)
    await requestPasswordReset('admin@heladeria.com')
    expect(resetsRepo.replaceForUser).not.toHaveBeenCalled()
    expect(mailer.sendMail).not.toHaveBeenCalled()
  })

  it('no propaga el error si falla el envío del mail', async () => {
    usersRepo.findByEmail.mockResolvedValue(mockUser)
    mailer.sendMail.mockRejectedValue(new Error('SMTP caído'))
    await expect(requestPasswordReset('admin@heladeria.com')).resolves.toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
describe('resetPassword', () => {
  const resetsRepo = require('../repositories/passwordResets.repository')
  const { resetPassword } = require('../services/auth.service')

  beforeEach(() => {
    vi.spyOn(resetsRepo, 'resetPassword').mockResolvedValue(1)
    vi.spyOn(bcrypt, 'hash').mockResolvedValue('$2b$10$nuevohash')
  })

  it('lanza VALIDATION_ERROR si falta el token', async () => {
    await expect(resetPassword('', 'password123'))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('lanza VALIDATION_ERROR si la contraseña tiene menos de 8 caracteres', async () => {
    await expect(resetPassword('abc', '1234567'))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
    expect(resetsRepo.resetPassword).not.toHaveBeenCalled()
  })

  it('lanza VALIDATION_ERROR si el token es inválido, usado o vencido', async () => {
    resetsRepo.resetPassword.mockResolvedValue(null)
    await expect(resetPassword('token-viejo', 'password123'))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('busca por hash del token y guarda la contraseña hasheada', async () => {
    await resetPassword('mi-token', 'password123')
    const crypto = require('crypto')
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10)
    expect(resetsRepo.resetPassword).toHaveBeenCalledWith({
      tokenHash: crypto.createHash('sha256').update('mi-token').digest('hex'),
      passwordHash: '$2b$10$nuevohash',
    })
  })
})
