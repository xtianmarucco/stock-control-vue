<template>
  <div
    class="flex h-screen bg-[var(--color-background)] text-[var(--color-text-base)]"
  >
    <!-- Sidebar -->
    <Sidebar class="w-[var(--width-sidebar)] shrink-0" />

    <!-- Contenido principal -->
    <div class="flex flex-col flex-1 overflow-hidden">
      <!-- Navbar superior -->
      <Navbar
        class="h-[var(--height-navbar)] border-b border-[var(--color-border)]"
      />

      <!-- Contenido scrollable -->
      <main class="flex-1 overflow-y-auto p-[var(--spacing-section)]">
        <section
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-grid-gap)] mb-[var(--spacing-grid-gap)]"
        >
          <!-- Cards de métricas -->
          <DashboardCard
            title="Sucursal A"
            :value="350"
            description="Unidades en stock"
          />
          <DashboardCard
            title="Sucursal B"
            :value="500"
            description="Unidades en stock"
          />
        </section>

        <section
          class="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-grid-gap)]"
        >
          <!-- Placeholder para gráfico circular -->
          <DonutChartBranch :branchId="1" branchName="Sucursal A" />
          <DonutChartBranch :branchId="2" branchName="Sucursal B" />

          <!-- Otro contenido opcional -->
          <div
            class="bg-[var(--color-card)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-[var(--spacing-card)]"
          >
            <h2 class="text-xl font-semibold">Panel extra</h2>
            <p class="text-sm text-[var(--color-text-muted)]">
              Aquí podrías mostrar notificaciones, actividad reciente o
              cualquier otro resumen.
            </p>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import Navbar from "../components/navbar/Navbar.vue";
import Sidebar from "../components/sidebar/Sidebar.vue";
import DashboardCard from "../components/dashboard-card/DashboardCard.vue";
import DonutChartBranch from "../components/donut-chart-branch/DonutChartBranch.vue";

// Datos de prueba para el gráfico
const donutData = {
  labels: ["Sucursal A", "Sucursal B"],
  datasets: [
    {
      data: [350, 500],
      backgroundColor: ["#5D87FF", "#13DEB9"],
      hoverBackgroundColor: ["#4A75F5", "#10C3A5"],
    },
  ],
};
</script>
