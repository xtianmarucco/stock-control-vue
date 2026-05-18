import { vi, describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProductStore } from '../stores/productStores'

vi.mock('../services/ProductService', () => ({
  getAllProducts: vi.fn(),
  getProductsByCategory: vi.fn(),
  getProductsWithStock: vi.fn(),
}))

import { getAllProducts, getProductsByCategory, getProductsWithStock } from '../services/ProductService'

const mockProducts = [
  { id: 1, name: 'Palito de Frutilla', category_name: 'Palitos' },
  { id: 2, name: 'Helado Vainilla', category_name: 'Sabores Comunes' },
]

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
describe('fetchAll', () => {
  it('setea los productos y limpia el error', async () => {
    getAllProducts.mockResolvedValue(mockProducts)
    const store = useProductStore()
    store.error = 'error previo'
    await store.fetchAll()
    expect(store.products).toEqual(mockProducts)
  })

  it('gestiona el flag loading correctamente', async () => {
    let resolve
    getAllProducts.mockImplementation(() => new Promise(r => { resolve = r }))
    const store = useProductStore()

    const fetchPromise = store.fetchAll()
    expect(store.loading).toBe(true)

    resolve(mockProducts)
    await fetchPromise
    expect(store.loading).toBe(false)
  })

  it('setea error cuando la API falla', async () => {
    getAllProducts.mockRejectedValue(new Error('Network error'))
    const store = useProductStore()
    await store.fetchAll()
    expect(store.error).toBe('Network error')
    expect(store.loading).toBe(false)
  })
})

// ---------------------------------------------------------------------------
describe('fetchByCategory', () => {
  it('llama a getProductsByCategory con la categoría correcta', async () => {
    getProductsByCategory.mockResolvedValue([mockProducts[0]])
    const store = useProductStore()
    await store.fetchByCategory('Palitos')
    expect(getProductsByCategory).toHaveBeenCalledWith('Palitos')
    expect(store.products).toEqual([mockProducts[0]])
  })

  it('setea error si la llamada falla', async () => {
    getProductsByCategory.mockRejectedValue(new Error('Error'))
    const store = useProductStore()
    await store.fetchByCategory('Palitos')
    expect(store.error).toBe('Error')
  })
})

// ---------------------------------------------------------------------------
describe('fetchWithStock', () => {
  it('llama a getProductsWithStock y setea los productos', async () => {
    getProductsWithStock.mockResolvedValue(mockProducts)
    const store = useProductStore()
    await store.fetchWithStock()
    expect(getProductsWithStock).toHaveBeenCalledOnce()
    expect(store.products).toEqual(mockProducts)
  })

  it('setea error si la llamada falla', async () => {
    getProductsWithStock.mockRejectedValue(new Error('Fallo'))
    const store = useProductStore()
    await store.fetchWithStock()
    expect(store.error).toBe('Fallo')
  })
})
