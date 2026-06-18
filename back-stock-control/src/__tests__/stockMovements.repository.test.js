import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const prisma = require('../lib/prisma')
const { createWithItems } = require('../repositories/stockMovements.repository')

// ---------------------------------------------------------------------------
// Mock del contexto de transacción
// ---------------------------------------------------------------------------
const mockTx = {
  stock_movements: { create: vi.fn() },
  stock_movement_items: { create: vi.fn() },
  branch_stock: {
    findFirst: vi.fn(),
    update:    vi.fn(),
    create:    vi.fn()
  }
}

beforeEach(() => {
  vi.spyOn(prisma, '$transaction').mockImplementation(cb => cb(mockTx))
  mockTx.stock_movements.create.mockResolvedValue({ id: 1 })
  mockTx.stock_movement_items.create.mockResolvedValue({})
  mockTx.branch_stock.findFirst.mockResolvedValue({ id: 99, total: 100 })
  mockTx.branch_stock.update.mockResolvedValue({})
  mockTx.branch_stock.create.mockResolvedValue({})
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const getUpdateIncrements = () =>
  mockTx.branch_stock.update.mock.calls.map(call => call[0].data.total.increment)

const getCreateTotals = () =>
  mockTx.branch_stock.create.mock.calls.map(call => call[0].data.total)

// ---------------------------------------------------------------------------
describe('createWithItems — TRANSFER', () => {
  const base = {
    movement_type: 'TRANSFER',
    from_branch_id: 1,
    to_branch_id: 2,
    items: [{ product_id: 10, quantity: 5 }]
  }

  it('resta la cantidad del origen', async () => {
    await createWithItems(base)
    const increments = getUpdateIncrements()
    expect(increments).toContain(-5)
  })

  it('suma la cantidad al destino', async () => {
    await createWithItems(base)
    const increments = getUpdateIncrements()
    expect(increments).toContain(5)
  })

  it('el origen recibe delta negativo y el destino positivo', async () => {
    await createWithItems(base)
    const increments = getUpdateIncrements()
    expect(increments).toHaveLength(2)
    expect(increments[0]).toBe(-5) // from_branch
    expect(increments[1]).toBe(5)  // to_branch
  })

  it('funciona con múltiples items', async () => {
    await createWithItems({
      ...base,
      items: [
        { product_id: 10, quantity: 3 },
        { product_id: 20, quantity: 7 }
      ]
    })
    const increments = getUpdateIncrements()
    // item 1: from=-3, to=+3 / item 2: from=-7, to=+7
    expect(increments).toEqual([-3, 3, -7, 7])
  })
})

// ---------------------------------------------------------------------------
describe('createWithItems — ADJUSTMENT', () => {
  const base = {
    movement_type: 'ADJUSTMENT',
    from_branch_id: 1,
    reason_category_id: 5,
    items: [{ product_id: 10, quantity: -4 }]
  }

  it('aplica la cantidad negativa al origen (reduce stock)', async () => {
    await createWithItems(base)
    const increments = getUpdateIncrements()
    expect(increments).toHaveLength(1)
    expect(increments[0]).toBe(-4)
  })

  it('no actualiza ninguna otra sucursal', async () => {
    await createWithItems(base)
    expect(mockTx.branch_stock.update).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
describe('createWithItems — INTERNAL', () => {
  const baseEgress = {
    movement_type: 'INTERNAL',
    from_branch_id: 1,
    reason_category_id: 6,
    items: [{ product_id: 10, quantity: -2 }]
  }

  const baseIngress = {
    movement_type: 'INTERNAL',
    from_branch_id: 1,
    reason_category_id: 7,
    items: [{ product_id: 10, quantity: 8 }]
  }

  it('egreso (quantity negativo) reduce el stock de la sucursal', async () => {
    await createWithItems(baseEgress)
    const increments = getUpdateIncrements()
    expect(increments).toHaveLength(1)
    expect(increments[0]).toBe(-2)
  })

  it('ingreso (quantity positivo) suma al stock de la sucursal', async () => {
    await createWithItems(baseIngress)
    const increments = getUpdateIncrements()
    expect(increments).toHaveLength(1)
    expect(increments[0]).toBe(8)
  })

  it('no actualiza ninguna otra sucursal', async () => {
    await createWithItems(baseEgress)
    expect(mockTx.branch_stock.update).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
describe('createWithItems — upsertStock cuando no hay registro previo', () => {
  it('TRANSFER: crea con total negativo en origen y positivo en destino', async () => {
    mockTx.branch_stock.findFirst.mockResolvedValue(null)

    await createWithItems({
      movement_type: 'TRANSFER',
      from_branch_id: 1,
      to_branch_id: 2,
      items: [{ product_id: 10, quantity: 5 }]
    })

    const totals = getCreateTotals()
    expect(totals[0]).toBe(-5) // origen
    expect(totals[1]).toBe(5)  // destino
  })

  it('ADJUSTMENT: crea con la cantidad negativa si no existía registro', async () => {
    mockTx.branch_stock.findFirst.mockResolvedValue(null)

    await createWithItems({
      movement_type: 'ADJUSTMENT',
      from_branch_id: 1,
      reason_category_id: 5,
      items: [{ product_id: 10, quantity: -3 }]
    })

    const totals = getCreateTotals()
    expect(totals[0]).toBe(-3)
  })

  it('INTERNAL ingreso: crea con total positivo si no existía registro', async () => {
    mockTx.branch_stock.findFirst.mockResolvedValue(null)

    await createWithItems({
      movement_type: 'INTERNAL',
      from_branch_id: 1,
      reason_category_id: 7,
      items: [{ product_id: 10, quantity: 6 }]
    })

    const totals = getCreateTotals()
    expect(totals[0]).toBe(6)
  })
})
