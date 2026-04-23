<!-- src/components/movements/MovementItemsStep.vue -->
<template>
  <div class="flex flex-col gap-6">

    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold">Seleccionar productos</h3>
      <button class="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700" @click="addItemRow">
        ➕ Agregar producto
      </button>
    </div>

    <!-- Lista de productos -->
    <div class="space-y-4">
      <div v-for="(row, index) in localItems" :key="row.uid"
        class="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <!-- Selector de producto -->
        <div class="w-1/2">
          <ProductSelectInput v-model="row.product" :options="products" @select="(p) => onProductSelected(p, row)" />
        </div>

        <!-- Stock disponible -->
        <div class="w-32 text-center">
          <p class="text-xs text-gray-500">Stock disp.</p>
          <p class="font-semibold text-gray-800">
            {{ row.available_stock ?? '-' }}
          </p>
        </div>

        <!-- Cantidad -->
        <div class="w-32">
          <p class="text-xs text-gray-500 mb-1">Cantidad</p>
          <input type="number" min="1" v-model.number="row.quantity_input" class="border rounded-lg px-3 py-2 w-full" />
        </div>

        <!-- Eliminar -->
        <button class="text-red-600 text-sm hover:underline ml-auto" @click="removeItemRow(index)">
          Eliminar
        </button>
      </div>
    </div>

    <!-- Validación simple -->
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
  branchId: Number         // sucursal de origen (para mostrar stock disponible)
})

const emit = defineEmits(['update:items'])

// -----------------------------
// Copia local para reactive UX
// -----------------------------
const localItems = ref(
  props.items && props.items.length > 0
    ? props.items.map(i => ({ ...i, uid: crypto.randomUUID() }))
    : []
)

// -----------------------------
// Métodos
// -----------------------------

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
  // product tiene { id, name, total }
  row.product_id = product.id
  row.product_name = product.name
  row.available_stock = product.total
}

// -----------------------------
// Emitir cambios al padre
// -----------------------------
watch(
  localItems,
  (val) => {
    // Convertimos filas internas a la estructura final
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