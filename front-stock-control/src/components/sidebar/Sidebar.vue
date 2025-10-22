<template>
  <aside class="h-full bg-[var(--color-card)] border-r border-[var(--color-border)] text-[var(--color-text-base)] flex flex-col p-4">
    <!-- Logo reducido o ícono -->
    <div class="flex items-center gap-2 mb-6 px-2">
      <!-- <img src="/logo.svg" alt="Logo" class="w-6 h-6" /> -->
      <span class="font-bold text-lg">StockApp</span>
    </div>

    <!-- Menú de navegación -->
    <nav class="flex flex-col gap-2">
      <SidebarItem icon="home" label="Dashboard" :active="true" />
      <SidebarItem icon="box" label="Productos" />
      <SidebarItem icon="flask-conical" label="Insumos" />
      <SidebarItem icon="repeat" label="Movimientos" />
      <SidebarItem icon="bar-chart-3" label="Reportes" />
    </nav>

    <!-- Separador inferior -->
    <div class="mt-auto pt-6 border-t border-[var(--color-border)]">
      <SidebarItem icon="settings" label="Configuración" />
    </div>
  </aside>
</template>

<script setup>
import SidebarItem from '../sidebar-item/SidebarItem.vue';
</script>

<style scoped>
@import url('https://unpkg.com/lucide-static@latest/icons.css');
</style>