<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100">
      <h2 class="text-sm font-bold text-[#193B68]">{{ branchName }}</h2>
      <p class="text-xs text-gray-400 mt-0.5">Stock por categoría</p>
    </div>
    <div class="p-4 flex items-center justify-center min-h-[220px]">
      <p v-if="loading" class="text-gray-300 text-sm">Cargando...</p>
      <p v-else-if="error" class="text-gray-400 text-sm text-center">{{ error }}</p>
      <Doughnut v-else :data="chartData" :options="chartOptions" class="max-h-52" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js'
import { getStockSummaryByCategory } from '../../services/stockService'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)

const props = defineProps({
  branchId: { type: Number, required: true },
  branchName: { type: String, required: true }
})

const BASE_COLORS = [
  '#1479FF', '#E63946', '#2A9D8F', '#E9C46A', '#6D597A',
  '#F4A261', '#457B9D', '#8AB17D', '#B56576', '#A8DADC',
  '#F1FAEE', '#1D3557'
]

const formatCategory = (cat) => cat?.replace(/^\w+\d+-\s*/, '').trim() || cat

const chartData = ref(null)
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        font: { family: 'Inter', size: 11 },
        color: '#193B68',
        boxWidth: 12,
        padding: 12
      }
    },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.label}: ${ctx.raw} u.`
      }
    }
  }
}
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const result = await getStockSummaryByCategory(props.branchId)
    if (!result?.length) {
      error.value = 'Sin datos disponibles'
      return
    }
    chartData.value = {
      labels: result.map(r => formatCategory(r.category)),
      datasets: [{
        data: result.map(r => Number(r.total)),
        backgroundColor: BASE_COLORS.slice(0, result.length),
        borderColor: '#fff',
        borderWidth: 2
      }]
    }
  } catch {
    error.value = 'Error al cargar datos'
  } finally {
    loading.value = false
  }
})
</script>
