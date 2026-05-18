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
              <th class="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Nombre</th>
              <th class="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</th>
              <th class="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">DNI</th>
              <th class="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Rol</th>
              <th class="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Creado</th>
              <th v-if="isAdmin" class="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="loading">
              <tr v-for="i in 5" :key="`sk-${i}`" class="border-b border-gray-50">
                <td class="px-6 py-4"><SkeletonBlock width="150px" height="15px" /></td>
                <td class="px-6 py-4"><SkeletonBlock width="170px" height="15px" /></td>
                <td class="px-6 py-4"><SkeletonBlock width="90px" height="15px" /></td>
                <td class="px-6 py-4"><SkeletonBlock width="80px" height="20px" rounded="999px" /></td>
                <td class="px-6 py-4"><SkeletonBlock width="80px" height="15px" /></td>
                <td v-if="isAdmin" class="px-6 py-4 text-right">
                  <div class="flex justify-end gap-3">
                    <SkeletonBlock width="44px" height="15px" rounded="6px" />
                    <SkeletonBlock width="58px" height="15px" rounded="6px" />
                  </div>
                </td>
              </tr>
            </template>
            <tr
              v-for="user in users"
              :key="user.id"
              class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 font-medium text-[#193B68]">
                {{ user.full_name }}
                <span v-if="user.id === authStore.user?.id" class="ml-2 text-xs text-gray-400">(vos)</span>
              </td>
              <td class="px-6 py-4 text-gray-500">{{ user.email }}</td>
              <td class="px-6 py-4 text-gray-500">{{ user.dni || '—' }}</td>
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
                Nombre completo <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.full_name"
                type="text"
                placeholder="Ej: Juan Pérez"
                class="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#193B68] focus:outline-none focus:ring-2 focus:ring-[#1479FF] focus:border-transparent"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-[#193B68]">
                Email <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.email"
                type="email"
                placeholder="Ej: juan@empresa.com"
                class="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#193B68] focus:outline-none focus:ring-2 focus:ring-[#1479FF] focus:border-transparent"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-[#193B68]">
                DNI <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.dni"
                type="text"
                placeholder="Ej: 30123456"
                class="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#193B68] focus:outline-none focus:ring-2 focus:ring-[#1479FF] focus:border-transparent"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-[#193B68]">
                Contraseña
                <span v-if="!editTarget" class="text-red-500">*</span>
                <span v-else class="text-gray-400 font-normal">(dejar vacío para no cambiar)</span>
              </label>
              <div class="relative">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  class="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-[#193B68] focus:outline-none focus:ring-2 focus:ring-[#1479FF] focus:border-transparent"
                />
                <button
                  type="button"
                  tabindex="-1"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  @click="showPassword = !showPassword"
                >
                  <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
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
            ¿Estás seguro de eliminar a <strong class="text-[#193B68]">{{ deleteTarget.full_name }}</strong>?
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
import SkeletonBlock from '../components/ui/SkeletonBlock.vue'
import { useAuthStore } from '../stores/authStore'
import { useToastStore } from '../stores/toastStore'
import { getUsers, createUser, updateUser, deleteUser } from '../services/UsersService.js'

const authStore = useAuthStore()
const toast = useToastStore()
const isAdmin = computed(() => authStore.user?.role === 'admin')

const users = ref([])
const loading = ref(false)
const showModal = ref(false)
const showPassword = ref(false)
const editTarget = ref(null)
const deleteTarget = ref(null)
const saving = ref(false)
const deleting = ref(false)
const formError = ref('')
const form = ref({ full_name: '', email: '', dni: '', password: '', role: 'colaborador' })

const formatDate = (date) => new Date(date).toLocaleDateString('es-AR')

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
  form.value = { full_name: '', email: '', dni: '', password: '', role: 'colaborador' }
  formError.value = ''
  showPassword.value = false
  showModal.value = true
}

const openEdit = (user) => {
  editTarget.value = user
  form.value = { full_name: user.full_name, email: user.email, dni: user.dni || '', password: '', role: user.role }
  formError.value = ''
  showPassword.value = false
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editTarget.value = null
}

const submitForm = async () => {
  formError.value = ''
  saving.value = true
  try {
    if (editTarget.value) {
      await updateUser(editTarget.value.id, form.value)
      toast.add('Usuario actualizado correctamente')
    } else {
      await createUser(form.value)
      toast.add('Usuario creado correctamente')
    }
    closeModal()
    await fetchUsers()
  } catch (err) {
    const msg = err.response?.data?.error?.message
    formError.value = err.response?.status === 409
      ? 'Ese email ya está en uso'
      : msg || 'Error al guardar'
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
    toast.add('Usuario eliminado correctamente')
  } catch (err) {
    deleteTarget.value = null
    toast.add('No se pudo eliminar el usuario', 'error')
  } finally {
    deleting.value = false
  }
}

onMounted(fetchUsers)
</script>
