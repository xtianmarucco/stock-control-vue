import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useToastStore } from '../stores/toastStore'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

// ---------------------------------------------------------------------------
describe('add', () => {
  it('agrega un toast con el mensaje y tipo correctos', () => {
    const store = useToastStore()
    store.add('Producto creado', 'success')
    expect(store.toasts).toHaveLength(1)
    expect(store.toasts[0]).toMatchObject({ message: 'Producto creado', type: 'success' })
  })

  it('el tipo por defecto es success', () => {
    const store = useToastStore()
    store.add('Guardado')
    expect(store.toasts[0].type).toBe('success')
  })

  it('asigna IDs únicos a cada toast', () => {
    const store = useToastStore()
    store.add('Mensaje 1')
    store.add('Mensaje 2')
    const [a, b] = store.toasts
    expect(a.id).not.toBe(b.id)
  })

  it('elimina el toast automáticamente tras la duración indicada', () => {
    const store = useToastStore()
    store.add('Temporal', 'info', 3000)
    expect(store.toasts).toHaveLength(1)
    vi.advanceTimersByTime(3000)
    expect(store.toasts).toHaveLength(0)
  })

  it('no elimina el toast antes de que expire la duración', () => {
    const store = useToastStore()
    store.add('Temporal', 'info', 3000)
    vi.advanceTimersByTime(2999)
    expect(store.toasts).toHaveLength(1)
  })

  it('usa 4000ms como duración por defecto', () => {
    const store = useToastStore()
    store.add('Default')
    vi.advanceTimersByTime(3999)
    expect(store.toasts).toHaveLength(1)
    vi.advanceTimersByTime(1)
    expect(store.toasts).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
describe('remove', () => {
  it('elimina solo el toast con el id especificado', () => {
    const store = useToastStore()
    store.add('Primero')
    store.add('Segundo')
    const idToRemove = store.toasts[0].id
    store.remove(idToRemove)
    expect(store.toasts).toHaveLength(1)
    expect(store.toasts[0].message).toBe('Segundo')
  })

  it('no hace nada si el id no existe', () => {
    const store = useToastStore()
    store.add('Único')
    store.remove(9999)
    expect(store.toasts).toHaveLength(1)
  })
})
