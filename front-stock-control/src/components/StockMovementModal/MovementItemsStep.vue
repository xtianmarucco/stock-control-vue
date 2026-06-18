<template>
  <div class="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-5">

    <!-- ── LEFT: Catálogo de productos ────────────────────────────── -->
    <div class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold text-[var(--color-text-base)]">Productos disponibles</h3>
        <span class="rounded-full bg-[#EEF3FA] px-3 py-1 text-xs font-semibold text-[var(--color-text-muted)]">
          {{ filteredProducts.length }} productos
        </span>
      </div>

      <!-- Cargando -->
      <div
        v-if="loadingProducts"
        class="rounded-[24px] border border-[var(--color-border)] bg-[#FAFBFE] p-4 space-y-2"
      >
        <div v-for="i in 4" :key="i" class="rounded-[20px] border border-[var(--color-border)] bg-white px-4 py-3">
          <div class="flex items-center justify-between gap-3">
            <div class="flex-1">
              <SkeletonBlock :width="`${110 + i * 14}px`" height="14px" rounded="4px" class="mb-2" />
              <SkeletonBlock width="100px" height="11px" rounded="4px" />
            </div>
            <SkeletonBlock width="28px" height="28px" rounded="10px" />
          </div>
        </div>
      </div>

      <!-- Sin productos -->
      <div
        v-else-if="products.length === 0"
        class="rounded-[24px] border border-[var(--color-border)] bg-[#FAFBFE] py-10 text-center text-sm text-[var(--color-text-muted)]"
      >
        La sucursal no tiene productos con stock disponible.
      </div>

      <template v-else>
        <!-- Buscador -->
        <div class="relative">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Buscar producto..."
            class="w-full rounded-2xl border border-[var(--color-border)] bg-white py-2.5 pl-4 pr-10 text-sm text-[var(--color-text-base)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[#DCEBFF]"
          />
          <span class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">⌕</span>
        </div>

        <!-- Filtro por categoría -->
        <div class="flex gap-1.5 flex-wrap">
          <button
            type="button"
            class="rounded-xl px-3 py-1 text-xs font-semibold transition"
            :class="selectedCategory === null
              ? 'bg-[var(--color-primary)] text-white'
              : 'bg-[#EEF3FA] text-[var(--color-text-muted)] hover:bg-[#E2EBFF]'"
            @click="selectedCategory = null"
          >
            Todos
          </button>
          <button
            v-for="cat in categories"
            :key="cat"
            type="button"
            class="rounded-xl px-3 py-1 text-xs font-semibold transition"
            :class="selectedCategory === cat
              ? 'bg-[var(--color-primary)] text-white'
              : 'bg-[#EEF3FA] text-[var(--color-text-muted)] hover:bg-[#E2EBFF]'"
            @click="selectedCategory = cat"
          >
            {{ cat }}
          </button>
        </div>

        <!-- Lista de productos -->
        <div class="max-h-[360px] overflow-y-auto space-y-2 pr-0.5">
          <div
            v-if="filteredProducts.length === 0"
            class="py-6 text-center text-sm text-[var(--color-text-muted)]"
          >
            Sin resultados para "{{ searchTerm }}"
          </div>

          <button
            v-for="product in filteredProducts"
            :key="product.id"
            type="button"
            class="w-full rounded-[20px] border px-4 py-3 text-left transition"
            :class="isAdded(product.id)
              ? 'border-[var(--color-primary)] bg-[#EAF2FF] cursor-default'
              : 'border-[var(--color-border)] bg-white hover:border-[var(--color-primary)] hover:bg-[#F5F9FF]'"
            :disabled="isAdded(product.id)"
            @click="addProduct(product)"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0 flex-1">
                <p
                  class="truncate text-sm font-semibold"
                  :class="isAdded(product.id) ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-base)]'"
                >
                  {{ product.name }}
                </p>
                <div class="mt-1 flex items-center gap-2">
                  <span class="text-xs text-[var(--color-text-muted)]">{{ product.category_name }}</span>
                  <span class="text-[var(--color-text-muted)]">·</span>
                  <span class="text-xs font-medium text-[var(--color-text-muted)]">
                    {{ stockLabel(product) }} disp.
                  </span>
                </div>
              </div>
              <span
                class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold transition"
                :class="isAdded(product.id)
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[#EEF3FA] text-[var(--color-text-muted)]'"
              >
                {{ isAdded(product.id) ? '✓' : '+' }}
              </span>
            </div>
          </button>
        </div>
      </template>
    </div>

    <!-- ── RIGHT: Productos seleccionados ─────────────────────────── -->
    <div class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold text-[var(--color-text-base)]">Seleccionados</h3>
        <span
          class="rounded-full px-3 py-1 text-xs font-semibold"
          :class="localItems.length
            ? 'bg-[#EAF2FF] text-[var(--color-primary)]'
            : 'bg-[#EEF3FA] text-[var(--color-text-muted)]'"
        >
          {{ localItems.length }} items
        </span>
      </div>

      <!-- Estado vacío -->
      <div
        v-if="localItems.length === 0"
        class="rounded-[24px] border border-dashed border-[var(--color-border)] bg-[#FAFBFE] py-12 text-center text-sm text-[var(--color-text-muted)]"
      >
        <p class="font-medium">Ningún producto seleccionado</p>
        <p class="mt-1 text-xs">Hacé click en un producto de la izquierda para agregarlo.</p>
      </div>

      <!-- Lista de seleccionados -->
      <div v-else class="space-y-3">
        <div
          v-for="(row, index) in localItems"
          :key="row.uid"
          class="rounded-[20px] border border-[var(--color-border)] bg-[#FAFBFE] p-4"
        >
          <!-- Nombre + eliminar -->
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-[var(--color-text-base)]">{{ row.product_name }}</p>
              <p class="mt-0.5 text-xs text-[var(--color-text-muted)]">Disp: {{ stockAvailable(row) }}</p>
            </div>
            <button
              type="button"
              class="flex-shrink-0 rounded-xl bg-[#FEE2E2] p-1.5 text-xs font-bold text-[#DC2626] transition hover:bg-[#FECACA]"
              @click="removeItemRow(index)"
            >
              ✕
            </button>
          </div>

          <!-- Inputs por nivel de unidad -->
          <div class="mt-3 space-y-2">
            <div v-if="row.unidades_x_pack" class="flex items-center gap-2">
              <span class="w-16 flex-shrink-0 text-xs font-semibold text-[var(--color-text-muted)]">Bultos</span>
              <input
                type="number" min="0" step="1"
                v-model.number="row.qty_bultos"
                placeholder="0"
                class="flex-1 rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text-base)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[#DCEBFF]"
              />
            </div>
            <div v-if="row.unidades_x_caja" class="flex items-center gap-2">
              <span class="w-16 flex-shrink-0 text-xs font-semibold text-[var(--color-text-muted)]">Cajas</span>
              <input
                type="number" min="0" step="1"
                v-model.number="row.qty_cajas"
                placeholder="0"
                class="flex-1 rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text-base)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[#DCEBFF]"
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="w-16 flex-shrink-0 text-xs font-semibold text-[var(--color-text-muted)]">Unidades</span>
              <input
                type="number" min="0" step="1"
                v-model.number="row.qty_unidades"
                placeholder="0"
                class="flex-1 rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text-base)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[#DCEBFF]"
              />
            </div>
          </div>

          <!-- Total en unidades -->
          <p
            v-if="itemTotal(row) > 0 && (row.unidades_x_pack || row.unidades_x_caja)"
            class="mt-1.5 text-xs font-medium text-[var(--color-primary)]"
          >
            ↳ Total: {{ itemTotal(row) }} unidades
          </p>

          <!-- Aviso de desvío -->
          <p
            v-if="wouldCreateDesvio(row)"
            class="mt-1.5 text-xs font-semibold text-amber-600"
          >
            ⚠ Desvío: el stock resultará en {{ desvioResultante(row) }} u.
          </p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import SkeletonBlock from '../ui/SkeletonBlock.vue'

const props = defineProps({
  items: Array,
  products: Array,
  movementType: String,
  branchId: Number,
  loadingProducts: { type: Boolean, default: false }
})

const emit = defineEmits(['update:items'])

const localItems = ref(
  props.items && props.items.length > 0
    ? props.items.map(i => ({
        ...i,
        uid: crypto.randomUUID(),
        qty_bultos: i.qty_bultos ?? null,
        qty_cajas: i.qty_cajas ?? null,
        qty_unidades: i.qty_unidades ?? null,
      }))
    : []
)

// ─── Filtros del catálogo ─────────────────────────────────────────────────────

const searchTerm = ref('')
const selectedCategory = ref(null)

const categories = computed(() =>
  [...new Set(props.products.map(p => p.category_name))].sort()
)

const filteredProducts = computed(() => {
  let list = props.products
  if (selectedCategory.value) list = list.filter(p => p.category_name === selectedCategory.value)
  if (searchTerm.value) {
    const q = searchTerm.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(q))
  }
  return list
})

