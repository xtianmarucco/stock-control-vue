<template>
  <DashboardLayout>
    <div class="space-y-5">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex justify-between items-center">
        <div>
          <h1 class="text-xl font-bold text-[#193B68]">Usuarios</h1>
          <p class="text-sm text-gray-400 mt-0.5">Gestión de usuarios del sistema</p>
        </div>
        <button
          v-if="isAdmin"
          class="bg-[#1479FF] hover:bg-[#0f66e0] text-white font-medium px-5 py-2 rounded-full text-sm transition-colors"
          @click="openCreate"
        >
          + Nuevo usuario
        </button>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table class="min-w-full text-sm text-left">
          <thead class="border-b border-gray-100">
            <tr>
              <th class="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Usuario</th>
              <th class="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Rol</th>
              <th class="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Creado</th>
              <th v-if="isAdmin" class="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in users"
              :key="user.id"
              class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 font-medium text-[#193B68]">
                {{ user.username }}
                <span v-if="user.id === authStore.user?.id" class="ml-2 text-xs text-gray-400">(vos)</span>
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  :class="user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'"
                >
                  {{ user.role === 'admin' ? 'Administrador' : 'Colaborador' }}
                </span>
              </td>
              <td class="px-6 py-4 text-gray-500">{{ formatDate(user.created_at) }}</td>
              <td v-if="isAdmin" class="px-6 py-4 text-right">
                <div class="flex justify-end gap-3">
                  <button @click="openEdit(user)" class="text-sm text-[#1479FF] hover:underline font-medium">
                    Editar
                  </button>
                  <button
                    @click="confirmDelete(user)"
                    :disabled="user.id === authStore.user?.id"
                    class="text-sm font-medium"
                    :class="user.id === authStore.user?.id ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:underline'"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="loading" class="text-center py-10 text-gray-300 text-sm">Cargando...</div>
        <div v-if="!loading && users.length === 0" class="text-center py-10 text-gray-400 text-sm">
          No hay usuarios registrados
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
          <h2 class="text-lg font-bold text-[#193B68]">
            {{ editTarget ? 'Editar usuario' : 'Nuevo usuario' }}
          </h2>

          <div class="space-y-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-[#193B68]">
                Usuario <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.username"
                type="text"
                placeholder="Ej: juan.perez"
                class="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#193B68] focus:outline-none focus:ring-2 focus:ring-[#1479FF] focus:border-transparent"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-[#193B68]">
                Contraseña <span v-if="!editTarget" class="text-red-500">*</span>
                <span v-else class="text-gray-400 font-normal">(dejar vacío para no cambiar)</span>
              </label>
              <input
                v-model="form.password"
                type="password"
                placeholder="••••••••"
                class="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#193B68] focus:outline-none focus:ring-2 focus:ring-[#1479FF] focus:border-transparent"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-[#193B68]">Rol <span class="text-red-500">*</span></label>
              <select
                v-model="form.role"
                class="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#193B68] focus:outline-none focus:ring-2 focus:ring-[#1479FF] focus:border-transparent"
              >
                <option value="colaborador">Colaborador</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <p v-if="formError" class="text-xs text-red-500">{{ formError }}</p>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button
              @click="closeModal"
              class="border border-gray-200 text-[#193B68] font-medium px-5 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="submitForm"
              :disabled="saving"
              class="bg-[#1479FF] hover:bg-[#0f66e0] text-white font-medium px-5 py-2 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {{ saving ? 'Guardando...' : (editTarget ? 'Guardar cambios' : 'Crear usuario') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
          <h2 class="text-lg font-bold text-[#193B68]">Eliminar usuario</h2>
          <p class="text-sm text-gray-500">
            ¿Estás seguro de eliminar al usuario <strong class="text-[#193B68]">{{ deleteTarget.username }}</strong>?
            <span class="font-semibold text-red-600">No se puede deshacer.</span>
          </p>
          <div class="flex justify-end gap-3 pt-1">
            <button
              @click="deleteTarget = null"
              class="border border-gray-200 text-[#193B68] font-medium px-5 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="doDelete"
              :disabled="deleting"
              class="bg-red-500 hover:bg-red-600 text-white font-medium px-5 py-2 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {{ deleting ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import { useAuthStore } from '../stores/authStore'
import { getUsers, createUser, updateUser, deleteUser } from '../services/UsersService.js'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.user?.role === 'admin')

const users = ref([])
const loading = ref(false)
const showModal = ref(false)
const editTarget = ref(null)
const deleteTarget = ref(null)
const saving = ref(false)
const deleting = ref(false)
const formError = ref('')
const form = ref({ username: '', password: '', role: 'colaborador' })

const fetchUsers = async () => {
  loading.value = true
  try {
    users.value = await getUsers()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  editTarget.value = null
  form.value = { username: '', password: '', role: 'colaborador' }
  formError.value = ''
  showModal.value = true
}

const openEdit = (user) => {
  editTarget.value = user
  form.value = { username: user.username, password: '', role: user.role }
  formError.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editTarget.value = null
}

const submitForm = async () => {
  formError.value = ''
  if (!form.value.username.trim()) {
    formError.value = 'El usuario es requerido'
    return
  }
  if (!editTarget.value && !form.value.password) {
    formError.value = 'La contraseña es requerida'
    return
  }
  saving.value = true
  try {
    if (editTarget.value) {
      await updateUser(editTarget.value.id, form.value)
    } else {
      await createUser(form.value)
    }
    closeModal()
    await fetchUsers()
  } catch (err) {
    const status = err.response?.status
    const msg = err.response?.data?.error?.message
    formError.value = status === 409 ? 'Ese nombre de usuario ya existe' : msg || 'Error al guardar'
  } finally {
    saving.value = false
  }
}

const confirmDelete = (user) => {
  deleteTarget.value = user
}

const doDelete = async () => {
  deleting.value = true
  try {
    await deleteUser(deleteTarget.value.id)
    deleteTarget.value = null
    await fetchUsers()
  } catch (err) {
    console.error(err)
  } finally {
    deleting.value = false
  }
}

const formatDate = (date) => new Date(date).toLocaleDateString('es-AR')

onMounted(fetchUsers)
</script>
