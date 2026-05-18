import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const repo = require('../repositories/stockMovements.repository')
const { getById, create } = require('../services/stockMovements.service')

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const mockReasonCategory = { id: 10, code: 'MERMA', label: 'Merma', movement_type: 'ADJUSTMENT' }
const mockReasonCategoryInternal = { id: 11, code: 'USO', label: 'Uso interno', movement_type: 'INTERNAL' }

const mockRawMovement = {
  id: 1,
  movement_type: 'ADJUSTMENT',
  from_branch_id: 1,
  to_branch_id: null,
  reason_category_id: 10,
  reason: null,
  created_at: new Date('2026-01-01'),
  fromBranch: { name: 'Central' },
  toBranch: null,
  reasonCategory: { label: 'Merma' },
  createdBy: { id: 5, full_name: 'Admin' },
  items: [
    {
      product_id: 1,
      quantity: -3,
      product: { name: 'Helado Vainilla', unidades_x_pack: 12, unidades_x_caja: null, cajas_x_pack: null }
    }
  ]
}

const baseTransfer = {
  movement_type: 'TRANSFER',
  from_branch_id: 1,
  to_branch_id: 2,
  items: [{ product_id: 1, quantity: 5 }]
}

const baseAdjustment = {
  movement_type: 'ADJUSTMENT',
  from_branch_id: 1,
  reason_category_id: 10,
  items: [{ product_id: 1, quantity: -3 }]
}

const baseInternal = {
  movement_type: 'INTERNAL',
  from_branch_id: 1,
  reason_category_id: 11,
  items: [{ product_id: 1, quantity: 10 }]
}

// ---------------------------------------------------------------------------
beforeEach(() => {
  vi.spyOn(repo, 'findById').mockResolvedValue(null)
  vi.spyOn(repo, 'findReasonCategoryById').mockResolvedValue(mockReasonCategory)
  vi.spyOn(repo, 'findSourceStock').mockResolvedValue([{ product_id: 1, total: 100 }])
  vi.spyOn(repo, 'createWithItems').mockResolvedValue({ id: 1 })
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
describe('getById', () => {
  it('devuelve el movimiento formateado si existe', async () => {
    repo.findById.mockResolvedValue(mockRawMovement)
    const result = await getById(1)
    expect(result.id).toBe(1)
    expect(result.movement_type).toBe('ADJUSTMENT')
    expect(result.from_branch_name).toBe('Central')
    expect(result.items[0].product_name).toBe('Helado Vainilla')
    expect(result.items[0].quantity).toBe(-3)
  })

  it('lanza NOT_FOUND si no existe', async () => {
    repo.findById.mockResolvedValue(null)
    await expect(getById(99)).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 })
  })
})