const isAdded = (productId) => localItems.value.some(r => r.product_id === productId)

// ─── Utilidades de unidad ─────────────────────────────────────────────────────

const stockAvailable = (row) => {
  if (row.available_stock == null) return '—'
  const s = row.available_stock
  if (s < 0) return `${s} u.`
  if (row.unidades_x_pack) return `${Math.floor(s / row.unidades_x_pack)} bultos`
  if (row.unidades_x_caja) return `${Math.floor(s / row.unidades_x_caja)} cajas`
  return `${s} unidades`
}

const stockLabel = (product) => {
  if (product.total < 0) return `${product.total} u.`
  if (product.unidades_x_pack) return `${Math.floor(product.total / product.unidades_x_pack)} bts`
  if (product.unidades_x_caja) return `${Math.floor(product.total / product.unidades_x_caja)} cajas`
  return `${product.total} u.`
}

const itemTotal = (row) => {
  const bultos = (row.qty_bultos || 0) * (row.unidades_x_pack || 0)
  const cajas = (row.qty_cajas || 0) * (row.unidades_x_caja || 0)
  const unidades = row.qty_unidades || 0
  return bultos + cajas + unidades
}

const wouldCreateDesvio = (row) => {
  if (props.movementType === 'INTERNAL') return false
  const qty = itemTotal(row)
  return qty > 0 && row.available_stock != null && qty > row.available_stock
}

