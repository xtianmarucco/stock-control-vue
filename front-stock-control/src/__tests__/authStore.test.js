import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../stores/authStore'

vi.mock('../services/AuthService', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  getMe: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
}))

import {
  login as apiLogin,
  logout as apiLogout,
  getMe,
  forgotPassword as apiForgotPassword,
  resetPassword as apiResetPassword,
} from '../services/AuthService'

const mockUser = { id: 1, email: 'admin@heladeria.com', full_name: 'Admin', role: 'admin' }

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
describe('getter: isAuthenticated', () => {
  it('es false cuando user es null', () => {
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
  })

  it('es true cuando hay un usuario seteado', () => {
    const store = useAuthStore()
    store.user = mockUser
    expect(store.isAuthenticated).toBe(true)
  })
})

// ---------------------------------------------------------------------------
describe('fetchMe', () => {
  it('setea el usuario cuando la API responde correctamente', async () => {
    getMe.mockResolvedValue(mockUser)
    const store = useAuthStore()
    await store.fetchMe()
    expect(store.user).toEqual(mockUser)
  })

  it('deja user en null si la API falla', async () => {
    getMe.mockRejectedValue(new Error('Unauthorized'))
    const store = useAuthStore()
    store.user = mockUser
    await store.fetchMe()
    expect(store.user).toBeNull()
  })
})

// ---------------------------------------------------------------------------
describe('login', () => {
  it('setea el usuario tras un login exitoso', async () => {
    apiLogin.mockResolvedValue(mockUser)
    const store = useAuthStore()
    await store.login('admin@heladeria.com', 'password')
    expect(store.user).toEqual(mockUser)
  })

  it('loading es true durante la llamada y false al terminar', async () => {
    let resolveLogin
    apiLogin.mockImplementation(() => new Promise(r => { resolveLogin = r }))
    const store = useAuthStore()

    const loginPromise = store.login('admin@heladeria.com', 'password')
    expect(store.loading).toBe(true)

    resolveLogin(mockUser)
    await loginPromise
    expect(store.loading).toBe(false)
  })

  it('loading vuelve a false aunque el login falle', async () => {
    apiLogin.mockRejectedValue(new Error('Invalid credentials'))
    const store = useAuthStore()
    await expect(store.login('x@x.com', 'wrong')).rejects.toThrow()
    expect(store.loading).toBe(false)
  })
})

// ---------------------------------------------------------------------------
describe('logout', () => {
  it('limpia el usuario tras logout', async () => {
    apiLogout.mockResolvedValue(undefined)
    const store = useAuthStore()
    store.user = mockUser
    await store.logout()
    expect(store.user).toBeNull()
  })
})

// ---------------------------------------------------------------------------
describe('action: forgotPassword', () => {
  it('llama al servicio con el email', async () => {
    apiForgotPassword.mockResolvedValue()
    const store = useAuthStore()
    await store.forgotPassword('admin@heladeria.com')
    expect(apiForgotPassword).toHaveBeenCalledWith('admin@heladeria.com')
  })

  it('loading vuelve a false aunque falle', async () => {
    apiForgotPassword.mockRejectedValue(new Error('Network error'))
    const store = useAuthStore()
    await expect(store.forgotPassword('admin@heladeria.com')).rejects.toThrow()
    expect(store.loading).toBe(false)
  })
})

// ---------------------------------------------------------------------------
describe('action: resetPassword', () => {
  it('llama al servicio con token y contraseña sin loguear al usuario', async () => {
    apiResetPassword.mockResolvedValue()
    const store = useAuthStore()
    await store.resetPassword('mi-token', 'password123')
    expect(apiResetPassword).toHaveBeenCalledWith('mi-token', 'password123')
    expect(store.isAuthenticated).toBe(false)
  })

  it('loading vuelve a false aunque falle', async () => {
    apiResetPassword.mockRejectedValue(new Error('Invalid token'))
    const store = useAuthStore()
    await expect(store.resetPassword('viejo', 'password123')).rejects.toThrow()
    expect(store.loading).toBe(false)
  })
})
