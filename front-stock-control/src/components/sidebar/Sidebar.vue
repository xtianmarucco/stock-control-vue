<template>
  <aside
    class="flex h-full flex-col bg-[#0F2340] text-slate-300 shadow-[0_24px_50px_rgba(15,35,64,0.35)] transition-transform duration-300 ease-out lg:translate-x-0 lg:shadow-none"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="flex items-center gap-3 border-b border-white/10 px-5 py-5">
      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1479FF] shrink-0">
        <i class="i-lucide-package-2 text-white text-base"></i>
      </div>
      <div class="min-w-0">
        <p class="text-white font-bold text-sm leading-tight">Stock Control</p>
        <p class="text-slate-400 text-xs leading-tight">Heladería</p>
      </div>
      <button
        type="button"
        class="ml-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
        @click="emit('close')"
        aria-label="Cerrar menú"
      >
        ✕
      </button>
    </div>

    <div class="flex flex-1 flex-col overflow-hidden px-3 py-4">
      <nav class="flex flex-col gap-1 overflow-y-auto">
        <SidebarItem icon="layout-dashboard" label="Dashboard" to="/dashboard" @navigate="emit('close')" />
        <SidebarItem icon="store" label="Sucursales" to="/branches" @navigate="emit('close')" />
        <SidebarItem icon="users" label="Usuarios" to="/users" @navigate="emit('close')" />

        <SidebarItem
          icon="box"
          label="Productos"
          :active="isProductsRoute"
          :open="isProductsOpen"
          @toggle="toggleProducts"
          @navigate="emit('close')"
        >
          <RouterLink
            to="/products/catalog"
            class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors"
            :class="route.name === 'ProductsCatalog'
              ? 'text-white bg-white/10'
              : 'text-slate-400 hover:text-white hover:bg-white/5'"
            @click="emit('close')"
          >
            <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-current"></span>
            <span>Catálogo</span>
          </RouterLink>
          <RouterLink
            v-for="branch in branches"
            :key="branch.id"
            :to="`/branches/${branch.id}/products`"
            class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors"
            :class="route.params.branchId === String(branch.id)
              ? 'text-white bg-white/10'
              : 'text-slate-400 hover:text-white hover:bg-white/5'"
            @click="emit('close')"
          >
            <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-current"></span>
            <span>{{ branch.name ?? `Sucursal ${branch.id}` }}</span>
          </RouterLink>
        </SidebarItem>

        <SidebarItem icon="arrow-left-right" label="Movimientos" to="/movements" @navigate="emit('close')" />
        <SidebarItem icon="bar-chart-3" label="Reportes" to="/reports" @navigate="emit('close')" />
      </nav>
    </div>
  </aside>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import SidebarItem from '../sidebar-item/SidebarItem.vue'
import { getAllBranches } from '../../services/BranchService'

defineProps({
  isOpen: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const route = useRoute()

const branches = ref([])
const branchesLoaded = ref(false)
const isProductsOpen = ref(false)

const isProductsRoute = computed(() =>
  route.path.startsWith('/branches/') || route.name === 'ProductsCatalog'
)

const toggleProducts = () => {
  isProductsOpen.value = !isProductsOpen.value
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
