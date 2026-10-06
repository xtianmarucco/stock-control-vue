<template>
  <div class="min-h-screen bg-[#F5F7FB] flex items-center justify-center px-4">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
      <h1 class="text-2xl font-bold text-[#193B68] mb-1">Recuperar contraseña</h1>

      <template v-if="sent">
        <p class="text-sm text-gray-600 mt-4 mb-8">
          Si el email está registrado, te enviamos un link para restablecer tu contraseña.
          Revisá tu bandeja de entrada (y la carpeta de spam). El link vence en 30 minutos.
        </p>
      </template>

      <template v-else>
        <p class="text-sm text-gray-500 mb-8">Ingresá tu email y te mandamos un link para elegir una nueva.</p>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-[#193B68] mb-1">Email</label>
            <input
              v-model="email"
              type="email"
              autocomplete="email"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1479FF] focus:border-transparent"
              placeholder="usuario@email.com"
              required
            />
          </div>

          <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full bg-[#1479FF] text-white font-medium py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ authStore.loading ? 'Enviando...' : 'Enviar link' }}
          </button>
        </form>
      </template>

      <div class="mt-6 text-center">
        <RouterLink to="/login" class="text-sm font-medium text-[#1479FF] hover:underline">← Volver al login</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()

const email = ref('')
const sent = ref(false)
const error = ref('')

const handleSubmit = async () => {
  error.value = ''
  try {
    await authStore.forgotPassword(email.value)
    sent.value = true
  } catch (err) {
    error.value = err.response?.status === 400
      ? 'Ingresá un email válido.'
      : 'No pudimos procesar el pedido. Probá de nuevo en unos minutos.'
  }
}
</script>
