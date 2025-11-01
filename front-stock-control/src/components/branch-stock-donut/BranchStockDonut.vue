<template>
  <div class="p-4 bg-white rounded-lg shadow h-auto">
    <!-- Título -->
    <h2 class="text-lg font-semibold mb-2">
      Stock por categoría - {{ branchName }}
    </h2>

    <!-- Contenedor del gráfico -->
    <div
      class="bg-[var(--color-card)] doughnut-chart h-auto rounded-[var(--radius-lg)] p-[var(--spacing-card)]"
    >
      <div class="w-full  mx-0 flex items-center ">
        <template v-if="loading">
          <p class="text-gray-500">Cargando datos...</p>
        </template>

        <template v-else-if="error">
          <p class="text-red-500 text-center">{{ error }}</p>
        </template>

        <template v-else>
          <Doughnut :data="chartData" :options="chartOptions" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Doughnut } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
} from "chart.js";
import { getStockSummaryByCategory } from "../../services/stockService";

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

// Props dinámicas
const props = defineProps({
  branchId: { type: Number, required: true },
  branchName: { type: String, required: true },
});

// Estado
const chartData = ref(null);
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: "right",
      labels: {
        color: "var(--color-text-base)",
        font: { family: "Inter" },
      },
    },
  },
});
const loading = ref(true);
const error = ref(null);

// Función para generar colores predecibles (estables)
function generateColors(count) {
  const baseColors = [
    "#E63946",
    "#F1FAEE",
    "#A8DADC",
    "#457B9D",
    "#1D3557",
    "#2A9D8F",
    "#E9C46A",
    "#F4A261",
    "#E76F51",
    "#8AB17D",
    "#6D597A",
    "#B56576",
  ];
  return baseColors.slice(0, count);
}

// Fetch principal
onMounted(async () => {
  try {
    const result = await getStockSummaryByCategory(props.branchId);

    if (!result || result.length === 0) {
      error.value = "No hay datos disponibles.";
      return;
    }

    const labels = result.map((item) => item.category);
    const data = result.map((item) => Number(item.total));
    const colors = generateColors(labels.length);

    chartData.value = JSON.parse(
      JSON.stringify({
        labels,
        datasets: [
          {
            label: `Stock por categoría (${props.branchName})`,
            data,
            backgroundColor: colors,
            borderColor: "#fff",
            borderWidth: 1,
          },
        ],
      })
    );
  } catch (err) {
    console.error("❌ Error al obtener stock:", err);
    error.value = "Error al cargar datos del servidor.";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.doughnut-chart {
  height: auto;
  max-height: 500px;
}
</style>