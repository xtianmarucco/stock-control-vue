<template>
  <DashboardLayout>
    <section
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-grid-gap)] mb-[var(--spacing-grid-gap)]"
    >
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
      <BranchStockDonut :branch-id="1" branch-name="Castelli" />
      <BranchStockDonut :branch-id="2" branch-name="Diagonal" />

      <div
        class="bg-[var(--color-card)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-[var(--spacing-card)]"
      >
        <h2 class="text-xl font-semibold">Panel extra</h2>
        <p class="text-sm text-[var(--color-text-muted)]">
          Aquí podrías mostrar notificaciones, actividad reciente o cualquier
          otro resumen.
        </p>
      </div>
    </section>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '../layouts/DashboardLayout.vue'
import DashboardCard from '../components/dashboard-card/DashboardCard.vue'
import BranchStockDonut from '../components/branch-stock-donut/BranchStockDonut.vue'
</script>
