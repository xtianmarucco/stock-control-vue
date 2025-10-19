<script setup>
import HelloWorld from "./components/HelloWorld.vue";
import DashboardCard from "./components/dashboard-card/DashboardCard.vue";
</script>

<template>
  <div class="min-h-screen bg-[var(--color-background)] p-[var(--spacing-section)] text-[var(--color-text-base)]">
    <h1 class="text-3xl font-bold text-[var(--color-primary)] mb-6">
      Dashboard de Stock (Ejemplo)
    </h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-grid-gap)]">
      <!-- Tarjeta 1 -->
      <DashboardCard
        title="Stock disponible"
        :value="1250"
        description="Productos en sucursal A"
      >
        <template #icon>
          <svg class="w-6 h-6 text-[var(--color-success)]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </template>
      </DashboardCard>

      <!-- Tarjeta 2 -->
      <DashboardCard
        title="Insumos en tránsito"
        :value="37"
        description="En camino a sucursal B"
      >
        <template #icon>
          <svg class="w-6 h-6 text-[var(--color-warning)]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 8v4m0 4v.01" />
          </svg>
        </template>
      </DashboardCard>

      <!-- Tarjeta 3 -->
      <DashboardCard
        title="Stock bajo"
        :value="5"
        description="Sabores críticos"
      >
        <template #icon>
          <svg class="w-6 h-6 text-[var(--color-danger)]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </template>
      </DashboardCard>
    </div>
  </div>
</template>


