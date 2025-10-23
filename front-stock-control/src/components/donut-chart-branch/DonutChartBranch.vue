<script setup>
import { ref, onMounted } from 'vue'
import { getStockSummaryByCategory } from '../../services/stockService.js'
import DonutChart from '../donut-chart/DonutChart.vue'


function generateColors(count) {
  const colors = []

  for (let i = 0; i < count; i++) {
    const hue = Math.floor((360 / count) * i)
    colors.push(`hsl(${hue}, 70%, 60%)`) // Colores pastel vibrantes
  }

  return colors
}

const props = defineProps({
  branchId: {
    type: Number,
    required: true
  },
  branchName: {
    type: String,
    default: ''
  }
})

const chartData = ref(null)

onMounted(async () => {
  const result = await getStockSummaryByCategory(props.branchId)
  const labels = result.map(item => item.category)
  const data = result.map(item => parseInt(item.total))
  const colors = generateColors(labels.length)

  chartData.value = {
    labels: result.map(item => item.category),
    datasets: [
      {
        label: `Stock por categoría (${props.branchName})`,
        data: result.map(item => parseInt(item.total)),
        backgroundColor: colors
      }
    ]
  }
  console.log(chartData)

})
</script>

<template>
  <div class="p-4 bg-white rounded-lg shadow h-auto">
    <h2 class="text-lg font-semibold mb-2">Stock por categoría - {{ branchName }}</h2>
    <DonutChart v-if="chartData" :data="chartData" />
    <p v-else>Cargando datos...</p>
  </div>
</template>