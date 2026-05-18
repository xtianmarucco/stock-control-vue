import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const repo = require('../repositories/users.repository')
const bcrypt = require('bcrypt')
const { getById, create, update, remove } = require('../services/users.service')

const mockUser = {
  id: 1,
  email: 'admin@heladeria.com',
  full_name: 'Admin Principal',
  dni: '12345678',
  role: 'admin',
}

const validCreatePayload = {
  email: 'nuevo@heladeria.com',
  fullName: 'Nuevo Usuario',
  dni: '87654321',
  password: 'secret123',
  role: 'colaborador',
}

const validUpdatePayload = {
  email: 'admin@heladeria.com',
  fullName: 'Admin Principal',
  dni: '12345678',
  role: 'admin',
}

beforeEach(() => {
  vi.spyOn(repo, 'findAll').mockResolvedValue([mockUser])
  vi.spyOn(repo, 'findById').mockResolvedValue(null)
  vi.spyOn(repo, 'findByEmail').mockResolvedValue(null)
  vi.spyOn(repo, 'create').mockResolvedValue(mockUser)
  vi.spyOn(repo, 'update').mockResolvedValue(mockUser)
  vi.spyOn(repo, 'remove').mockResolvedValue(mockUser)
  vi.spyOn(bcrypt, 'hash').mockResolvedValue('$2b$10$hashed')
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
describe('getById', () => {
  it('retorna el usuario si existe', async () => {
    repo.findById.mockResolvedValue(mockUser)
    const result = await getById(1)
    expect(result).toEqual(mockUser)
  })

  it('lanza NOT_FOUND si no existe', async () => {
    await expect(getById(99)).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 })
  })
})

// ---------------------------------------------------------------------------
describe('create', () => {
  it('crea el usuario con datos válidos', async () => {
    const result = await create(validCreatePayload)
    expect(repo.create).toHaveBeenCalledOnce()
    expect(result).toEqual(mockUser)
  })

  it('hashea la contraseña antes de guardar', async () => {
    await create(validCreatePayload)
    expect(bcrypt.hash).toHaveBeenCalledWith('secret123', 10)
  })

  it('guarda el email en minúsculas', async () => {
    await create({ ...validCreatePayload, email: 'NUEVO@HELADERIA.COM' })
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'nuevo@heladeria.com' })
    )
  })

  it('lanza VALIDATION_ERROR si el email está ausente', async () => {
    await expect(create({ ...validCreatePayload, email: '' }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('lanza VALIDATION_ERROR si el email no tiene formato válido', async () => {
    await expect(create({ ...validCreatePayload, email: 'noesunmail' }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('lanza VALIDATION_ERROR si falta fullName', async () => {
    await expect(create({ ...validCreatePayload, fullName: '   ' }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('lanza VALIDATION_ERROR si falta dni', async () => {
    await expect(create({ ...validCreatePayload, dni: '' }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('lanza VALIDATION_ERROR si falta password', async () => {
    await expect(create({ ...validCreatePayload, password: '' }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('lanza VALIDATION_ERROR si el rol no es válido', async () => {
    await expect(create({ ...validCreatePayload, role: 'superadmin' }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('lanza CONFLICT si el email ya está en uso', async () => {
    repo.findByEmail.mockResolvedValue(mockUser)
    await expect(create(validCreatePayload))
      .rejects.toMatchObject({ code: 'CONFLICT', status: 409 })
  })
})

// ---------------------------------------------------------------------------
describe('update', () => {
  beforeEach(() => {
    repo.findById.mockResolvedValue(mockUser)
  })

  it('lanza NOT_FOUND si el usuario no existe', async () => {
    repo.findById.mockResolvedValue(null)
    await expect(update(99, validUpdatePayload))
      .rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 })
  })

  it('lanza VALIDATION_ERROR si el email no tiene formato válido', async () => {
    await expect(update(1, { ...validUpdatePayload, email: 'noesunmail' }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('lanza VALIDATION_ERROR si fullName está vacío', async () => {
    await expect(update(1, { ...validUpdatePayload, fullName: '' }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('lanza VALIDATION_ERROR si dni está vacío', async () => {
    await expect(update(1, { ...validUpdatePayload, dni: '  ' }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('lanza VALIDATION_ERROR si el rol no es válido', async () => {
    await expect(update(1, { ...validUpdatePayload, role: 'viewer' }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('lanza CONFLICT si el email ya lo usa otro usuario', async () => {
    repo.findByEmail.mockResolvedValue({ ...mockUser, id: 99 })
    await expect(update(1, validUpdatePayload))
      .rejects.toMatchObject({ code: 'CONFLICT', status: 409 })
  })

  it('no lanza conflicto si el email pertenece al mismo usuario', async () => {
    repo.findByEmail.mockResolvedValue(mockUser)
    await expect(update(1, validUpdatePayload)).resolves.toBeDefined()
  })

  it('hashea la nueva contraseña si se provee', async () => {
    repo.findByEmail.mockResolvedValue(mockUser)
    await update(1, { ...validUpdatePayload, password: 'nuevapass' })
    expect(bcrypt.hash).toHaveBeenCalledWith('nuevapass', 10)
  })

  it('no hashea si no se provee contraseña', async () => {
    repo.findByEmail.mockResolvedValue(mockUser)
    await update(1, validUpdatePayload)
    expect(bcrypt.hash).not.toHaveBeenCalled()
  })

  it('actualiza con datos válidos', async () => {
    repo.findByEmail.mockResolvedValue(mockUser)
    const result = await update(1, validUpdatePayload)
    expect(repo.update).toHaveBeenCalledOnce()
    expect(result).toEqual(mockUser)
  })
})

// ---------------------------------------------------------------------------
describe('remove', () => {
  it('lanza VALIDATION_ERROR si el usuario intenta eliminarse a sí mismo', async () => {
    repo.findById.mockResolvedValue(mockUser)
    await expect(remove(1, 1)).rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
    expect(repo.remove).not.toHaveBeenCalled()
  })

  it('lanza NOT_FOUND si el usuario no existe', async () => {
    await expect(remove(99, 1)).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 })
    expect(repo.remove).not.toHaveBeenCalled()
  })

  it('elimina el usuario si existe y no es el usuario actual', async () => {
    repo.findById.mockResolvedValue(mockUser)
    await remove(1, 2)
    expect(repo.remove).toHaveBeenCalledWith(1)
  })
})
