<template>
  <DashboardLayout>
    <div class="flex flex-col gap-6 bg-gray-50 min-h-full">
      <header
        class="border-b bg-white shadow-sm px-6 py-4 flex flex-col gap-1 md:flex-row md:justify-between md:items-center"
      >
        <h1 class="text-2xl font-semibold text-gray-800">
          Gestión de Productos
        </h1>
        <p class="text-sm text-gray-500">
          Visualización general del stock y filtrado por categoría
        </p>
      </header>

      <section class="p-6 bg-white rounded-lg shadow-sm">
        <RouterView />
      </section>
    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '../layouts/DashboardLayout.vue'
</script>
