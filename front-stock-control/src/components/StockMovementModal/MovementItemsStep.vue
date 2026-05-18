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
        class="rounded-[24px] border border-[var(--color-border)] bg-[#FAFBFE] py-10 text-center text-sm text-[var(--color-text-muted)]"
      >
        Cargando stock disponible...
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
              <p class="mt-0.5 text-xs text-[var(--color-text-muted)]">Disp: {{ availableInUnit(row) }}</p>
            </div>
            <button
              type="button"
              class="flex-shrink-0 rounded-xl bg-[#FEE2E2] p-1.5 text-xs font-bold text-[#DC2626] transition hover:bg-[#FECACA]"
              @click="removeItemRow(index)"
            >
              ✕
            </button>
          </div>

          <!-- Selector de unidad -->
          <div v-if="row.product_id" class="mt-3 flex gap-1">
            <button
              v-for="unit in availableUnits(row)"
              :key="unit.value"
              type="button"
              class="rounded-xl px-3 py-1.5 text-xs font-semibold transition"
              :class="row.quantity_unit === unit.value
                ? 'bg-[var(--color-primary)] text-white shadow-[0_4px_12px_rgba(20,121,255,0.2)]'
                : 'bg-white border border-[var(--color-border)] text-[var(--color-text-base)] hover:border-[var(--color-primary)]'"
              @click="setUnit(row, unit.value)"
            >
              {{ unit.label }}
            </button>
          </div>

          <!-- Input de cantidad -->
          <div class="mt-2">
            <input
              type="number"
              min="1"
              step="1"
              v-model.number="row.quantity_input"
              :placeholder="`Cantidad en ${unitLabel(row.quantity_unit)}`"
              class="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-text-base)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[#DCEBFF]"
            />
          </div>

          <!-- Info de conversión -->
          <p
            v-if="conversionInfo(row)"
            class="mt-1.5 text-xs font-medium text-[var(--color-primary)]"
          >
            ↳ {{ conversionInfo(row) }}
          </p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

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
    ? props.items.map(i => ({ ...i, uid: crypto.randomUUID() }))
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

const unitLabel = (unit) => ({ BULTO: 'bultos', CAJA: 'cajas', UNIDAD: 'unidades' }[unit] ?? 'unidades')

const availableUnits = (row) => {
  const units = [{ value: 'UNIDAD', label: 'Unidad' }]
  if (row.unidades_x_caja) units.unshift({ value: 'CAJA', label: 'Caja' })
  if (row.unidades_x_pack) units.unshift({ value: 'BULTO', label: 'Bulto' })
  return units
}

const defaultUnit = (row) => {
  if (row.unidades_x_pack) return 'BULTO'
  if (row.unidades_x_caja) return 'CAJA'
  return 'UNIDAD'
}

const toUnidades = (qty, unit, row) => {
  if (!qty || qty <= 0) return null
  if (unit === 'UNIDAD') return qty
  if (unit === 'CAJA') return row.unidades_x_caja ? qty * row.unidades_x_caja : null
  if (unit === 'BULTO') return row.unidades_x_pack ? qty * row.unidades_x_pack : null
  return null
}

const availableInUnit = (row) => {
  if (row.available_stock == null) return '—'
  const s = row.available_stock
  if (row.quantity_unit === 'BULTO' && row.unidades_x_pack) return `${Math.floor(s / row.unidades_x_pack)} bultos`
  if (row.quantity_unit === 'CAJA' && row.unidades_x_caja) return `${Math.floor(s / row.unidades_x_caja)} cajas`
  return `${s} unidades`
}

const stockLabel = (product) => {
  if (product.unidades_x_pack) return `${Math.floor(product.total / product.unidades_x_pack)} bts`
  if (product.unidades_x_caja) return `${Math.floor(product.total / product.unidades_x_caja)} cajas`
  return `${product.total} u.`
}

const conversionInfo = (row) => {
  if (!row.quantity_input || row.quantity_unit === 'UNIDAD') return null
  const u = toUnidades(row.quantity_input, row.quantity_unit, row)
  if (u === null) return null
  return `${row.quantity_input} ${unitLabel(row.quantity_unit)} = ${u} unidades`
}

// ─── Handlers ────────────────────────────────────────────────────────────────

const setUnit = (row, unit) => {
  row.quantity_unit = unit
  row.quantity_input = null
}

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
    quantity_input: null,
    quantity_unit: defaultUnit(product)
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
      quantity_input: row.quantity_input,
      quantity_unit: row.quantity_unit ?? 'UNIDAD'
    })))
  },
  { deep: true }
)
</script>
