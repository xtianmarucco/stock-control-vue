<template>
  <div class="space-y-5">
    <!-- Encabezado -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex justify-between items-center">
      <div>
        <h1 class="text-xl font-bold text-[#193B68]">Movimientos de Stock</h1>
        <p class="text-sm text-gray-400 mt-0.5">Registros y filtros de movimientos</p>
      </div>
      <button
        class="bg-[#1479FF] hover:bg-[#0f66e0] text-white font-medium px-5 py-2 rounded-full text-sm transition-colors"
        @click="openMovementModal"
      >
        + Nuevo movimiento
      </button>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
      <div class="flex flex-wrap items-end gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Sucursal</label>
          <select v-model="filters.branch" class="border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#193B68] focus:outline-none focus:ring-2 focus:ring-[#1479FF] min-w-[160px]">
            <option value="">Todas las sucursales</option>
            <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
          </select>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Tipo</label>
          <select v-model="filters.type" class="border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#193B68] focus:outline-none focus:ring-2 focus:ring-[#1479FF] min-w-[140px]">
            <option value="">Todos</option>
            <option value="TRANSFER">Traslado</option>
            <option value="ADJUSTMENT">Ajuste</option>
            <option value="INTERNAL">Interno</option>
          </select>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Desde</label>
          <input type="date" v-model="filters.from" class="border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#193B68] focus:outline-none focus:ring-2 focus:ring-[#1479FF]" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Hasta</label>
          <input type="date" v-model="filters.to" class="border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#193B68] focus:outline-none focus:ring-2 focus:ring-[#1479FF]" />
        </div>

        <div class="flex gap-2 ml-auto">
          <button
            class="bg-[#1479FF] hover:bg-[#0f66e0] text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors"
            @click="fetchMovements"
          >
            Filtrar
          </button>
          <button
            class="border border-gray-200 text-[#193B68] font-medium px-5 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            @click="clearFilters"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="flex flex-col gap-3 border-b border-gray-100 bg-[#F8FAFD] px-6 py-4 md:flex-row md:items-center md:justify-between">
        <p class="text-sm text-[var(--color-text-muted)]">
          Mostrando {{ paginationLabel }}
        </p>

        <label class="flex items-center gap-3 text-sm text-[#193B68]">
          <span class="font-medium">Por página</span>
          <select
            v-model.number="pageSize"
            class="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#1479FF] focus:ring-4 focus:ring-[#DCEBFF]"
          >
            <option v-for="option in pageSizeOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </label>
      </div>

      <table class="min-w-full text-sm text-left">
        <thead class="border-b border-gray-100">
          <tr>
            <th class="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Fecha</th>
            <th class="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Tipo</th>
            <th class="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Sucursal origen</th>
            <th class="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Sucursal destino</th>
            <th class="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Realizado por</th>
            <th class="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Productos</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="mov in paginatedMovements"
            :key="mov.id"
            class="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
            @click="openDetailModal(mov.id)"
          >
            <td class="px-6 py-4 text-[#193B68] font-medium">{{ formatDate(mov.created_at) }}</td>
            <td class="px-6 py-4">
              <span :class="typeBadge(mov.movement_type)">{{ formatType(mov.movement_type) }}</span>
            </td>
            <td class="px-6 py-4 text-[#193B68]">{{ mov.from_branch_name || getBranchName(mov.from_branch_id) }}</td>
            <td class="px-6 py-4 text-gray-400">{{ mov.to_branch_name || getBranchName(mov.to_branch_id) || '—' }}</td>
            <td class="px-6 py-4 text-gray-500">{{ mov.created_by?.username || '—' }}</td>
            <td class="px-6 py-4 text-right text-[#193B68] font-medium">{{ mov.items?.length || 0 }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="!loading && movements.length === 0" class="text-center py-10 text-gray-400 text-sm">
        No se encontraron movimientos
      </div>
      <div v-if="loading" class="text-center py-10 text-gray-300 text-sm">
        Cargando...
      </div>

      <div
        v-if="!loading && totalPages > 1"
        class="flex flex-col gap-3 border-t border-gray-100 bg-[#F8FAFD] px-6 py-4 md:flex-row md:items-center md:justify-between"
      >
        <p class="text-sm text-[var(--color-text-muted)]">
          Página {{ currentPage }} de {{ totalPages }}
        </p>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-[#193B68] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="currentPage === 1"
            @click="goToPreviousPage"
          >
            Anterior
          </button>

          <span class="rounded-full bg-white px-3 py-1 text-sm font-semibold text-[#193B68]">
            {{ currentPage }}
          </span>

          <button
            type="button"
            class="rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-[#193B68] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="currentPage === totalPages"
            @click="goToNextPage"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <MovementDetailModal v-model="isDetailModalOpen" :movement-id="selectedMovementId" />

    <StockMovementModal
      v-if="showMovementModal"
      :branches="branches"
      :default-branch-id="Number(filters.branch) || branches[0]?.id"
      @close="showMovementModal = false"
      @saved="onMovementSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import MovementDetailModal from '../components/movement-detail-modal/MovementDetailModal.vue'
import { getStockMovements } from '../services/MovementsService.js'
import { getBranches } from '../services/BranchService.js'
import StockMovementModal from '../components/StockMovementModal/StockMovementModal.vue'

const movements = ref([])
const branches = ref([])
const filters = ref({ branch: '', type: '', from: '', to: '' })
const loading = ref(false)
const isDetailModalOpen = ref(false)
const selectedMovementId = ref(null)
const showMovementModal = ref(false)
const currentPage = ref(1)
const pageSize = ref(25)
const pageSizeOptions = [10, 25, 50, 100]

const fetchMovements = async () => {
  loading.value = true
  try {
    movements.value = await getStockMovements(filters.value)
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  filters.value = { branch: '', type: '', from: '', to: '' }
  fetchMovements()
}

const fetchBranches = async () => {
  try {
    branches.value = await getBranches()
  } catch (err) {
    console.error(err)
  }
}

const branchesMap = computed(() =>
  branches.value.reduce((acc, b) => { acc[b.id] = b.name; return acc }, {})
)
const totalPages = computed(() => Math.max(1, Math.ceil(movements.value.length / pageSize.value)))
const paginatedMovements = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return movements.value.slice(start, start + pageSize.value)
})
const paginationLabel = computed(() => {
  if (!movements.value.length) return '0 resultados'

  const start = (currentPage.value - 1) * pageSize.value + 1
  const end = Math.min(currentPage.value * pageSize.value, movements.value.length)

  return `${start}-${end} de ${movements.value.length} movimientos`
})
const getBranchName = (id) => branchesMap.value[id] || '—'

const formatDate = (date) => new Date(date).toLocaleDateString('es-AR')
const formatType = (type) => ({ TRANSFER: 'Traslado', ADJUSTMENT: 'Ajuste', INTERNAL: 'Interno' }[type] || type)

const typeBadge = (type) => {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold'
  const map = {
    TRANSFER: `${base} bg-blue-100 text-blue-700`,
    ADJUSTMENT: `${base} bg-orange-100 text-orange-700`,
    INTERNAL: `${base} bg-purple-100 text-purple-700`
  }
  return map[type] ?? `${base} bg-gray-100 text-gray-600`
}

const openDetailModal = (id) => {
  selectedMovementId.value = id
  isDetailModalOpen.value = true
}

const openMovementModal = async () => {
  showMovementModal.value = true
}

const onMovementSaved = () => fetchMovements()
const goToPreviousPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

watch([filters, pageSize], () => {
  currentPage.value = 1
}, { deep: true })

watch(totalPages, (pages) => {
  if (currentPage.value > pages) {
    currentPage.value = pages
  }
})

onMounted(async () => {
  await fetchBranches()
  await fetchMovements()
})
</script>
