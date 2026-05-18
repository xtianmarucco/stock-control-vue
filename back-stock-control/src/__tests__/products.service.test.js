import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createRequire } from 'module'

// CJS modules share the same cached instance via require().
// vi.spyOn mutates the exports object directly, so the service
// picks up the mock automatically (it holds a reference to the same object).
const require = createRequire(import.meta.url)
const repo = require('../repositories/products.repository')
const { getById, create, update, remove, restore, destroy } = require('../services/products.service')

const mockProduct = {
  id: 1,
  name: 'Helado de Vainilla',
  category_name: 'Sabores Comunes',
  unidades_x_pack: 12,
  cajas_x_pack: null,
  unidades_x_caja: null,
  is_available: true,
}

beforeEach(() => {
  vi.spyOn(repo, 'findById').mockResolvedValue(null)
  vi.spyOn(repo, 'findByName').mockResolvedValue(null)
  vi.spyOn(repo, 'findCategories').mockResolvedValue([])
  vi.spyOn(repo, 'create').mockResolvedValue(mockProduct)
  vi.spyOn(repo, 'update').mockResolvedValue(mockProduct)
  vi.spyOn(repo, 'softDelete').mockResolvedValue({ ...mockProduct, is_available: false })
  vi.spyOn(repo, 'hardDelete').mockResolvedValue(undefined)
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
describe('getById', () => {
  it('devuelve el producto si existe', async () => {
    repo.findById.mockResolvedValue(mockProduct)
    const result = await getById(1)
    expect(result).toEqual(mockProduct)
    expect(repo.findById).toHaveBeenCalledWith(1)
  })

  it('lanza NOT_FOUND si no existe', async () => {
    repo.findById.mockResolvedValue(null)
    await expect(getById(99)).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 })
  })
})

// ---------------------------------------------------------------------------
describe('create', () => {
  it('crea el producto con datos válidos', async () => {
    await create({ name: 'Palito de Frutilla', category_name: 'Palitos', unidades_x_pack: 24 })
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Palito de Frutilla', category_name: 'Palitos', unidades_x_pack: 24 })
    )
  })

  it('trimea el nombre y la categoría antes de guardar', async () => {
    await create({ name: '  Palito  ', category_name: '  Palitos  ', unidades_x_pack: 12 })
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Palito', category_name: 'Palitos' })
    )
  })

  it('lanza VALIDATION_ERROR si falta el nombre', async () => {
    await expect(create({ name: '', category_name: 'Palitos', unidades_x_pack: 12 }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('lanza VALIDATION_ERROR si falta la categoría', async () => {
    await expect(create({ name: 'Palito', category_name: '  ', unidades_x_pack: 12 }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('lanza CONFLICT si el nombre ya existe', async () => {
    repo.findByName.mockResolvedValue(mockProduct)
    await expect(create({ name: 'Helado de Vainilla', category_name: 'Sabores Comunes', unidades_x_pack: 12 }))
      .rejects.toMatchObject({ code: 'CONFLICT', status: 409 })
  })

  it('lanza VALIDATION_ERROR si unidades_x_pack es 0', async () => {
    await expect(create({ name: 'Nuevo', category_name: 'Cat', unidades_x_pack: 0 }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('lanza VALIDATION_ERROR si unidades_x_pack no es entero', async () => {
    await expect(create({ name: 'Nuevo', category_name: 'Cat', unidades_x_pack: 1.5 }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('lanza VALIDATION_ERROR si solo se envía cajas_x_pack sin unidades_x_caja', async () => {
    await expect(create({ name: 'Nuevo', category_name: 'Cat', unidades_x_pack: 12, cajas_x_pack: 4 }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('lanza VALIDATION_ERROR si solo se envía unidades_x_caja sin cajas_x_pack', async () => {
    await expect(create({ name: 'Nuevo', category_name: 'Cat', unidades_x_pack: 12, unidades_x_caja: 6 }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('acepta cajas_x_pack y unidades_x_caja cuando ambos están presentes', async () => {
    await create({ name: 'Con Caja', category_name: 'Cat', unidades_x_pack: 24, cajas_x_pack: 4, unidades_x_caja: 6 })
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ cajas_x_pack: 4, unidades_x_caja: 6 })
    )
  })
})

// ---------------------------------------------------------------------------
describe('remove (soft delete)', () => {
  it('llama a softDelete si el producto existe', async () => {
    repo.findById.mockResolvedValue(mockProduct)
    await remove(1)
    expect(repo.softDelete).toHaveBeenCalledWith(1)
  })

  it('lanza NOT_FOUND si el producto no existe', async () => {
    await expect(remove(99)).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 })
    expect(repo.softDelete).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
describe('destroy (hard delete)', () => {
  it('elimina definitivamente un producto inactivo', async () => {
    repo.findById.mockResolvedValue({ ...mockProduct, is_available: false })
    await destroy(1)
    expect(repo.hardDelete).toHaveBeenCalledWith(1)
  })

  it('lanza NOT_FOUND si el producto no existe', async () => {
    await expect(destroy(99)).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 })
    expect(repo.hardDelete).not.toHaveBeenCalled()
  })

  it('lanza VALIDATION_ERROR si el producto está activo', async () => {
    repo.findById.mockResolvedValue({ ...mockProduct, is_available: true })
    await expect(destroy(1)).rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
    expect(repo.hardDelete).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
describe('restore', () => {
  it('reactiva un producto inactivo', async () => {
    repo.findById.mockResolvedValue({ ...mockProduct, is_available: false })
    await restore(1)
    expect(repo.update).toHaveBeenCalledWith(1, { is_available: true })
  })

  it('lanza NOT_FOUND si el producto no existe', async () => {
    await expect(restore(99)).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 })
    expect(repo.update).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
describe('update', () => {
  beforeEach(() => {
    repo.findById.mockResolvedValue(mockProduct)
  })

  it('lanza NOT_FOUND si el producto no existe', async () => {
    repo.findById.mockResolvedValue(null)
    await expect(update(99, { name: 'X' })).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 })
  })

  it('lanza CONFLICT si el nombre nuevo ya lo usa otro producto', async () => {
    repo.findByName.mockResolvedValue({ ...mockProduct, id: 99 })
    await expect(update(1, { name: 'Nombre Duplicado' })).rejects.toMatchObject({ code: 'CONFLICT', status: 409 })
  })

  it('no lanza conflicto si el nombre pertenece al mismo producto', async () => {
    repo.findByName.mockResolvedValue(mockProduct)
    await expect(update(1, { name: 'Helado de Vainilla' })).resolves.toBeDefined()
  })

  it('lanza VALIDATION_ERROR si el nombre nuevo está vacío', async () => {
    await expect(update(1, { name: '   ' })).rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('lanza VALIDATION_ERROR si unidades_x_pack no es entero positivo', async () => {
    await expect(update(1, { unidades_x_pack: -5 })).rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('actualiza solo los campos provistos', async () => {
    await update(1, { category_name: 'Especiales' })
    expect(repo.update).toHaveBeenCalledWith(1, { category_name: 'Especiales' })
  })
})