// ---------------------------------------------------------------------------
describe('create — validaciones generales', () => {
  it('lanza VALIDATION_ERROR si movement_type es inválido', async () => {
    await expect(create({ ...baseTransfer, movement_type: 'VENTA' }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('lanza VALIDATION_ERROR si movement_type está ausente', async () => {
    const { movement_type, ...rest } = baseTransfer
    await expect(create(rest)).rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('lanza VALIDATION_ERROR si from_branch_id está ausente', async () => {
    await expect(create({ ...baseTransfer, from_branch_id: null }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('lanza VALIDATION_ERROR si items está vacío', async () => {
    await expect(create({ ...baseTransfer, items: [] }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('lanza VALIDATION_ERROR si items no viene en el payload', async () => {
    const { items, ...rest } = baseTransfer
    await expect(create(rest)).rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })
})

// ---------------------------------------------------------------------------
describe('create — TRANSFER', () => {
  it('lanza VALIDATION_ERROR si to_branch_id no está presente', async () => {
    await expect(create({ ...baseTransfer, to_branch_id: null }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('lanza VALIDATION_ERROR si origen y destino son la misma sucursal', async () => {
    await expect(create({ ...baseTransfer, to_branch_id: 1 }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('lanza VALIDATION_ERROR si se envía reason_category_id en un TRANSFER', async () => {
    await expect(create({ ...baseTransfer, reason_category_id: 10 }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('crea el movimiento correctamente y retorna { id }', async () => {
    const result = await create(baseTransfer)
    expect(repo.createWithItems).toHaveBeenCalledOnce()
    expect(result).toEqual({ id: 1 })
  })
})

// ---------------------------------------------------------------------------
describe('create — ADJUSTMENT', () => {
  it('lanza VALIDATION_ERROR si reason_category_id está ausente', async () => {
    await expect(create({ ...baseAdjustment, reason_category_id: null }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('lanza NOT_FOUND si la categoría de motivo no existe', async () => {
    repo.findReasonCategoryById.mockResolvedValue(null)
    await expect(create(baseAdjustment)).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 })
  })

  it('lanza VALIDATION_ERROR si la categoría de motivo no corresponde al tipo de movimiento', async () => {
    repo.findReasonCategoryById.mockResolvedValue({ ...mockReasonCategory, movement_type: 'INTERNAL' })
    await expect(create(baseAdjustment)).rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('crea el movimiento correctamente y retorna { id }', async () => {
    const result = await create(baseAdjustment)
    expect(repo.createWithItems).toHaveBeenCalledOnce()
    expect(result).toEqual({ id: 1 })
  })
})

// ---------------------------------------------------------------------------
describe('create — INTERNAL', () => {
  beforeEach(() => {
    repo.findReasonCategoryById.mockResolvedValue(mockReasonCategoryInternal)
  })

  it('lanza VALIDATION_ERROR si reason_category_id está ausente', async () => {
    await expect(create({ ...baseInternal, reason_category_id: null }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('no consulta stock si todos los items son ingresos (quantity > 0)', async () => {
    await create(baseInternal)
    expect(repo.findSourceStock).not.toHaveBeenCalled()
  })

  it('sí consulta stock si algún item tiene quantity negativo', async () => {
    await create({ ...baseInternal, items: [{ product_id: 1, quantity: -5 }] })
    expect(repo.findSourceStock).toHaveBeenCalled()
  })

  it('crea el movimiento correctamente y retorna { id }', async () => {
    const result = await create(baseInternal)
    expect(result).toEqual({ id: 1 })
  })
})

// ---------------------------------------------------------------------------
describe('create — validación de items', () => {
  it('lanza VALIDATION_ERROR si un item no tiene product_id', async () => {
    await expect(create({ ...baseTransfer, items: [{ quantity: 5 }] }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('lanza VALIDATION_ERROR si quantity es 0', async () => {
    await expect(create({ ...baseTransfer, items: [{ product_id: 1, quantity: 0 }] }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })

  it('lanza VALIDATION_ERROR si quantity es decimal', async () => {
    await expect(create({ ...baseTransfer, items: [{ product_id: 1, quantity: 1.5 }] }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 })
  })
})

// ---------------------------------------------------------------------------
describe('create — validación de stock disponible', () => {
  it('lanza INSUFFICIENT_STOCK en TRANSFER si no hay suficiente stock', async () => {
    repo.findSourceStock.mockResolvedValue([{ product_id: 1, total: 2 }])
    await expect(create({ ...baseTransfer, items: [{ product_id: 1, quantity: 5 }] }))
      .rejects.toMatchObject({ code: 'INSUFFICIENT_STOCK', status: 400 })
  })

  it('lanza INSUFFICIENT_STOCK en ADJUSTMENT si la cantidad negativa supera el stock', async () => {
    repo.findSourceStock.mockResolvedValue([{ product_id: 1, total: 1 }])
    await expect(create({ ...baseAdjustment, items: [{ product_id: 1, quantity: -5 }] }))
      .rejects.toMatchObject({ code: 'INSUFFICIENT_STOCK', status: 400 })
  })

  it('pasa la validación de stock cuando hay suficiente', async () => {
    repo.findSourceStock.mockResolvedValue([{ product_id: 1, total: 100 }])
    const result = await create(baseTransfer)
    expect(result).toEqual({ id: 1 })
  })

  it('lanza INSUFFICIENT_STOCK si el producto no tiene stock registrado', async () => {
    repo.findSourceStock.mockResolvedValue([])
    await expect(create(baseTransfer)).rejects.toMatchObject({ code: 'INSUFFICIENT_STOCK', status: 400 })
  })
})
