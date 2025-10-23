<template>
  <div
    class="bg-[var(--color-card)] doughnut-chart h-auto rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-[var(--spacing-card)]"
  >
    <h2 class="text-xl font-semibold mb-4">Distribución de Stock</h2>
    <div class="w-full max-w-[400px] h-[400px] mx-auto">
      <Doughnut v-if="chartData" :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { Doughnut } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
} from "chart.js";
import { computed } from "vue";

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

const props = defineProps({
  data: Object,
});

// Asegura que el gráfico se actualice si cambian los props
const chartData = computed(() => props.data);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: "right",
      labels: {
        color: "var(--color-text-base)",
        font: {
          family: "Inter",
        },
      },
    },
  },
};
</script>

<style scoped>
.doughnut-chart {
  height: auto;
  max-height: 500px;
}
</style>
