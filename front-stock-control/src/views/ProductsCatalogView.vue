<template>
  <DashboardLayout>
    <ProductDrawer
      v-model="drawerOpen"
      :preview="selectedProduct"
      @edit="openEditModal"
      @deactivated="handleDeactivated"
      @restored="handleRestored"
      @destroyed="handleDestroyed"
    />

    <ProductFormModal
      v-model="formModalOpen"
      :product="editingProduct"
      :categories="categories"
      @saved="handleSaved"
    />

    <div class="space-y-6">

      <!-- Header -->
      <section class="rounded-[32px] border border-[var(--color-border)] bg-white px-6 py-6 shadow-[0_24px_50px_rgba(15,35,64,0.08)] sm:px-8">
        <div class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p class="text-sm font-medium text-[var(--color-primary)]">Catálogo global</p>
            <h1 class="mt-1 text-3xl font-bold text-[var(--color-text-base)]">Productos</h1>
            <p class="mt-2 text-sm text-[var(--color-text-muted)]">
              Administrá el catálogo maestro de productos del sistema.
            </p>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:items-start xl:items-center">
            <!-- KPIs -->
            <div class="grid grid-cols-2 gap-3 sm:flex sm:gap-3">
              <div class="rounded-[24px] border border-[var(--color-border)] bg-[#FAFBFE] px-4 py-3">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Activos</p>
                <p class="mt-1.5 text-2xl font-bold text-[var(--color-text-base)]">{{ activeCount }}</p>
              </div>
              <div class="rounded-[24px] border border-[var(--color-border)] bg-[#FAFBFE] px-4 py-3">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Categorías</p>
                <p class="mt-1.5 text-2xl font-bold text-[var(--color-text-base)]">{{ categories.length }}</p>
              </div>
            </div>

            <!-- Botón nuevo (solo admin) -->
            <button
              v-if="isAdmin"
              @click="openCreateModal"
              class="flex items-center gap-2 rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(20,121,255,0.22)] transition hover:bg-[var(--color-primary-hover)]"
            >
              <span class="text-lg leading-none">+</span>
              Nuevo producto
            </button>
          </div>
        </div>
      </section>

      <!-- Contenido principal -->
      <section class="grid gap-6 xl:items-start xl:grid-cols-[290px_minmax(0,1fr)]">

        <!-- Sidebar de categorías -->
        <aside class="self-start rounded-[32px] border border-[var(--color-border)] bg-white p-5 shadow-[0_24px_50px_rgba(15,35,64,0.08)]">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-xl font-semibold text-[var(--color-text-base)]">Categorías</h2>
              <p class="mt-1 text-sm text-[var(--color-text-muted)]">Filtrá el listado por familia.</p>
            </div>
            <span class="rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
              {{ categories.length + 1 }}
            </span>
          </div>

          <div class="mt-5 flex flex-col gap-2">
            <button
              class="w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition"
              :class="selectedCategory === null
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-[0_18px_30px_rgba(20,121,255,0.22)]'
                : 'border-[var(--color-border)] bg-[#FAFBFE] text-[var(--color-text-base)] hover:border-[#CFE0FF] hover:bg-[#F7FAFF]'"
              @click="selectCategory(null)"
            >
              Todos
            </button>
            <button
              v-for="cat in categories"
              :key="cat"
              class="w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition"
              :class="selectedCategory === cat
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-[0_18px_30px_rgba(20,121,255,0.22)]'
                : 'border-[var(--color-border)] bg-[#FAFBFE] text-[var(--color-text-base)] hover:border-[#CFE0FF] hover:bg-[#F7FAFF]'"
              @click="selectCategory(cat)"
            >
              {{ cat }}
            </button>
          </div>

          <!-- Toggle inactivos (solo admin) -->
          <div v-if="isAdmin" class="mt-4 border-t border-[var(--color-border)] pt-4">
            <button
              class="flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition"
              :class="showInactive
                ? 'border-[#FCA5A5] bg-[#FEF2F2] text-[#DC2626]'
                : 'border-[var(--color-border)] bg-[#FAFBFE] text-[var(--color-text-muted)] hover:bg-[#F7FAFF]'"
              @click="toggleShowInactive"
            >
              <span>Mostrar inactivos</span>
              <span
                class="rounded-full px-2 py-0.5 text-xs font-bold"
                :class="showInactive ? 'bg-[#FEE2E2] text-[#DC2626]' : 'bg-[#EEF3FA] text-[var(--color-text-muted)]'"
              >
                {{ showInactive ? 'ON' : 'OFF' }}
              </span>
            </button>
          </div>
        </aside>

        <!-- Tabla de productos -->
        <div class="min-w-0 space-y-5 self-start">

          <!-- Barra de búsqueda -->
          <section class="rounded-[32px] border border-[var(--color-border)] bg-white p-5 shadow-[0_24px_50px_rgba(15,35,64,0.08)]">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div class="flex flex-wrap items-center gap-3">
                <span
                  class="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                  :class="selectedCategory
                    ? 'bg-[#EAF2FF] text-[var(--color-primary)]'
                    : 'bg-[#EEF3FA] text-[var(--color-text-muted)]'"
                >
                  {{ selectedCategory || 'Todas las categorías' }}
                </span>
                <span class="text-sm text-[var(--color-text-muted)]">
                  {{ filteredProducts.length }} productos
                </span>
              </div>
              <div class="relative w-full lg:max-w-md">
                <input
                  v-model="searchTerm"
                  type="text"
                  placeholder="Buscar por nombre..."
                  class="w-full rounded-2xl border border-[var(--color-border)] bg-[#FAFBFE] px-4 py-3 pr-11 text-sm text-[var(--color-text-base)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[#DCEBFF]"
                />
                <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">⌕</span>
              </div>
            </div>
          </section>

          <!-- Lista -->
          <section class="rounded-[32px] border border-[var(--color-border)] bg-white p-5 shadow-[0_24px_50px_rgba(15,35,64,0.08)]">

            <div v-if="loading" class="rounded-[28px] border border-[var(--color-border)] bg-[#FAFBFE] px-5 py-12 text-center text-sm text-[var(--color-text-muted)]">
              Cargando catálogo...
            </div>

            <div v-else-if="filteredProducts.length === 0" class="rounded-[28px] border border-[var(--color-border)] bg-[#FAFBFE] px-5 py-12 text-center">
              <p class="text-base font-semibold text-[var(--color-text-base)]">Sin productos</p>
              <p class="mt-1 text-sm text-[var(--color-text-muted)]">Probá otro filtro o creá un nuevo producto.</p>
            </div>

            <div v-else class="overflow-hidden rounded-[28px] border border-[var(--color-border)]">
              <!-- Header tabla -->
              <div class="hidden grid-cols-[minmax(0,1.8fr)_minmax(160px,0.8fr)_140px_56px] border-b border-[var(--color-border)] bg-[#F8FAFD] px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)] md:grid">
                <span>Producto</span>
                <span>Categoría</span>
                <span class="text-center">Embalaje</span>
                <span></span>
              </div>

              <div class="divide-y divide-[var(--color-border)]">
                <article
                  v-for="prod in paginatedProducts"
                  :key="prod.id"
                  class="grid cursor-pointer gap-3 px-5 py-4 transition md:grid-cols-[minmax(0,1.8fr)_minmax(160px,0.8fr)_140px_56px] md:items-center"
                  :class="prod.is_available ? 'hover:bg-[#F0F6FF]' : 'bg-[#FAFBFE] opacity-60 hover:opacity-80'"
                  @click="openDrawer(prod)"
                >
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <p class="truncate text-sm font-semibold text-[var(--color-text-base)]">{{ prod.name }}</p>
                      <span
                        v-if="!prod.is_available"
                        class="flex-shrink-0 rounded-full bg-[#FEE2E2] px-2 py-0.5 text-xs font-semibold text-[#DC2626]"
                      >
                        Inactivo
                      </span>
                    </div>
                    <p class="mt-1 text-xs text-[var(--color-text-muted)] md:hidden">{{ prod.category_name }}</p>
                  </div>

                  <div class="hidden md:block">
                    <span class="inline-flex rounded-full bg-[#EEF3FA] px-3 py-1 text-xs font-semibold text-[var(--color-text-base)]">
                      {{ prod.category_name }}
                    </span>
                  </div>

                  <div class="hidden md:flex md:flex-col md:items-center md:gap-0.5">
                    <span class="text-xs font-semibold text-[var(--color-text-base)]">
                      {{ prod.unidades_x_pack }} u/bulto
                    </span>
                    <span v-if="prod.cajas_x_pack" class="text-xs text-[var(--color-text-muted)]">
                      {{ prod.cajas_x_pack }} cj/bulto
                    </span>
                  </div>

                  <!-- Acciones rápidas admin -->
                  <div v-if="isAdmin" class="hidden md:flex md:items-center md:justify-end" @click.stop>
                    <button
                      class="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                      title="Editar"
                      @click="openEditModal(prod)"
                    >
                      ✎
                    </button>
                  </div>
                </article>
              </div>

              <!-- Paginación -->
              <div
                v-if="totalPages > 1"
                class="flex flex-col gap-3 border-t border-[var(--color-border)] bg-[#F8FAFD] px-5 py-4 md:flex-row md:items-center md:justify-between"
              >
                <p class="text-sm text-[var(--color-text-muted)]">Página {{ currentPage }} de {{ totalPages }}</p>
                <div class="flex items-center gap-2">
                  <button
                    class="rounded-2xl border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-text-base)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="currentPage === 1"
                    @click="currentPage--"
                  >Anterior</button>
                  <span class="rounded-full bg-white px-3 py-1 text-sm font-semibold">{{ currentPage }}</span>
                  <button
                    class="rounded-2xl border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-text-base)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="currentPage === totalPages"
                    @click="currentPage++"
                  >Siguiente</button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import ProductDrawer from '../components/product-drawer/ProductDrawer.vue'