const desvioResultante = (row) => (row.available_stock ?? 0) - itemTotal(row)

// ─── Handlers ────────────────────────────────────────────────────────────────

const addProduct = (product) => {
  if (isAdded(product.id)) return
  localItems.value.unshift({
    uid: crypto.randomUUID(),
    product_id: product.id,
    product_name: product.name,
    available_stock: product.total,
    cajas_x_pack: product.cajas_x_pack ?? null,
    unidades_x_caja: product.unidades_x_caja ?? null,
    unidades_x_pack: product.unidades_x_pack ?? null,
    qty_bultos: null,
    qty_cajas: null,
    qty_unidades: null,
  })
}

const removeItemRow = (index) => {
  localItems.value.splice(index, 1)
}

// ─── Emit al padre ────────────────────────────────────────────────────────────

watch(
  localItems,
  (val) => {
    emit('update:items', val.map(row => ({
      product_id: row.product_id,
      product_name: row.product_name,
      available_stock: row.available_stock,
      cajas_x_pack: row.cajas_x_pack,
      unidades_x_caja: row.unidades_x_caja,
      unidades_x_pack: row.unidades_x_pack,
      qty_bultos: row.qty_bultos,
      qty_cajas: row.qty_cajas,
      qty_unidades: row.qty_unidades,
    })))
  },
  { deep: true }
)
</script>
