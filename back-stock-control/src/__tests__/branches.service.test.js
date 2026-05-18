import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const repo = require('../repositories/branches.repository')
const { getById, getStockSummaryByCategory, getStockByBranch, create, update, remove } = require('../services/branches.service')

const mockBranch = { id: 1, name: 'Central', address: 'Av. Siempreviva 742', is_active: true }

beforeEach(() => {
  vi.spyOn(repo, 'findAll').mockResolvedValue([mockBranch])
  vi.spyOn(repo, 'findById').mockResolvedValue(null)
  vi.spyOn(repo, 'findStockSummaryByCategory').mockResolvedValue([])
  vi.spyOn(repo, 'findStockByBranch').mockResolvedValue([])
  vi.spyOn(repo, 'create').mockResolvedValue(mockBranch)
  vi.spyOn(repo, 'update').mockResolvedValue(mockBranch)
  vi.spyOn(repo, 'remove').mockResolvedValue(mockBranch)
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
describe('getById', () => {
  it('retorna la sucursal si existe', async () => {
    repo.findById.mockResolvedValue(mockBranch)
    const result = await getById(1)
    expect(result).toEqual(mockBranch)
  })

  it('lanza NOT_FOUND si no existe', async () => {
    await expect(getById(99)).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 })
  })
})

// ---------------------------------------------------------------------------
describe('getStockSummaryByCategory', () => {
  it('lanza NOT_FOUND si la sucursal no existe', async () => {
    await expect(getStockSummaryByCategory(99))
      .rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 })
    expect(repo.findStockSummaryByCategory).not.toHaveBeenCalled()
  })

  it('retorna el resumen si la sucursal existe', async () => {
    repo.findById.mockResolvedValue(mockBranch)
    repo.findStockSummaryByCategory.mockResolvedValue([{ category_name: 'Palitos', total: 50 }])
    const result = await getStockSummaryByCategory(1)
    expect(repo.findStockSummaryByCategory).toHaveBeenCalledWith(1)
    expect(result).toHaveLength(1)
  })
})

// ---------------------------------------------------------------------------
describe('getStockByBranch', () => {
  it('lanza NOT_FOUND si la sucursal no existe', async () => {
    await expect(getStockByBranch(99)).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 })
  })

  it('retorna los productos con el campo total y low_stock calculado', async () => {
    repo.findById.mockResolvedValue(mockBranch)
    repo.findStockByBranch.mockResolvedValue([
      { product_id: 1, name: 'Palito', stock_total: 2, unidades_x_pack: 12 },
    ])
    const result = await getStockByBranch(1)
    expect(result.branch).toEqual({ id: 1, name: 'Central' })
    expect(result.products[0].total).toBe(2)
    expect(result.products[0].low_stock).toBe(true)
  })

  it('low_stock es false cuando el stock supera el umbral', async () => {
    repo.findById.mockResolvedValue(mockBranch)
    repo.findStockByBranch.mockResolvedValue([
      { product_id: 1, name: 'Palito', stock_total: 40, unidades_x_pack: 12 },
    ])
    const result = await getStockByBranch(1)
    expect(result.products[0].low_stock).toBe(false)
  })

  it('usa unidades_x_pack = 1 si el campo es null', async () => {
    repo.findById.mockResolvedValue(mockBranch)
    repo.findStockByBranch.mockResolvedValue([
      { product_id: 1, name: 'Producto', stock_total: 3, unidades_x_pack: null },
    ])
    const result = await getStockByBranch(1)
    expect(result.products[0].low_stock).toBe(true)
  })
})

// ---------------------------------------------------------------------------
describe('create', () => {
  it('crea la sucursal con nombre válido', async () => {
    const result = await create({ name: 'Norte', address: 'Calle Falsa 123' })
    expect(repo.create).toHaveBeenCalledWith({ name: 'Norte', address: 'Calle Falsa 123' })
    expect(result).toEqual(mockBranch)
  })

  it('trimea el nombre y la dirección antes de guardar', async () => {
    await create({ name: '  Norte  ', address: '  Calle Falsa  ' })
    expect(repo.create).toHaveBeenCalledWith({ name: 'Norte', address: 'Calle Falsa' })
  })

  it('guarda address como null si no se provee', async () => {
    await create({ name: 'Sur' })
    expect(repo.create).toHaveBeenCalledWith({ name: 'Sur', address: null })
  })

  it('lanza VALIDATION_ERROR si el nombre está vacío', async () => {
    await expect(create({ name: '   ' }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
    expect(repo.create).not.toHaveBeenCalled()
  })

  it('lanza VALIDATION_ERROR si el nombre está ausente', async () => {
    await expect(create({})).rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })
})

// ---------------------------------------------------------------------------
describe('update', () => {
  it('lanza NOT_FOUND si la sucursal no existe', async () => {
    await expect(update(99, { name: 'Nuevo' }))
      .rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 })
    expect(repo.update).not.toHaveBeenCalled()
  })

  it('lanza VALIDATION_ERROR si el nombre está vacío', async () => {
    repo.findById.mockResolvedValue(mockBranch)
    await expect(update(1, { name: '' }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
    expect(repo.update).not.toHaveBeenCalled()
  })

  it('actualiza la sucursal con datos válidos', async () => {
    repo.findById.mockResolvedValue(mockBranch)
    const result = await update(1, { name: 'Central Actualizada', address: 'Nueva Dir' })
    expect(repo.update).toHaveBeenCalledWith(1, { name: 'Central Actualizada', address: 'Nueva Dir' })
    expect(result).toEqual(mockBranch)
  })
})

// ---------------------------------------------------------------------------
describe('remove', () => {
  it('lanza NOT_FOUND si la sucursal no existe', async () => {
    await expect(remove(99)).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 })
    expect(repo.remove).not.toHaveBeenCalled()
  })

  it('elimina la sucursal si existe', async () => {
    repo.findById.mockResolvedValue(mockBranch)
    await remove(1)
    expect(repo.remove).toHaveBeenCalledWith(1)
  })
})
