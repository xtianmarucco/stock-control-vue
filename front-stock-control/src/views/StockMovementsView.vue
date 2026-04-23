<!-- src/views/StockMovementsView.vue -->
<template>
  <div class="space-y-6">
    <!-- Encabezado -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-semibold">Gestión de Movimientos de Stock</h1>
      <button
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-all"
        @click="openMovementModal"
      >
        ➕ Nuevo movimiento
      </button>
    </div>

    <!-- Filtros -->
    <div class="flex flex-wrap items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div>
        <label class="text-sm text-gray-600 block mb-1">Sucursal</label>
        <select v-model="filters.branch" class="border rounded-lg px-3 py-2">
          <option value="">Todas</option>
          <option v-for="b in branches" :key="b.id" :value="b.id">
            {{ b.name }}
          </option>
        </select>
      </div>

      <div>
        <label class="text-sm text-gray-600 block mb-1">Tipo de movimiento</label>
        <select v-model="filters.type" class="border rounded-lg px-3 py-2">
          <option value="">Todos</option>
          <option value="TRANSFER">Traslado</option>
          <option value="ADJUSTMENT">Ajuste</option>
          <option value="INTERNAL">Interno</option>
        </select>
      </div>

      <div class="flex items-end gap-2">
        <div>
          <label class="text-sm text-gray-600 block mb-1">Desde</label>
          <input type="date" v-model="filters.from" class="border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label class="text-sm text-gray-600 block mb-1">Hasta</label>
          <input type="date" v-model="filters.to" class="border rounded-lg px-3 py-2" />
        </div>
      </div>

      <button
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg ml-auto transition-all"
        @click="fetchMovements"
      >
        🔄 Filtrar
      </button>
    </div>

    <!-- Tabla -->
    <div class="overflow-x-auto bg-white shadow rounded-lg border border-gray-200">
      <table class="min-w-full text-sm text-left">
        <thead class="bg-gray-100 border-b text-gray-700 uppercase text-xs">
          <tr>
            <th class="px-4 py-3">Fecha</th>
            <th class="px-4 py-3">Tipo</th>
            <th class="px-4 py-3">Sucursal Origen</th>
            <th class="px-4 py-3">Sucursal Destino</th>
            <th class="px-4 py-3 text-right">Productos</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="mov in movements"
            :key="mov.id"
            class="border-b hover:bg-gray-50 transition-colors cursor-pointer"
            @click="openDetailModal(mov.id)"
          >
            <td class="px-4 py-3">{{ formatDate(mov.created_at) }}</td>
            <td class="px-4 py-3">{{ formatType(mov.movement_type) }}</td>
            <td class="px-4 py-3">{{ getBranchName(mov.from_branch_id) }}</td>
            <td class="px-4 py-3">{{ getBranchName(mov.to_branch_id) }}</td>
            <td class="px-4 py-3 text-right">{{ mov.items?.length || 0 }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="!loading && movements.length === 0" class="text-center py-6 text-gray-500">
        No se encontraron movimientos
      </div>

      <div v-if="loading" class="text-center py-6 text-gray-400 italic">
        Cargando movimientos...
      </div>
    </div>

    <!-- Modal de Detalle -->
    <MovementDetailModal
      v-model="isDetailModalOpen"
      :movement-id="selectedMovementId"
    />

    <!-- Modal de nuevo movimiento -->
    <StockMovementModal
      v-if="showMovementModal"
      :branches="branches"
      :products="products.products"
  :default-branch-id="Number(filters.branch) || branches[0]?.id"
      @close="showMovementModal = false"
      @saved="onMovementSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import MovementDetailModal from '../components/movement-detail-modal/MovementDetailModal.vue'
import { getStockMovements } from '../services/movementsService.js'
import { getBranches } from '../services/branchService.js'
import { getStockByBranch } from '../services/productService.js'
import StockMovementModal from '../components/StockMovementModal/StockMovementModal.vue'

// 🔹 Estados
const movements = ref([])
const branches = ref([])
const products = ref([])
const filters = ref({
  branch: '',
  type: '',
  from: '',
  to: ''
})
const loading = ref(false)
const isDetailModalOpen = ref(false)
const selectedMovementId = ref(null)
const showMovementModal = ref(false)

// 🔹 Fetch movimientos
const fetchMovements = async () => {
  loading.value = true
  try {
    const res = await getStockMovements(filters.value)
    movements.value = res
  } catch (err) {
    console.error('❌ Error al obtener movimientos:', err)
  } finally {
    loading.value = false
  }
}

// 🔹 Fetch sucursales
const fetchBranches = async () => {
  try {
    branches.value = await getBranches()
  } catch (err) {
    console.error('❌ Error fetching branches:', err)
  }
}

// 🔹 Fetch productos por sucursal para el modal
const fetchProductsForBranch = async () => {
  // Usar el branch de filtros o el primero disponible
  const branchToUse = filters.value.branch
    ? Number(filters.value.branch)
    : branches.value[0]?.id;

  if (!branchToUse) {
    console.warn("⚠ No hay sucursales disponibles para cargar productos.");
    products.value = [];
    return;
  }

  try {
    products.value = await getStockByBranch(branchToUse);
  } catch (err) {
    console.error("❌ Error fetching products for branch:", err);
    products.value = [];
  }
};

const formatDate = (date) => new Date(date).toLocaleDateString('es-AR')
const formatType = (type) =>
  ({ TRANSFER: 'Traslado', ADJUSTMENT: 'Ajuste', INTERNAL: 'Interno' }[type] || type)

const branchesMap = computed(() =>
  branches.value.reduce((acc, branch) => {
    acc[branch.id] = branch.name
    return acc
  }, {})
)

const getBranchName = (branchId) => branchesMap.value[branchId] || '-'

const openDetailModal = (movementId) => {
  selectedMovementId.value = movementId
  isDetailModalOpen.value = true
}

// 🔹 Abrir modal de nuevo movimiento
const openMovementModal = async () => {
  await fetchProductsForBranch()
  showMovementModal.value = true
}

// 🔹 Cuando se guarda un nuevo movimiento en el modal
const onMovementSaved = async () => {
  await fetchMovements()
}

// INIT
onMounted(async () => {
  await fetchBranches()
  await fetchMovements()
})
</script>