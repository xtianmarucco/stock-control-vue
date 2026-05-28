<template>
  <ProductDrawer v-model="drawerOpen" :preview="selectedProduct" />

  <div class="space-y-6">
    <section class="rounded-[32px] border border-[var(--color-border)] bg-white px-6 py-6 shadow-[0_24px_50px_rgba(15,35,64,0.08)] sm:px-8">
      <div class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p class="text-sm font-medium text-[var(--color-primary)]">Inventario por sucursal</p>
          <h1 class="mt-1 text-3xl font-bold text-[var(--color-text-base)]">
            Gestión de productos
            <span v-if="branchName" class="text-[var(--color-primary)]">— {{ branchName }}</span>
          </h1>
          <p class="mt-2 max-w-2xl text-sm text-[var(--color-text-muted)]">
            Consultá el stock disponible, filtrá por categoría y detectá rápido productos con nivel crítico.
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-3 xl:min-w-[420px]">
          <div class="rounded-[24px] border border-[var(--color-border)] bg-[#FAFBFE] px-4 py-4">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Productos visibles</p>
            <p class="mt-2 text-2xl font-bold text-[var(--color-text-base)]">{{ filteredProducts.length }}</p>
          </div>
          <div class="rounded-[24px] border border-[var(--color-border)] bg-[#FAFBFE] px-4 py-4">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Categorías</p>
            <p class="mt-2 text-2xl font-bold text-[var(--color-text-base)]">{{ categories.length }}</p>
          </div>
          <div class="rounded-[24px] border border-[var(--color-border)] bg-[#FAFBFE] px-4 py-4">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Stock crítico</p>
            <p class="mt-2 text-2xl font-bold text-[var(--color-text-base)]">{{ lowStockCount }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:items-start xl:grid-cols-[290px_minmax(0,1fr)]">
      <aside class="self-start rounded-[32px] border border-[var(--color-border)] bg-white p-5 shadow-[0_24px_50px_rgba(15,35,64,0.08)]">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-xl font-semibold text-[var(--color-text-base)]">Categorías</h2>
            <p class="mt-1 text-sm text-[var(--color-text-muted)]">Filtrá el listado por familia de producto.</p>
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
      </aside>

      <div class="min-w-0 space-y-5 self-start">
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
                {{ stockSummaryText }}
              </span>
            </div>

            <div class="relative w-full lg:max-w-md">
              <input
                v-model="searchTerm"
                type="text"
                placeholder="Buscar producto por nombre..."
                class="w-full rounded-2xl border border-[var(--color-border)] bg-[#FAFBFE] px-4 py-3 pr-11 text-sm text-[var(--color-text-base)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[#DCEBFF]"
              />
              <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">⌕</span>
            </div>
          </div>
        </section>

        <section class="rounded-[32px] border border-[var(--color-border)] bg-white p-5 shadow-[0_24px_50px_rgba(15,35,64,0.08)]">
          <div v-if="loading" class="overflow-hidden rounded-[28px] border border-[var(--color-border)]">
            <div class="border-b border-[var(--color-border)] bg-[#F8FAFD] px-5 py-4">
              <SkeletonBlock width="100px" height="11px" rounded="4px" />
            </div>
            <div class="divide-y divide-[var(--color-border)]">
              <div v-for="i in 5" :key="i" class="flex items-center justify-between gap-4 px-5 py-4">
                <div class="flex-1">
                  <SkeletonBlock :width="`${120 + i * 14}px`" height="14px" rounded="4px" class="mb-2" />
                  <SkeletonBlock width="80px" height="11px" rounded="4px" />
                </div>
                <SkeletonBlock width="64px" height="20px" rounded="999px" />
              </div>
            </div>
          </div>

          <div v-else-if="filteredProducts.length === 0" class="rounded-[28px] border border-[var(--color-border)] bg-[#FAFBFE] px-5 py-10 text-center">
            <p class="text-base font-semibold text-[var(--color-text-base)]">No se encontraron productos</p>
            <p class="mt-2 text-sm text-[var(--color-text-muted)]">
              Probá cambiar la categoría o ajustar el término de búsqueda.
            </p>
          </div>

          <div v-else class="overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-white">
            <div class="flex flex-col gap-3 border-b border-[var(--color-border)] bg-[#F8FAFD] px-5 py-4 md:flex-row md:items-center md:justify-between">
              <p class="text-sm text-[var(--color-text-muted)]">
                Mostrando {{ paginationLabel }}
              </p>

              <label class="flex items-center gap-3 text-sm text-[var(--color-text-base)]">
                <span class="font-medium">Por página</span>
                <select
                  v-model.number="pageSize"
                  class="rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[#DCEBFF]"
                >
                  <option v-for="option in pageSizeOptions" :key="option" :value="option">{{ option }}</option>
                </select>
              </label>
            </div>

            <div class="hidden grid-cols-[minmax(0,1.6fr)_minmax(180px,0.8fr)_160px] border-b border-[var(--color-border)] bg-[#F8FAFD] px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)] md:grid">
              <span>Producto</span>
              <span>Categoría</span>
              <span class="text-right">Stock total</span>
            </div>

            <div class="divide-y divide-[var(--color-border)]">
              <article
                v-for="prod in paginatedProducts"
                :key="prod.id"
                class="grid cursor-pointer gap-3 px-5 py-4 transition hover:bg-[#F0F6FF] md:grid-cols-[minmax(0,1.6fr)_minmax(180px,0.8fr)_160px] md:items-center"
                @click="openDrawer(prod)"
              >
                <div class="min-w-0">
                  <p class="text-base font-semibold leading-snug text-[var(--color-text-base)] md:max-w-[28rem]">
                    {{ prod.name }}
                  </p>
                  <p class="mt-1 text-sm text-[var(--color-text-muted)] md:hidden">{{ prod.category_name }}</p>
                </div>

                <div class="hidden md:block">
                  <span class="inline-flex rounded-full bg-[#EEF3FA] px-3 py-1 text-xs font-semibold text-[var(--color-text-base)]">
                    {{ prod.category_name }}
                  </span>
                </div>

                <div class="flex items-center justify-between md:flex-col md:items-end md:gap-1">
                  <span class="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)] md:hidden">Stock</span>
                  <div class="flex flex-wrap justify-end gap-1">
                    <span
                      v-for="part in stockParts(prod)"
                      :key="part"
                      class="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-semibold"
                      :class="prod.low_stock ? 'bg-[#FEE2E2] text-[#DC2626]' : 'bg-[#DCFCE7] text-[#16A34A]'"
                    >
                      {{ part }}
                    </span>
                  </div>
                </div>
              </article>
            </div>

            <div
              v-if="totalPages > 1"
              class="flex flex-col gap-3 border-t border-[var(--color-border)] bg-[#F8FAFD] px-5 py-4 md:flex-row md:items-center md:justify-between"
            >
              <p class="text-sm text-[var(--color-text-muted)]">
                Página {{ currentPage }} de {{ totalPages }}
              </p>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="rounded-2xl border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-text-base)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="currentPage === 1"
                  @click="goToPreviousPage"
                >
                  Anterior
                </button>

                <span class="rounded-full bg-white px-3 py-1 text-sm font-semibold text-[var(--color-text-base)]">
                  {{ currentPage }}
                </span>

                <button
                  type="button"
                  class="rounded-2xl border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-text-base)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="currentPage === totalPages"
                  @click="goToNextPage"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import SkeletonBlock from '../components/ui/SkeletonBlock.vue'
import { useRoute } from 'vue-router'
import { getStockByBranch } from '../services/ProductService.js'
import { getStockSummaryByCategory } from '../services/stockService.js'
import { getBranchById } from '../services/BranchService.js'
import ProductDrawer from '../components/product-drawer/ProductDrawer.vue'

const route = useRoute()

const branchId = computed(() => Number(route.params.branchId))

const drawerOpen = ref(false)
const selectedProduct = ref(null)

const openDrawer = (prod) => {
  selectedProduct.value = prod
  drawerOpen.value = true
}

const branchName = ref('')
const products = ref([])
const categories = ref([])
const selectedCategory = ref(null)
const searchTerm = ref('')
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(25)
const pageSizeOptions = [10, 25, 50, 100]

const pluralize = (word, count) => {
  if (count === 1) return word
  const last = word.slice(-1).toLowerCase()
  return 'aeiouáéíóú'.includes(last) ? word + 's' : word + 'es'
}

const stockParts = (prod) => {
  const total = prod.total ?? 0
  const uxp = prod.unidades_x_pack
  const uxc = prod.unidades_x_caja
  const n2 = prod.nivel2_label || 'caja'
  const ul = prod.unidad_label || 'unidad'
  const parts = []

  if (uxp) {
    const bultos = Math.floor(total / uxp)
    const resto = total % uxp
    if (bultos > 0) parts.push(`${bultos} ${pluralize('bulto', bultos)}`)
    if (uxc) {
      const cajas = Math.floor(resto / uxc)
      const unidades = resto % uxc
      if (cajas > 0) parts.push(`${cajas} ${pluralize(n2, cajas)}`)
      if (unidades > 0) parts.push(`${unidades} ${pluralize(ul, unidades)}`)
    } else if (resto > 0) {
      parts.push(`${resto} ${pluralize(ul, resto)}`)
    }
  } else if (uxc) {
    const cajas = Math.floor(total / uxc)
    const unidades = total % uxc
    if (cajas > 0) parts.push(`${cajas} ${pluralize(n2, cajas)}`)
    if (unidades > 0) parts.push(`${unidades} ${pluralize(ul, unidades)}`)
  } else {
    parts.push(`${total} ${pluralize(ul, total)}`)
  }

  return parts.length ? parts : [`0 ${pluralize(ul, 0)}`]
}

const filteredProducts = computed(() => {
  if (!searchTerm.value) return products.value
  const query = searchTerm.value.toLowerCase()
  return products.value.filter(product => product.name.toLowerCase().includes(query))
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredProducts.value.length / pageSize.value)))

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredProducts.value.slice(start, start + pageSize.value)
})

