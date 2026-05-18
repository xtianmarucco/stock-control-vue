import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../stores/authStore'
import ProductDrawer from '../components/product-drawer/ProductDrawer.vue'

vi.mock('../services/ProductService.js', () => ({
  getProductById: vi.fn(),
  deleteProduct: vi.fn(),
  restoreProduct: vi.fn(),
  destroyProduct: vi.fn(),
}))

import { getProductById, deleteProduct, restoreProduct, destroyProduct } from '../services/ProductService.js'

const mockProductDetail = {
  id: 1, name: 'Helado Vainilla', category_name: 'Sabores Comunes',
  unidades_x_pack: 12, cajas_x_pack: null, unidades_x_caja: null,
}

const mockActivePreview = {
  id: 1, name: 'Helado Vainilla', category_name: 'Sabores Comunes',
  is_available: true, total: 36, low_stock: false,
}

const mockInactivePreview = { ...mockActivePreview, is_available: false }

// Monta el drawer siempre con modelValue:false → luego setProps(true)
// para que el watch dispare getProductById.
async function mountDrawer(preview, { open = true, admin = true } = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const authStore = useAuthStore()
  authStore.user = admin ? { id: 2, role: 'admin' } : null

  const wrapper = mount(ProductDrawer, {
    props: { modelValue: false, preview },
    global: { plugins: [pinia] },
  })

  if (open) {
    await wrapper.setProps({ modelValue: true })
    await flushPromises()
  }

  return wrapper
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  getProductById.mockResolvedValue(mockProductDetail)
  deleteProduct.mockResolvedValue(undefined)
  restoreProduct.mockResolvedValue(undefined)
  destroyProduct.mockResolvedValue(undefined)
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
describe('visibilidad del drawer', () => {
  it('no renderiza el drawer cuando modelValue es false', async () => {
    const wrapper = await mountDrawer(mockActivePreview, { open: false })
    expect(wrapper.find('aside').exists()).toBe(false)
  })

  it('renderiza el drawer cuando modelValue es true', async () => {
    const wrapper = await mountDrawer(mockActivePreview)
    expect(wrapper.find('aside').exists()).toBe(true)
  })

  it('muestra el nombre del producto en el header', async () => {
    const wrapper = await mountDrawer(mockActivePreview)
    expect(wrapper.text()).toContain('Helado Vainilla')
  })

  it('carga el detalle del producto al abrirse', async () => {
    await mountDrawer(mockActivePreview)
    expect(getProductById).toHaveBeenCalledWith(1)
  })

  it('emite update:modelValue false al hacer click en el overlay', async () => {
    const wrapper = await mountDrawer(mockActivePreview)
    await wrapper.find('.fixed.inset-0.z-40').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })
})

// ---------------------------------------------------------------------------
describe('botones de administración', () => {
  it('muestra los botones de admin cuando el usuario es admin', async () => {
    const wrapper = await mountDrawer(mockActivePreview)
    expect(wrapper.text()).toContain('Editar')
  })

  it('no muestra botones de admin cuando el usuario no es admin', async () => {
    const wrapper = await mountDrawer(mockActivePreview, { admin: false })
    expect(wrapper.text()).not.toContain('Editar')
    expect(wrapper.text()).not.toContain('Dar de baja')
  })

  it('emite edit con el preview al hacer click en Editar', async () => {
    const wrapper = await mountDrawer(mockActivePreview)
    await wrapper.findAll('button').find(b => b.text().includes('Editar')).trigger('click')
    expect(wrapper.emitted('edit')?.[0]?.[0]).toEqual(mockActivePreview)
  })
})

// ---------------------------------------------------------------------------
describe('producto activo — dar de baja', () => {
  it('muestra "Dar de baja" y no "Reactivar" ni "Eliminar"', async () => {
    const wrapper = await mountDrawer(mockActivePreview)
    expect(wrapper.text()).toContain('Dar de baja')
    expect(wrapper.text()).not.toContain('Reactivar')
    expect(wrapper.text()).not.toContain('Eliminar')
  })

  it('llama a deleteProduct y emite deactivated', async () => {
    const wrapper = await mountDrawer(mockActivePreview)
    await wrapper.findAll('button').find(b => b.text().includes('Dar de baja')).trigger('click')
    await flushPromises()
    expect(deleteProduct).toHaveBeenCalledWith(1)
    expect(wrapper.emitted('deactivated')).toBeTruthy()
  })

  it('no emite deactivated si deleteProduct falla', async () => {
    deleteProduct.mockRejectedValue(new Error('Error de red'))
    const wrapper = await mountDrawer(mockActivePreview)
    await wrapper.findAll('button').find(b => b.text().includes('Dar de baja')).trigger('click')
    await flushPromises()
    expect(wrapper.emitted('deactivated')).toBeFalsy()
  })
})

// ---------------------------------------------------------------------------
describe('producto inactivo — reactivar y eliminar', () => {
  it('muestra "Reactivar" y "Eliminar" y no "Dar de baja"', async () => {
    const wrapper = await mountDrawer(mockInactivePreview)
    expect(wrapper.text()).toContain('Reactivar')
    expect(wrapper.text()).toContain('Eliminar')
    expect(wrapper.text()).not.toContain('Dar de baja')
  })

  it('llama a restoreProduct y emite restored', async () => {
    const wrapper = await mountDrawer(mockInactivePreview)
    await wrapper.findAll('button').find(b => b.text().includes('Reactivar')).trigger('click')
    await flushPromises()
    expect(restoreProduct).toHaveBeenCalledWith(1)
    expect(wrapper.emitted('restored')).toBeTruthy()
  })

  it('muestra la zona de confirmación al hacer click en Eliminar', async () => {
    const wrapper = await mountDrawer(mockInactivePreview)
    expect(wrapper.text()).not.toContain('Esta acción es irreversible')
    await wrapper.findAll('button').find(b => b.text().includes('Eliminar')).trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Esta acción es irreversible')
  })

  it('oculta la zona de confirmación al cancelar', async () => {
    const wrapper = await mountDrawer(mockInactivePreview)
    await wrapper.findAll('button').find(b => b.text().includes('Eliminar')).trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.findAll('button').find(b => b.text() === 'Cancelar').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).not.toContain('Esta acción es irreversible')
  })

  it('llama a destroyProduct y emite destroyed y cierra el drawer', async () => {
    const wrapper = await mountDrawer(mockInactivePreview)
    await wrapper.findAll('button').find(b => b.text().includes('Eliminar')).trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.findAll('button').find(b => b.text().includes('Sí, eliminar')).trigger('click')
    await flushPromises()
    expect(destroyProduct).toHaveBeenCalledWith(1)
    expect(wrapper.emitted('destroyed')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('no emite destroyed si destroyProduct falla', async () => {
    destroyProduct.mockRejectedValue(new Error('Error'))
    const wrapper = await mountDrawer(mockInactivePreview)
    await wrapper.findAll('button').find(b => b.text().includes('Eliminar')).trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.findAll('button').find(b => b.text().includes('Sí, eliminar')).trigger('click')
    await flushPromises()
    expect(wrapper.emitted('destroyed')).toBeFalsy()
  })
})

// ---------------------------------------------------------------------------
describe('stockBreakdown — desglose calculado', () => {
  it('muestra equivalencia en bultos cuando el producto tiene unidades_x_pack', async () => {
    getProductById.mockResolvedValue({ ...mockProductDetail, unidades_x_pack: 12 })
    const wrapper = await mountDrawer({ ...mockActivePreview, total: 24 })
    expect(wrapper.text()).toContain('Equivale en bultos')
    expect(wrapper.text()).toContain('2')
  })

  it('muestra equivalencia en cajas cuando el producto tiene unidades_x_caja', async () => {
    getProductById.mockResolvedValue({ ...mockProductDetail, unidades_x_pack: 24, cajas_x_pack: 4, unidades_x_caja: 6 })
    const wrapper = await mountDrawer({ ...mockActivePreview, total: 12 })
    expect(wrapper.text()).toContain('Equivale en cajas')
    expect(wrapper.text()).toContain('2')
  })

  it('no muestra el desglose si total es null', async () => {
    const wrapper = await mountDrawer({ ...mockActivePreview, total: null })
    expect(wrapper.text()).not.toContain('Equivale en bultos')
  })
})

// ---------------------------------------------------------------------------
describe('conversionRatios', () => {
  it('muestra "1 bulto = N unidades" cuando hay unidades_x_pack', async () => {
    getProductById.mockResolvedValue({ ...mockProductDetail, unidades_x_pack: 12 })
    const wrapper = await mountDrawer(mockActivePreview)
    expect(wrapper.text()).toContain('1 bulto = 12 unidades')
  })

  it('muestra múltiples ratios cuando hay cajas_x_pack y unidades_x_caja', async () => {
    getProductById.mockResolvedValue({ ...mockProductDetail, unidades_x_pack: 24, cajas_x_pack: 4, unidades_x_caja: 6 })
    const wrapper = await mountDrawer(mockActivePreview)
    expect(wrapper.text()).toContain('1 bulto = 24 unidades')
    expect(wrapper.text()).toContain('1 caja = 6 unidades')
    expect(wrapper.text()).toContain('1 bulto = 4 cajas')
  })
})
