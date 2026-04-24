<template>
  <DashboardLayout>
    <div class="space-y-5">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex justify-between items-center">
        <div>
          <h1 class="text-xl font-bold text-[#193B68]">Sucursales</h1>
          <p class="text-sm text-gray-400 mt-0.5">Gestión de sucursales del sistema</p>
        </div>
        <button
          class="bg-[#1479FF] hover:bg-[#0f66e0] text-white font-medium px-5 py-2 rounded-full text-sm transition-colors"
          @click="openCreate"
        >
          + Nueva sucursal
        </button>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table class="min-w-full text-sm text-left">
          <thead class="border-b border-gray-100">
            <tr>
              <th class="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Nombre</th>
              <th class="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Dirección</th>
              <th class="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Estado</th>
              <th class="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="branch in branches"
              :key="branch.id"
              class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 font-medium text-[#193B68]">{{ branch.name }}</td>
              <td class="px-6 py-4 text-gray-500">{{ branch.address || '—' }}</td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  :class="branch.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
                >
                  {{ branch.is_active ? 'Activa' : 'Inactiva' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-3">
                  <button @click="openEdit(branch)" class="text-sm text-[#1479FF] hover:underline font-medium">
                    Editar
                  </button>
                  <button @click="confirmDelete(branch)" class="text-sm text-red-500 hover:underline font-medium">
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="loading" class="text-center py-10 text-gray-300 text-sm">Cargando...</div>
        <div v-if="!loading && branches.length === 0" class="text-center py-10 text-gray-400 text-sm">
          No hay sucursales registradas
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
          <h2 class="text-lg font-bold text-[#193B68]">
            {{ editTarget ? 'Editar sucursal' : 'Nueva sucursal' }}
          </h2>

          <div class="space-y-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-[#193B68]">
                Nombre <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Ej: Castelli"
                class="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#193B68] focus:outline-none focus:ring-2 focus:ring-[#1479FF] focus:border-transparent"
              />
              <p v-if="formError" class="text-xs text-red-500">{{ formError }}</p>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-[#193B68]">Dirección</label>
              <input
                v-model="form.address"
                type="text"
                placeholder="Ej: Av. Castelli 1234"
                class="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#193B68] focus:outline-none focus:ring-2 focus:ring-[#1479FF] focus:border-transparent"
              />
            </div>
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
              {{ saving ? 'Guardando...' : (editTarget ? 'Guardar cambios' : 'Crear sucursal') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
          <h2 class="text-lg font-bold text-[#193B68]">Eliminar sucursal</h2>
          <p class="text-sm text-gray-500">
            ¿Estás seguro de eliminar <strong class="text-[#193B68]">{{ deleteTarget.name }}</strong>?
            Esta acción eliminará también todo su stock y movimientos asociados.
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
import { ref, onMounted } from 'vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import { getBranches, createBranch, updateBranch, deleteBranch } from '../services/BranchService.js'

const branches = ref([])
const loading = ref(false)
const showModal = ref(false)
const editTarget = ref(null)
const deleteTarget = ref(null)
const saving = ref(false)
const deleting = ref(false)
const formError = ref('')
const form = ref({ name: '', address: '' })

const fetchBranches = async () => {
  loading.value = true
  try {
    branches.value = await getBranches()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  editTarget.value = null
  form.value = { name: '', address: '' }
  formError.value = ''
  showModal.value = true
}

const openEdit = (branch) => {
  editTarget.value = branch
  form.value = { name: branch.name, address: branch.address || '' }
  formError.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editTarget.value = null
}

const submitForm = async () => {
  formError.value = ''
  if (!form.value.name.trim()) {
    formError.value = 'El nombre es requerido'
    return
  }
  saving.value = true
  try {
    if (editTarget.value) {
      await updateBranch(editTarget.value.id, form.value)
    } else {
      await createBranch(form.value)
    }
    closeModal()
    await fetchBranches()
  } catch (err) {
    const msg = err.response?.data?.error?.message
    formError.value = err.response?.status === 409
      ? 'Ya existe una sucursal con ese nombre'
      : msg || 'Error al guardar'
  } finally {
    saving.value = false
  }
}

const confirmDelete = (branch) => {
  deleteTarget.value = branch
}

const doDelete = async () => {
  deleting.value = true
  try {
    await deleteBranch(deleteTarget.value.id)
    deleteTarget.value = null
    await fetchBranches()
  } catch (err) {
    console.error(err)
  } finally {
    deleting.value = false
  }
}

onMounted(fetchBranches)
</script>
