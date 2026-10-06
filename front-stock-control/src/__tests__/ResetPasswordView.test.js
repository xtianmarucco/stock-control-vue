import { vi, describe, it, expect, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

const push = vi.fn()
let query = {}
vi.mock('vue-router', () => ({
  useRoute: () => ({ query }),
  useRouter: () => ({ push }),
}))
vi.mock('../services/AuthService', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  getMe: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
}))

import { resetPassword as apiResetPassword } from '../services/AuthService'
import { useToastStore } from '../stores/toastStore'
import ResetPasswordView from '../views/ResetPasswordView.vue'

function mountView() {
  return shallowMount(ResetPasswordView, { global: { stubs: { RouterLink: true } } })
}

async function fillAndSubmit(wrapper, password, confirm) {
  const inputs = wrapper.findAll('input')
  await inputs[0].setValue(password)
  await inputs[1].setValue(confirm)
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  query = { token: 'mi-token' }
})

describe('sin token', () => {
  it('muestra el aviso y no el formulario', () => {
    query = {}
    const wrapper = mountView()
    expect(wrapper.text()).toContain('El link no es válido')
    expect(wrapper.find('form').exists()).toBe(false)
  })
})

describe('validaciones en el cliente', () => {
  it('rechaza contraseñas de menos de 8 caracteres sin llamar a la API', async () => {
    const wrapper = mountView()
    await fillAndSubmit(wrapper, '1234567', '1234567')
    expect(wrapper.text()).toContain('al menos 8 caracteres')
    expect(apiResetPassword).not.toHaveBeenCalled()
  })

  it('rechaza contraseñas que no coinciden sin llamar a la API', async () => {
    const wrapper = mountView()
    await fillAndSubmit(wrapper, 'password123', 'password124')
    expect(wrapper.text()).toContain('no coinciden')
    expect(apiResetPassword).not.toHaveBeenCalled()
  })
})

describe('envío', () => {
  it('si sale bien, muestra toast y redirige al login', async () => {
    apiResetPassword.mockResolvedValue()
    const wrapper = mountView()
    await fillAndSubmit(wrapper, 'password123', 'password123')
    expect(apiResetPassword).toHaveBeenCalledWith('mi-token', 'password123')
    expect(useToastStore().toasts.at(-1).message).toContain('Contraseña actualizada')
    expect(push).toHaveBeenCalledWith('/login')
  })

  it('si el token es inválido (400), muestra el error', async () => {
    apiResetPassword.mockRejectedValue({ response: { status: 400 } })
    const wrapper = mountView()
    await fillAndSubmit(wrapper, 'password123', 'password123')
    expect(wrapper.text()).toContain('El link es inválido o expiró')
    expect(push).not.toHaveBeenCalled()
  })
})
