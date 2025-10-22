<template>
  <div class="bg-[var(--color-card)] doughnut-chart rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-[var(--spacing-card)]">
    <h2 class="text-xl font-semibold mb-4">Distribución de Stock</h2>
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)

const props = defineProps({
  data: Object
})

const chartData = props.data

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        color: 'var(--color-text-base)',
        font: {
          family: 'Inter'
        }
      }
    }
  }
}
</script>

<style scoped>
/* Asegura altura para el gráfico */
.doughnut-chart {
  height:auto;
  max-height: 500px;

}
</style>