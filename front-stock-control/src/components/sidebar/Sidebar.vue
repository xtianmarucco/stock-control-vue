<template>
  <aside class="h-full bg-[#0F2340] text-slate-300 flex flex-col">
    <!-- Logo -->
    <div class="flex items-center gap-3 px-5 py-5 border-b border-white/10">
      <div class="w-8 h-8 bg-[#1479FF] rounded-lg flex items-center justify-center shrink-0">
        <i class="i-lucide-package-2 text-white text-base"></i>
      </div>
      <div>
        <p class="text-white font-bold text-sm leading-tight">Stock Control</p>
        <p class="text-slate-400 text-xs leading-tight">Heladería</p>
      </div>
    </div>

    <!-- Nav -->
    <nav class="flex flex-col gap-1 px-3 py-4 flex-1">
      <SidebarItem icon="layout-dashboard" label="Dashboard" to="/dashboard" />

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
          :to="`/branches/${branch.id}/products`"
          class="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors ml-1"
          :class="route.params.branchId === String(branch.id)
            ? 'text-white bg-white/10'
            : 'text-slate-400 hover:text-white hover:bg-white/5'"
        >
          <i class="i-lucide-building-2 text-sm"></i>
          <span>{{ branch.name ?? `Sucursal ${branch.id}` }}</span>
        </RouterLink>
      </SidebarItem>

      <SidebarItem icon="arrow-left-right" label="Movimientos" to="/movements" />
      <SidebarItem icon="bar-chart-3" label="Reportes" />
    </nav>

    <!-- Usuario + Logout -->
    <div class="border-t border-white/10 px-4 py-4">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-8 h-8 rounded-full bg-[#1479FF] flex items-center justify-center text-white text-sm font-semibold shrink-0">
          {{ userInitial }}
        </div>
        <div class="overflow-hidden">
          <p class="text-white text-sm font-medium leading-tight truncate">{{ authStore.user?.username }}</p>
          <p class="text-slate-400 text-xs leading-tight">Administrador</p>
        </div>
      </div>
      <button
        @click="handleLogout"
        class="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors w-full"
      >
        <i class="i-lucide-log-out text-base"></i>
        <span>Cerrar sesión</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import SidebarItem from '../sidebar-item/SidebarItem.vue'
import { getAllBranches } from '../../services/BranchService'
import { useAuthStore } from '../../stores/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const branches = ref([])
const branchesLoaded = ref(false)
const isProductsOpen = ref(false)

const isProductsRoute = computed(() => route.path.startsWith('/branches/'))
const userInitial = computed(() => authStore.user?.username?.[0]?.toUpperCase() ?? '?')

const toggleProducts = () => {
  isProductsOpen.value = !isProductsOpen.value
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

watch(
  () => route.fullPath,
  () => { if (isProductsRoute.value) isProductsOpen.value = true },
  { immediate: true }
)

onMounted(async () => {
  try {
    branches.value = await getAllBranches()
  } catch {
    // silently ignore
  } finally {
    branchesLoaded.value = true
  }
})
</script>

<style scoped>
@import url('https://unpkg.com/lucide-static@latest/icons.css');
</style>
