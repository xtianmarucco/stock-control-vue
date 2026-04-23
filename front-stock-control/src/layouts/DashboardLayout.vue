<template>
  <div class="flex h-screen bg-[#F5F7FB]">
    <Sidebar class="w-[var(--width-sidebar)] shrink-0" />

    <div class="flex flex-col flex-1 overflow-hidden">
      <!-- Page title bar -->
      <div class="px-6 py-3 border-b border-gray-200 bg-[#F5F7FB]">
        <p class="text-sm text-[#193B68] font-medium">{{ pageTitle }}</p>
      </div>

      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '../components/sidebar/Sidebar.vue'

const route = useRoute()

const pageTitles = {
  Dashboard: 'Dashboard',
  BranchProducts: 'Productos',
  StockMovementsView: 'Movimientos de Stock'
}

const pageTitle = computed(() => pageTitles[route.name] ?? '')
</script>
