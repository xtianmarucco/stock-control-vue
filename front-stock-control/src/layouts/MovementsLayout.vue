<!-- src/layouts/MovementsLayout.vue -->
<template>
  <DashboardLayout>
    <div class="p-6">
      <!-- Aquí se renderizarán las vistas hijas -->
      <router-view />
    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '../layouts/DashboardLayout.vue'
</script>