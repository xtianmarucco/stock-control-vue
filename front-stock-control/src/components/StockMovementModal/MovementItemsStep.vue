<!-- src/components/movements/MovementItemsStep.vue -->
<template>
  <div class="flex flex-col gap-6">
    <div class="flex justify-between items-center">
      <div>
        <h3 class="text-lg font-semibold text-[var(--color-text-base)]">Seleccionar productos</h3>
        <p class="mt-1 text-sm text-[var(--color-text-muted)]">
          Trabajás sobre el stock actual de la sucursal origen.
        </p>
      </div>
      <button
        class="rounded-2xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(20,121,255,0.18)] transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        @click="addItemRow"
        :disabled="loadingProducts"
      >
        + Agregar producto
      </button>
    </div>

    <div v-if="loadingProducts" class="rounded-[28px] border border-[var(--color-border)] bg-[#FAFBFE] px-5 py-8 text-center text-sm text-[var(--color-text-muted)]">
      Cargando stock disponible...
    </div>

    <div v-else-if="products.length === 0" class="rounded-[28px] border border-[var(--color-border)] bg-[#FAFBFE] px-5 py-8 text-center text-sm text-[var(--color-text-muted)]">
      La sucursal seleccionada no tiene productos con stock disponible.
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="(row, index) in localItems"
        :key="row.uid"
        class="rounded-[28px] border border-[var(--color-border)] bg-[#FAFBFE] p-4 space-y-4"
      >
        <!-- Fila superior: producto + stock disp -->
        <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_160px]">
          <div>
            <p class="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Producto</p>
            <ProductSelectInput v-model="row.product" :options="products" @select="(p) => onProductSelected(p, row)" />
          </div>

          <div class="rounded-2xl bg-white px-4 py-3 text-center">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Stock disp.</p>
            <p class="mt-1 font-bold text-[var(--color-text-base)]">
              {{ availableInUnit(row) }}
            </p>
            <p v-if="row.available_stock != null && row.quantity_unit !== 'UNIDAD'" class="mt-0.5 text-xs text-[var(--color-text-muted)]">
              {{ row.available_stock }} u.
            </p>
          </div>
        </div>

        <!-- Fila inferior: selector de unidad + cantidad + eliminar -->
        <div class="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <!-- Selector de unidad -->
            <p class="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Unidad y cantidad</p>
            <div class="flex gap-1 mb-2" v-if="row.product_id">
              <button
                v-for="unit in availableUnits(row)"
                :key="unit.value"
                type="button"
                class="rounded-xl px-3 py-1.5 text-xs font-semibold transition"
                :class="row.quantity_unit === unit.value
                  ? 'bg-[var(--color-primary)] text-white shadow-[0_8px_16px_rgba(20,121,255,0.2)]'
                  : 'bg-white border border-[var(--color-border)] text-[var(--color-text-base)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'"
                @click="setUnit(row, unit.value)"
              >
                {{ unit.label }}
              </button>
            </div>

            <div class="relative">
              <input
                type="number"
                min="1"
                step="1"
                v-model.number="row.quantity_input"
                :placeholder="row.product_id ? `Cantidad en ${unitLabel(row.quantity_unit)}` : 'Seleccioná un producto primero'"
                :disabled="!row.product_id"
                class="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text-base)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[#DCEBFF] disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <!-- Conversión informativa -->
            <p
              v-if="conversionInfo(row)"
              class="mt-1.5 text-xs font-medium"
              :class="'text-[var(--color-primary)]'"
            >
              ↳ {{ conversionInfo(row) }}
            </p>
          </div>

          <button
            class="self-end rounded-2xl bg-[#FEE2E2] px-4 py-3 text-sm font-semibold text-[#DC2626] transition hover:bg-[#FECACA]"
            @click="removeItemRow(index)"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <div v-if="localItems.length === 0 && !loadingProducts && products.length > 0" class="text-center text-sm text-[var(--color-text-muted)] py-6">
      Aún no agregaste productos.
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import ProductSelectInput from './ProductSelectInput.vue'

const props = defineProps({
  items: Array,
  products: Array,        // [{ id, name, total (unidades), cajas_x_pack, unidades_x_caja, unidades_x_pack }]
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

// Convierte cantidad en la unidad elegida → unidades (siempre entero porque mult. de enteros)
const toUnidades = (qty, unit, row) => {
  if (!qty || qty <= 0) return null
  if (unit === 'UNIDAD') return qty
  if (unit === 'CAJA') return row.unidades_x_caja ? qty * row.unidades_x_caja : null
  if (unit === 'BULTO') return row.unidades_x_pack ? qty * row.unidades_x_pack : null
  return null
}

const availableInUnit = (row) => {
  if (row.available_stock == null) return '-'
  const s = row.available_stock // en unidades
  if (row.quantity_unit === 'BULTO' && row.unidades_x_pack) return `${Math.floor(s / row.unidades_x_pack)} bultos`
  if (row.quantity_unit === 'CAJA' && row.unidades_x_caja) return `${Math.floor(s / row.unidades_x_caja)} cajas`
  return `${s} unidades`
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

const addItemRow = () => {
  localItems.value.push({
    uid: crypto.randomUUID(),
    product: null,
    product_id: null,
    product_name: '',
    available_stock: null,
    cajas_x_pack: null,
    unidades_x_caja: null,
    unidades_x_pack: null,
    quantity_input: null,
    quantity_unit: 'UNIDAD'
  })
}

const removeItemRow = (index) => {
  localItems.value.splice(index, 1)
}

const onProductSelected = (product, row) => {
  row.product_id = product.id
  row.product_name = product.name
  row.available_stock = product.total       // en unidades
  row.cajas_x_pack = product.cajas_x_pack ?? null
  row.unidades_x_caja = product.unidades_x_caja ?? null
  row.unidades_x_pack = product.unidades_x_pack ?? null
  row.quantity_input = null
  row.quantity_unit = defaultUnit(row)
}

watch(
  localItems,
  (val) => {
    const mapped = val.map(row => ({
      product_id: row.product_id,
      product_name: row.product_name,
      available_stock: row.available_stock,
      cajas_x_pack: row.cajas_x_pack,
      unidades_x_caja: row.unidades_x_caja,
      unidades_x_pack: row.unidades_x_pack,
      quantity_input: row.quantity_input,
      quantity_unit: row.quantity_unit ?? 'UNIDAD'
    }))
    emit('update:items', mapped)
  },
  { deep: true }
)
</script>
