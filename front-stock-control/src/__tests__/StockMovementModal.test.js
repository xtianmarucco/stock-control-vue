import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import StockMovementModal from '../components/StockMovementModal/StockMovementModal.vue'

vi.mock('../services/MovementsService.js', () => ({ createStockMovement: vi.fn() }))
vi.mock('../services/ProductService.js', () => ({ getStockByBranch: vi.fn() }))
vi.mock('../services/ReasonCategoriesService.js', () => ({ getReasonCategories: vi.fn() }))

import { createStockMovement } from '../services/MovementsService.js'
import { getStockByBranch } from '../services/ProductService.js'
import { getReasonCategories } from '../services/ReasonCategoriesService.js'

const mockBranches = [{ id: 1, name: 'Central' }, { id: 2, name: 'Norte' }]
const mockReasonCategories = [{ id: 10, code: 'MERMA', label: 'Merma', movement_type: 'ADJUSTMENT' }]

function mountModal(propsOverrides = {}) {
  return shallowMount(StockMovementModal, {
    props: { branches: mockBranches, defaultBranchId: 1, ...propsOverrides },
    global: { plugins: [createPinia()] },
  })
}

// setupState desenvuelve los refs automáticamente:
// - LEER:   state.currentStep  → número
// - ESCRIBIR: state.currentStep = X → dispara ref.value = X via el proxy setter
function state(wrapper) {
  return wrapper.vm.$.setupState
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  getReasonCategories.mockResolvedValue(mockReasonCategories)
  getStockByBranch.mockResolvedValue({ products: [] })
  createStockMovement.mockResolvedValue({ id: 1 })
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
describe('renderizado inicial', () => {
  it('muestra las 3 etiquetas del stepper', async () => {
    const wrapper = mountModal()
    await flushPromises()
    expect(wrapper.text()).toContain('Tipo y sucursal')
    expect(wrapper.text()).toContain('Productos')
    expect(wrapper.text()).toContain('Revisión')
  })

  it('el botón Atrás está deshabilitado en el paso 0', async () => {
    const wrapper = mountModal()
    await flushPromises()
    const atrasBtn = wrapper.findAll('button').find(b => b.text().includes('Atrás'))
    expect(atrasBtn.element.disabled).toBe(true)
  })

  it('muestra "Siguiente" y no "Confirmar movimiento" en el paso 0', async () => {
    const wrapper = mountModal()
    await flushPromises()
    expect(wrapper.text()).toContain('Siguiente')
    expect(wrapper.text()).not.toContain('Confirmar movimiento')
  })

  it('el paso inicial es 0', async () => {
    const wrapper = mountModal()
    await flushPromises()
    expect(state(wrapper).currentStep).toBe(0)
  })
})

// ---------------------------------------------------------------------------
describe('botón cerrar', () => {
  it('emite close al hacer click en ✕', async () => {
    const wrapper = mountModal()
    await flushPromises()
    await wrapper.findAll('button').find(b => b.text().includes('✕')).trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
describe('llamadas a servicios', () => {
  it('llama a getReasonCategories al montar', async () => {
    mountModal()
    await flushPromises()
    expect(getReasonCategories).toHaveBeenCalledOnce()
  })

  it('llama a getStockByBranch con defaultBranchId al montar (watcher inmediato)', async () => {
    mountModal()
    await flushPromises()
    expect(getStockByBranch).toHaveBeenCalledWith(1)
  })

  it('usa el defaultBranchId recibido por prop', async () => {
    mountModal({ defaultBranchId: 2 })
    await flushPromises()
    expect(getStockByBranch).toHaveBeenCalledWith(2)
  })

  it('vuelve a llamar a getStockByBranch al cambiar from_branch_id', async () => {
    const wrapper = mountModal()
    await flushPromises()
    state(wrapper).draft.from_branch_id = 2
    await flushPromises()
    expect(getStockByBranch).toHaveBeenCalledWith(2)
  })

  it('resetea items al cambiar from_branch_id', async () => {
    const wrapper = mountModal()
    await flushPromises()
    state(wrapper).draft.items = [{ product_id: 1 }]
    state(wrapper).draft.from_branch_id = 2
    await wrapper.vm.$nextTick()
    expect(state(wrapper).draft.items).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
describe('validateStep1 — navegación al paso 1', () => {
  it('muestra error y permanece en paso 0 si movement_type es null', async () => {
    const wrapper = mountModal()
    await flushPromises()
    await wrapper.findAll('button').find(b => b.text().includes('Siguiente')).trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Seleccioná un tipo de movimiento')
    expect(state(wrapper).currentStep).toBe(0)
  })

  it('avanza al paso 1 si el draft es válido para TRANSFER', async () => {
    const wrapper = mountModal()
    await flushPromises()
    Object.assign(state(wrapper).draft, { movement_type: 'TRANSFER', from_branch_id: 1, to_branch_id: 2 })
    await wrapper.findAll('button').find(b => b.text().includes('Siguiente')).trigger('click')
    await wrapper.vm.$nextTick()
    expect(state(wrapper).currentStep).toBe(1)
  })

  it('muestra error si TRANSFER tiene el mismo origen y destino', async () => {
    const wrapper = mountModal()
    await flushPromises()
    state(wrapper).draft.movement_type = 'TRANSFER'
    await flushPromises() // esperar a que el watcher de movement_type se asiente
    state(wrapper).draft.to_branch_id = 1 // mismo que from_branch_id (1)
    await wrapper.findAll('button').find(b => b.text().includes('Siguiente')).trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('origen y destino deben ser distintas')
    expect(state(wrapper).currentStep).toBe(0)
  })

  it('muestra error si TRANSFER no tiene sucursal destino', async () => {
    const wrapper = mountModal()
    await flushPromises()
    state(wrapper).draft.movement_type = 'TRANSFER'
    await flushPromises() // esperar a que el watcher de movement_type se asiente
    // to_branch_id queda null (no lo asignamos)
    await wrapper.findAll('button').find(b => b.text().includes('Siguiente')).trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('sucursal origen y otra destino')
  })

  it('muestra error si ADJUSTMENT no tiene reason_category_id', async () => {
    const wrapper = mountModal()
    await flushPromises()
    state(wrapper).draft.movement_type = 'ADJUSTMENT'
    await flushPromises() // esperar a que el watcher de movement_type se asiente
    // reason_category_id queda null tras el watcher
    await wrapper.findAll('button').find(b => b.text().includes('Siguiente')).trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Seleccioná un motivo')
  })

  it('avanza al paso 1 si el draft es válido para ADJUSTMENT', async () => {
    const wrapper = mountModal()
    await flushPromises()
    Object.assign(state(wrapper).draft, { movement_type: 'ADJUSTMENT', from_branch_id: 1, reason_category_id: 10 })
    await wrapper.findAll('button').find(b => b.text().includes('Siguiente')).trigger('click')
    await wrapper.vm.$nextTick()
    expect(state(wrapper).currentStep).toBe(1)
  })
})

// ---------------------------------------------------------------------------
describe('validateStep2 — navegación al paso 2', () => {
  async function goToStep1(wrapper) {
    Object.assign(state(wrapper).draft, { movement_type: 'TRANSFER', from_branch_id: 1, to_branch_id: 2 })
    state(wrapper).currentStep = 1
    await wrapper.vm.$nextTick()
  }

  it('muestra error si items está vacío', async () => {
    const wrapper = mountModal()
    await flushPromises()
    await goToStep1(wrapper)
    state(wrapper).draft.items = []
    await wrapper.findAll('button').find(b => b.text().includes('Siguiente')).trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Agregá al menos un producto')
  })

  it('muestra error si un item no tiene product_id', async () => {
    const wrapper = mountModal()
    await flushPromises()
    await goToStep1(wrapper)
    state(wrapper).draft.items = [{ product_id: null, quantity_input: 5, quantity_unit: 'UNIDAD' }]
    await wrapper.findAll('button').find(b => b.text().includes('Siguiente')).trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('sin producto seleccionado')
  })

  it('muestra error si la cantidad es 0 o negativa', async () => {
    const wrapper = mountModal()
    await flushPromises()
    await goToStep1(wrapper)
    state(wrapper).draft.items = [{ product_id: 1, quantity_input: 0, quantity_unit: 'UNIDAD', product_name: 'Helado' }]
    await wrapper.findAll('button').find(b => b.text().includes('Siguiente')).trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('mayor a cero')
  })

  it('muestra error de stock insuficiente en TRANSFER', async () => {
    const wrapper = mountModal()
    await flushPromises()
    await goToStep1(wrapper)
    state(wrapper).draft.items = [{
      product_id: 1, product_name: 'Helado',
      quantity_input: 50, quantity_unit: 'UNIDAD',
      available_stock: 10, unidades_x_pack: 12,
    }]
    await wrapper.findAll('button').find(b => b.text().includes('Siguiente')).trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Stock insuficiente')
  })

  it('avanza al paso 2 si los items son válidos', async () => {
    const wrapper = mountModal()
    await flushPromises()
    await goToStep1(wrapper)
    state(wrapper).draft.items = [{
      product_id: 1, product_name: 'Helado',
      quantity_input: 3, quantity_unit: 'UNIDAD',
      available_stock: 100, unidades_x_pack: 12,
    }]
    await wrapper.findAll('button').find(b => b.text().includes('Siguiente')).trigger('click')
    await wrapper.vm.$nextTick()
    expect(state(wrapper).currentStep).toBe(2)
  })
})

// ---------------------------------------------------------------------------
describe('submit', () => {
  async function goToStep2(wrapper) {
    // Setear movement_type primero y esperar al watcher (que resetea items)
    state(wrapper).draft.movement_type = 'TRANSFER'
    await flushPromises()
    // Ahora el watcher ya corrió — asignar el resto sin que se pisen
    state(wrapper).draft.from_branch_id = 1
    state(wrapper).draft.to_branch_id = 2
    state(wrapper).draft.items = [{ product_id: 1, quantity_input: 3, quantity_unit: 'UNIDAD', available_stock: 100, unidades_x_pack: 12 }]
    state(wrapper).currentStep = 2
    await wrapper.vm.$nextTick()
  }

  it('llama a createStockMovement con el payload correcto', async () => {
    const wrapper = mountModal()
    await flushPromises()
    await goToStep2(wrapper)
    await wrapper.findAll('button').find(b => b.text().includes('Confirmar')).trigger('click')
    await flushPromises()
    expect(createStockMovement).toHaveBeenCalledOnce()
    const payload = createStockMovement.mock.calls[0][0]
    expect(payload.movement_type).toBe('TRANSFER')
    expect(payload.items[0].product_id).toBe(1)
    expect(payload.items[0].quantity).toBe(3)
  })

  it('emite saved y close tras un submit exitoso', async () => {
    const wrapper = mountModal()
    await flushPromises()
    await goToStep2(wrapper)
    await wrapper.findAll('button').find(b => b.text().includes('Confirmar')).trigger('click')
    await flushPromises()
    expect(wrapper.emitted('saved')).toBeTruthy()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('muestra mensaje de error si createStockMovement falla', async () => {
    createStockMovement.mockRejectedValue({ response: { data: { error: { message: 'Stock insuficiente en servidor' } } } })
    const wrapper = mountModal()
    await flushPromises()
    await goToStep2(wrapper)
    await wrapper.findAll('button').find(b => b.text().includes('Confirmar')).trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Stock insuficiente en servidor')
  })
})

// ---------------------------------------------------------------------------
describe('toUnidades — conversión de cantidades', () => {
  it('retorna la cantidad directa en modo UNIDAD', async () => {
    const wrapper = mountModal()
    await flushPromises()
    expect(state(wrapper).toUnidades({ quantity_input: 5, quantity_unit: 'UNIDAD' })).toBe(5)
  })

  it('retorna null si quantity_input es 0', async () => {
    const wrapper = mountModal()
    await flushPromises()
    expect(state(wrapper).toUnidades({ quantity_input: 0, quantity_unit: 'UNIDAD' })).toBeNull()
  })

  it('convierte BULTO a unidades usando unidades_x_pack', async () => {
    const wrapper = mountModal()
    await flushPromises()
    expect(state(wrapper).toUnidades({ quantity_input: 2, quantity_unit: 'BULTO', unidades_x_pack: 12 })).toBe(24)
  })

  it('convierte CAJA a unidades usando unidades_x_caja', async () => {
    const wrapper = mountModal()
    await flushPromises()
    expect(state(wrapper).toUnidades({ quantity_input: 3, quantity_unit: 'CAJA', unidades_x_caja: 6 })).toBe(18)
  })

  it('retorna null si CAJA no tiene unidades_x_caja definido', async () => {
    const wrapper = mountModal()
    await flushPromises()
    expect(state(wrapper).toUnidades({ quantity_input: 2, quantity_unit: 'CAJA', unidades_x_caja: null })).toBeNull()
  })
})

// ---------------------------------------------------------------------------
describe('transformQuantity', () => {
  it('devuelve cantidad positiva para TRANSFER', async () => {
    const wrapper = mountModal()
    await flushPromises()
    expect(state(wrapper).transformQuantity(5, 'TRANSFER')).toBe(5)
  })

  it('devuelve cantidad negativa para ADJUSTMENT', async () => {
    const wrapper = mountModal()
    await flushPromises()
    expect(state(wrapper).transformQuantity(3, 'ADJUSTMENT')).toBe(-3)
  })

  it('garantiza negativo aunque se pase un valor negativo para ADJUSTMENT', async () => {
    const wrapper = mountModal()
    await flushPromises()
    expect(state(wrapper).transformQuantity(-7, 'ADJUSTMENT')).toBe(-7)
  })
})