import ProductFormModal from '../components/product-form-modal/ProductFormModal.vue'
import { getAllProducts, getProductCategories } from '../services/ProductService.js'
import { useAuthStore } from '../stores/authStore.js'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.user?.role === 'admin')

const products = ref([])
const categories = ref([])
const loading = ref(false)
const selectedCategory = ref(null)
const searchTerm = ref('')
const showInactive = ref(false)
const currentPage = ref(1)
const PAGE_SIZE = 25

const drawerOpen = ref(false)
const selectedProduct = ref(null)
const formModalOpen = ref(false)
const editingProduct = ref(null)

const activeCount = computed(() => products.value.filter(p => p.is_available).length)

const filteredProducts = computed(() => {
  let list = products.value
  if (selectedCategory.value) list = list.filter(p => p.category_name === selectedCategory.value)
  if (searchTerm.value) {
    const q = searchTerm.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(q))
  }
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredProducts.value.length / PAGE_SIZE)))

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredProducts.value.slice(start, start + PAGE_SIZE)
})

watch([searchTerm, selectedCategory], () => { currentPage.value = 1 })

const fetchProducts = async () => {
  loading.value = true
  try {
    products.value = await getAllProducts({ showInactive: showInactive.value })
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    categories.value = await getProductCategories()
  } catch (err) {
    console.error(err)
  }
}

const selectCategory = (cat) => {
  selectedCategory.value = cat
  currentPage.value = 1
}

const toggleShowInactive = () => {
  showInactive.value = !showInactive.value
  fetchProducts()
}

const openDrawer = (prod) => {
  selectedProduct.value = prod
  drawerOpen.value = true
}

const openCreateModal = () => {
  editingProduct.value = null
  formModalOpen.value = true
}

const openEditModal = (prod) => {
  editingProduct.value = prod
  drawerOpen.value = false
  formModalOpen.value = true
}

const handleSaved = async () => {
  await Promise.all([fetchProducts(), fetchCategories()])
}

const handleDeactivated = () => {
  drawerOpen.value = false
  fetchProducts()
}

const handleRestored = () => {
  drawerOpen.value = false
  fetchProducts()
}

const handleDestroyed = () => {
  fetchProducts()
  fetchCategories()
}

onMounted(async () => {
  await Promise.all([fetchProducts(), fetchCategories()])
})
</script>
