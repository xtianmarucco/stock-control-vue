import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const repo = require('../repositories/reasonCategories.repository')
const { getAll } = require('../services/reasonCategories.service')

const mockRaw = [
  { id: 1, code: 'MERMA', label: 'Merma', movement_type: 'ADJUSTMENT', extra_field: 'ignored' },
  { id: 2, code: 'USO', label: 'Uso interno', movement_type: 'INTERNAL', extra_field: 'ignored' },
]

beforeEach(() => {
  vi.spyOn(repo, 'findAll').mockResolvedValue(mockRaw)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getAll', () => {
  it('retorna las categorías con los campos correctos', async () => {
    const result = await getAll()
    expect(result).toEqual([
      { id: 1, code: 'MERMA', label: 'Merma', movement_type: 'ADJUSTMENT' },
      { id: 2, code: 'USO', label: 'Uso interno', movement_type: 'INTERNAL' },
    ])
  })

  it('omite campos extra del repositorio', async () => {
    const result = await getAll()
    expect(result[0]).not.toHaveProperty('extra_field')
  })

  it('retorna array vacío si no hay categorías', async () => {
    repo.findAll.mockResolvedValue([])
    const result = await getAll()
    expect(result).toEqual([])
  })
})
