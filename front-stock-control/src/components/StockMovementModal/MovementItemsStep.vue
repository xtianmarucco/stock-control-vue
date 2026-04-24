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
      <div v-for="(row, index) in localItems" :key="row.uid"
        class="grid gap-4 rounded-[28px] border border-[var(--color-border)] bg-[#FAFBFE] p-4 md:grid-cols-[minmax(0,1.5fr)_140px_140px_auto] md:items-end">
        <div>
          <p class="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Producto</p>
          <ProductSelectInput v-model="row.product" :options="products" @select="(p) => onProductSelected(p, row)" />
        </div>

        <div class="rounded-2xl bg-white px-4 py-3 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Stock disp.</p>
          <p class="mt-1 font-semibold text-[var(--color-text-base)]">
            {{ row.available_stock ?? '-' }}
          </p>
        </div>

        <div>
          <p class="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Cantidad</p>
          <input
            type="number"
            min="1"
            v-model.number="row.quantity_input"
            class="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text-base)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[#DCEBFF]"
          />
        </div>

        <button class="justify-self-start rounded-2xl bg-[#FEE2E2] px-4 py-3 text-sm font-semibold text-[#DC2626] transition hover:bg-[#FECACA] md:justify-self-end" @click="removeItemRow(index)">
          Eliminar
        </button>
      </div>
    </div>

    <div v-if="localItems.length === 0" class="text-center text-gray-500 py-6">
      Aún no has agregado productos.
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import ProductSelectInput from './ProductSelectInput.vue'

const props = defineProps({
  items: Array,           // [{ product_id, product_name, available_stock, quantity_input }]
  products: Array,        // [{ id, name, total }]
  movementType: String,
  reasonCategory: String,
  branchId: Number,
  loadingProducts: { type: Boolean, default: false }
})

const emit = defineEmits(['update:items'])

const localItems = ref(
  props.items && props.items.length > 0
    ? props.items.map(i => ({ ...i, uid: crypto.randomUUID() }))
    : []
)

const addItemRow = () => {
  localItems.value.push({
    uid: crypto.randomUUID(),
    product: null,
    product_id: null,
    product_name: '',
    available_stock: null,
    quantity_input: null
  })
}

const removeItemRow = (index) => {
  localItems.value.splice(index, 1)
}

const onProductSelected = (product, row) => {
  row.product_id = product.id
  row.product_name = product.name
  row.available_stock = product.total
}

watch(
  localItems,
  (val) => {
    const mapped = val.map(row => ({
      product_id: row.product_id,
      product_name: row.product_name,
      available_stock: row.available_stock,
      quantity_input: row.quantity_input
    }))
    emit('update:items', mapped)
  },
  { deep: true }
)
</script>
