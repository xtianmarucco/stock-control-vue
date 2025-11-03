<template>
  <aside
    class="h-full bg-[var(--color-card)] border-r border-[var(--color-border)] text-[var(--color-text-base)] flex flex-col p-4"
  >
    <div class="flex items-center gap-2 mb-6 px-2">
      <span class="font-bold text-lg">StockApp</span>
    </div>

    <nav class="flex flex-col gap-2">
      <SidebarItem icon="home" label="Dashboard" to="/dashboard" />

      <SidebarItem
        icon="box"
        label="Productos"
        :active="isProductsRoute"
        :open="isProductsOpen"
        @toggle="toggleProducts"
      >
        <RouterLink
          v-for="branch in branches"
          :key="branch.id"
          :to="branchProductsRoute(branch.id)"
          class="flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors"
          :class="branchLinkClasses(branch.id)"
        >
          <i class="i-lucide-building-2 text-base"></i>
          <span>{{ branch.name ?? `Sucursal ${branch.id}` }}</span>
        </RouterLink>

        <p
          v-if="!branches.length && branchesLoaded"
          class="px-3 py-2 text-xs text-[var(--color-text-muted)]"
        >
          No hay sucursales registradas
        </p>

        <p
          v-else-if="!branchesLoaded"
          class="px-3 py-2 text-xs text-[var(--color-text-muted)]"
        >
          Cargando sucursales...
        </p>
      </SidebarItem>

      <SidebarItem icon="flask-conical" label="Insumos" />
      <SidebarItem icon="repeat" label="Movimientos" />
      <SidebarItem icon="bar-chart-3" label="Reportes" />
    </nav>

    <div class="mt-auto pt-6 border-t border-[var(--color-border)]">
      <SidebarItem icon="settings" label="Configuración" />
    </div>
  </aside>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import SidebarItem from '../sidebar-item/SidebarItem.vue'
import { getAllBranches } from '../../services/BranchService'

const branches = ref([])
const branchesLoaded = ref(false)
const isProductsOpen = ref(false)

const route = useRoute()

const isProductsRoute = computed(() => route.path.startsWith('/branches/'))

const branchProductsRoute = (branchId) => `/branches/${branchId}/products`

const branchLinkClasses = (branchId) => {
  const isActive = route.params.branchId === String(branchId)
  return isActive
    ? 'bg-[rgba(93,135,255,0.15)] text-[var(--color-primary)] font-medium'
    : 'text-[var(--color-text-muted)] hover:bg-gray-100'
}

const toggleProducts = () => {
  isProductsOpen.value = !isProductsOpen.value
}

watch(
  () => route.fullPath,
  () => {
    if (isProductsRoute.value) {
      isProductsOpen.value = true
    }
  },
  { immediate: true }
)

onMounted(async () => {
  try {
    const data = await getAllBranches()
    branches.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error al cargar sucursales:', error)
  } finally {
    branchesLoaded.value = true
  }
})
</script>

<style scoped>
@import url('https://unpkg.com/lucide-static@latest/icons.css');
</style>
