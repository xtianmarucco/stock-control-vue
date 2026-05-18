<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100">
      <h2 class="text-sm font-bold text-[#193B68] mb-3">Stock por categoría</h2>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="selectCategory(cat)"
          class="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
          :class="activeCategory === cat
            ? 'bg-[#1479FF] text-white'
            : 'bg-gray-100 text-[#193B68] hover:bg-gray-200'"
        >
          {{ formatCategory(cat) }}
        </button>
      </div>
    </div>

    <div class="p-6">
      <div v-if="loading" class="flex items-end gap-2 h-48 px-2">
        <div v-for="(h, i) in [55, 90, 38, 110, 72, 48, 88, 62, 78, 42]" :key="i" class="flex-1 flex items-end">
          <SkeletonBlock width="100%" :height="`${h}px`" rounded="4px 4px 0 0" />
        </div>
      </div>
      <div v-else-if="!chartData" class="flex items-center justify-center h-48 text-gray-400 text-sm">
        Seleccioná una categoría
      </div>
      <div v-else-if="chartData.labels.length === 0" class="flex items-center justify-center h-48 text-gray-400 text-sm">
        Sin datos para esta categoría
      </div>
      <Bar v-else :data="chartData" :options="chartOptions" class="max-h-72" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import SkeletonBlock from '../ui/SkeletonBlock.vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { getStockByBranch } from '../../services/BranchService'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps({
  categories: { type: Array, default: () => [] },
  branches: { type: Array, default: () => [] }
})

const BRANCH_COLORS = [
  '#1479FF', '#E63946', '#2A9D8F', '#E9C46A', '#6D597A', '#F4A261'
]

const activeCategory = ref(null)
const chartData = ref(null)
const loading = ref(false)

const formatCategory = (cat) => cat.replace(/^\w+\d+-\s*/, '').trim() || cat

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { font: { family: 'Inter', size: 12 }, color: '#193B68', boxWidth: 12, padding: 16 }
    },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw} bultos`
      }
    }
  },
  scales: {
    x: {
      ticks: { font: { family: 'Inter', size: 11 }, color: '#6B7280', maxRotation: 35 },
      grid: { display: false }
    },
    y: {
      beginAtZero: true,
      ticks: { font: { family: 'Inter', size: 11 }, color: '#6B7280', stepSize: 1 },
      grid: { color: '#F3F4F6' }
    }
  }
}

const selectCategory = async (cat) => {
  if (activeCategory.value === cat) return
  activeCategory.value = cat
  await loadChartData(cat)
}

const loadChartData = async (category) => {
  loading.value = true
  chartData.value = null
  try {
    const results = await Promise.all(
      props.branches.map(b => getStockByBranch(b.id, category))
    )

    // Union de todos los productos en la categoría
    const productMap = new Map()
    results.forEach((branchProducts, i) => {
      branchProducts.forEach(p => {
        if (!productMap.has(p.id)) {
          productMap.set(p.id, { name: p.name.trim(), stocks: new Array(props.branches.length).fill(0) })
        }
        productMap.get(p.id).stocks[i] = p.pack_total
      })
    })

    const products = [...productMap.values()]
    const labels = products.map(p => p.name)

    const datasets = props.branches.map((branch, i) => ({
      label: branch.name,
      data: products.map(p => p.stocks[i]),
      backgroundColor: BRANCH_COLORS[i % BRANCH_COLORS.length],
      borderRadius: 4,
      maxBarThickness: 28
    }))

    chartData.value = { labels, datasets }
  } finally {
    loading.value = false
  }
}

watch(() => props.categories, (cats) => {
  if (cats.length > 0 && !activeCategory.value) {
    selectCategory(cats[0])
  }
}, { immediate: true })
</script>
