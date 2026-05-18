<template>
  <DashboardLayout>
    <div class="space-y-5">

      <!-- KPI Cards -->
      <section class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div class="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <i class="i-lucide-package text-xl text-[#1479FF]"></i>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Stock total</p>
            <SkeletonBlock v-if="loading" width="64px" height="30px" rounded="6px" class="my-0.5" />
            <p v-else class="text-2xl font-bold text-[#193B68]">{{ summary.total_stock }}</p>
            <p class="text-xs text-gray-400">bultos en sistema</p>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div class="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
            <i class="i-lucide-alert-triangle text-xl text-orange-500"></i>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Stock bajo</p>
            <SkeletonBlock v-if="loading" width="48px" height="30px" rounded="6px" class="my-0.5" />
            <p v-else class="text-2xl font-bold text-orange-500">{{ summary.low_stock_count }}</p>
            <p class="text-xs text-gray-400">productos con stock bajo</p>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div class="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
            <i class="i-lucide-arrow-left-right text-xl text-purple-500"></i>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Movimientos</p>
            <SkeletonBlock v-if="loading" width="48px" height="30px" rounded="6px" class="my-0.5" />
            <p v-else class="text-2xl font-bold text-[#193B68]">{{ summary.movements_last_7_days }}</p>
            <p class="text-xs text-gray-400">últimos 7 días</p>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div class="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <i class="i-lucide-store text-xl text-green-500"></i>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Sucursales</p>
            <SkeletonBlock v-if="loading" width="40px" height="30px" rounded="6px" class="my-0.5" />
            <p v-else class="text-2xl font-bold text-[#193B68]">{{ summary.active_branches_count }}</p>
            <p class="text-xs text-gray-400">activas</p>
          </div>
        </div>
      </section>

      <!-- Donuts por sucursal -->
      <section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <BranchStockDonut
          v-for="branch in branches"
          :key="branch.id"
          :branch-id="branch.id"
          :branch-name="branch.name"
        />
      </section>

      <!-- Stock por categoría (tabs + bar chart) -->
      <StockCategoryChart :categories="categories" :branches="branches" />

      <!-- Movimientos recientes + Stock bajo -->
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <!-- Movimientos recientes -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-sm font-bold text-[#193B68]">Últimos movimientos</h2>
          </div>
          <ul v-if="loading" class="divide-y divide-gray-50">
            <li v-for="i in 4" :key="i" class="px-6 py-3 flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <SkeletonBlock width="60px" height="20px" rounded="999px" />
                <div>
                  <SkeletonBlock :width="`${100 + i * 12}px`" height="13px" rounded="4px" class="mb-1.5" />
                  <SkeletonBlock width="80px" height="11px" rounded="4px" />
                </div>
              </div>
              <div class="text-right">
                <SkeletonBlock width="50px" height="13px" rounded="4px" class="mb-1.5" />
                <SkeletonBlock width="40px" height="11px" rounded="4px" />
              </div>
            </li>
          </ul>
          <div v-else-if="recentMovements.length === 0" class="px-6 py-8 text-center text-gray-400 text-sm">Sin movimientos</div>
          <ul v-else class="divide-y divide-gray-50">
            <li
              v-for="mov in recentMovements"
              :key="mov.id"
              class="px-6 py-3 flex items-center justify-between gap-3"
            >
              <div class="flex items-center gap-3 min-w-0">
                <span :class="typeBadge(mov.movement_type)">{{ formatType(mov.movement_type) }}</span>
                <div class="min-w-0">
                  <p class="text-sm text-[#193B68] truncate">
                    {{ mov.from_branch_name }}
                    <span v-if="mov.to_branch_name" class="text-gray-400"> → {{ mov.to_branch_name }}</span>
                  </p>
                  <p class="text-xs text-gray-400">{{ mov.created_by || '—' }}</p>
                </div>
              </div>
              <div class="text-right shrink-0">
                <p class="text-xs font-semibold text-[#193B68]">{{ mov.items_count }} prod.</p>
                <p class="text-xs text-gray-400">{{ formatDate(mov.created_at) }}</p>
              </div>
            </li>
          </ul>
        </div>

        <!-- Alertas stock bajo -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-sm font-bold text-[#193B68]">Alertas de stock bajo</h2>
            <span v-if="lowStockProducts.length > 0" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-600">
              {{ lowStockProducts.length }}
            </span>
          </div>
          <ul v-if="loading" class="divide-y divide-gray-50">
            <li v-for="i in 4" :key="i" class="px-6 py-3 flex items-center justify-between gap-3">
              <div>
                <SkeletonBlock :width="`${120 + i * 10}px`" height="13px" rounded="4px" class="mb-1.5" />
                <SkeletonBlock width="100px" height="11px" rounded="4px" />
              </div>
              <SkeletonBlock width="56px" height="20px" rounded="999px" />
            </li>
          </ul>
          <div v-else-if="lowStockProducts.length === 0" class="px-6 py-8 text-center text-gray-400 text-sm">Sin alertas</div>
          <ul v-else class="divide-y divide-gray-50 max-h-72 overflow-y-auto">
            <li
              v-for="(p, i) in lowStockProducts"
              :key="i"
              class="px-6 py-3 flex items-center justify-between gap-3"
            >
              <div class="min-w-0">
                <p class="text-sm text-[#193B68] font-medium truncate">{{ p.product_name.trim() }}</p>
                <p class="text-xs text-gray-400">{{ p.branch_name }} · {{ formatCategory(p.category_name) }}</p>
              </div>
              <span
                class="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold"
                :class="p.total === 0 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'"
              >
                {{ p.total }} bultos
              </span>
            </li>
          </ul>
        </div>

      </section>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import SkeletonBlock from '../components/ui/SkeletonBlock.vue'
import BranchStockDonut from '../components/branch-stock-donut/BranchStockDonut.vue'
import StockCategoryChart from '../components/stock-category-chart/StockCategoryChart.vue'
import { getDashboardData } from '../services/DashboardService'
import { getBranches } from '../services/BranchService'

const loading = ref(true)
const branches = ref([])
const summary = ref({ total_stock: 0, low_stock_count: 0, movements_last_7_days: 0, active_branches_count: 0 })
const recentMovements = ref([])
const lowStockProducts = ref([])
const categories = ref([])

const formatDate = (date) => new Date(date).toLocaleDateString('es-AR')
const formatType = (type) => ({ TRANSFER: 'Traslado', ADJUSTMENT: 'Ajuste', INTERNAL: 'Interno' }[type] || type)
const formatCategory = (cat) => cat?.replace(/^\w+\d+-\s*/, '').trim() || cat

const typeBadge = (type) => {
  const base = 'shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold'
  return {
    TRANSFER: `${base} bg-blue-100 text-blue-700`,
    ADJUSTMENT: `${base} bg-orange-100 text-orange-700`,
    INTERNAL: `${base} bg-purple-100 text-purple-700`
  }[type] ?? `${base} bg-gray-100 text-gray-600`
}

onMounted(async () => {
  try {
    const [data, branchList] = await Promise.all([getDashboardData(), getBranches()])
    branches.value = branchList
    summary.value = {
      total_stock: data.total_stock,
      low_stock_count: data.low_stock_count,
      movements_last_7_days: data.movements_last_7_days,
      active_branches_count: data.active_branches_count
    }
    recentMovements.value = data.recent_movements
    lowStockProducts.value = data.low_stock_products
    categories.value = data.categories
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
</style>