const lowStockCount = computed(() => products.value.filter(product => product.low_stock).length)
const totalPacks = computed(() => products.value.reduce((acc, p) => acc + (p.pack_total ?? p.total ?? 0), 0))
const stockSummaryText = computed(() => `${products.value.length} productos • ${totalPacks.value} bultos`)
const paginationLabel = computed(() => {
  if (!filteredProducts.value.length) return '0 resultados'

  const start = (currentPage.value - 1) * pageSize.value + 1
  const end = Math.min(currentPage.value * pageSize.value, filteredProducts.value.length)

  return `${start}-${end} de ${filteredProducts.value.length} productos`
})

const fetchBranchName = async () => {
  try {
    const data = await getBranchById(branchId.value)
    branchName.value = data.name
  } catch (err) {
    console.error('Error fetching branch name:', err)
    branchName.value = ''
  }
}

const fetchProducts = async () => {
  loading.value = true
  try {
    const response = await getStockByBranch(branchId.value, selectedCategory.value)
    branchName.value = response.branch.name
    products.value = response.products
  } catch (err) {
    console.error('Error fetching products:', err)
    products.value = []
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const data = await getStockSummaryByCategory(branchId.value)
    categories.value = data.map(item => item.category)
  } catch (err) {
    console.error('Error fetching categories:', err)
    categories.value = []
  }
}

const selectCategory = (category) => {
  selectedCategory.value = category
}

const goToPreviousPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

watch(selectedCategory, fetchProducts)

watch([searchTerm, selectedCategory, pageSize], () => {
  currentPage.value = 1
})

watch(totalPages, (pages) => {
  if (currentPage.value > pages) {
    currentPage.value = pages
  }
})

watch(branchId, async (newValue, oldValue) => {
  if (newValue !== oldValue) {
    searchTerm.value = ''
    selectedCategory.value = null
    currentPage.value = 1
    await Promise.all([fetchBranchName(), fetchCategories(), fetchProducts()])
  }
})

onMounted(async () => {
  await Promise.all([fetchBranchName(), fetchCategories(), fetchProducts()])
})
</script>
