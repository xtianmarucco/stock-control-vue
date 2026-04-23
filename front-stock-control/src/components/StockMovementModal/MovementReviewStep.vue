<!-- src/components/movements/MovementReviewStep.vue -->
<template>
  <div class="flex flex-col gap-6">

    <!-- Título -->
    <h3 class="text-xl font-semibold">Revisión del movimiento</h3>

    <!-- Detalles generales -->
    <div class="bg-gray-50 p-4 rounded-lg border">
      
      <h4 class="font-semibold text-lg mb-3">Detalles generales</h4>

      <div class="space-y-2 text-sm text-gray-700">

        <p>
          <span class="font-medium">Tipo:</span>
          {{ movementTypeLabel }}
        </p>

        <p>
          <span class="font-medium">Sucursal origen:</span>
          {{ fromBranchName }}
        </p>

        <p v-if="draft.movement_type === 'TRANSFER'">
          <span class="font-medium">Sucursal destino:</span>
          {{ toBranchName }}
        </p>

        <p v-if="reasonCategoryLabel">
          <span class="font-medium">Motivo:</span>
          {{ reasonCategoryLabel }}
        </p>

        <p v-if="draft.reason">
          <span class="font-medium">Descripción:</span>
          {{ draft.reason }}
        </p>
      </div>
    </div>

    <!-- Lista de productos -->
    <div class="bg-gray-50 p-4 rounded-lg border">

      <h4 class="font-semibold text-lg mb-3">Productos afectados</h4>

      <table class="w-full text-sm">
        <thead class="text-gray-500 border-b">
          <tr>
            <th class="text-left py-2">Producto</th>
            <th class="py-2 text-center">Stock actual</th>
            <th class="py-2 text-center">Cantidad</th>
            <th class="py-2 text-center">Resultado</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(item, idx) in draft.items"
            :key="idx"
            class="border-b"
          >
            <td class="py-2">{{ item.product_name }}</td>

            <td class="py-2 text-center text-gray-700">
              {{ item.available_stock ?? '-' }}
            </td>

            <td class="py-2 text-center font-semibold">
              {{ signedQuantity(item.quantity_input) }}
            </td>

            <td class="py-2 text-center">
              <span
                :class="[
                  'inline-block px-2 py-1 rounded text-xs font-semibold',
                  draft.movement_type === 'ADJUSTMENT'
                    ? 'bg-red-100 text-red-700'
                    : draft.movement_type === 'INTERNAL'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                ]"
              >
                {{ resultLabel }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

    </div>
  </div>
</template>


<script setup>
import { computed } from 'vue'

const props = defineProps({
  draft: { type: Object, required: true },
  branches: { type: Array, required: true }
})

//
// LABELS
//
const movementTypeLabel = computed(() => {
  return {
    TRANSFER: 'Traslado entre sucursales',
    ADJUSTMENT: 'Ajuste de stock',
    INTERNAL: 'Movimiento interno'
  }[props.draft.movement_type] || props.draft.movement_type
})

const reasonCategoryLabel = computed(() => {
  return {
    // Ajustes
    EXPIRED: 'Vencido',
    BROKEN: 'Roto',
    BOX_FINISHED: 'Caja terminada',

    // Internos
    SUPPLIER_UNLOAD: 'Descarga proveedor',
    OTHER_INCOME: 'Otros ingresos'
  }[props.draft.reason_category] || null
})

//
// Branch names
//
const fromBranchName = computed(() => {
  const found = props.branches.find(b => b.id === props.draft.from_branch_id)
  return found ? found.name : '-'
})

const toBranchName = computed(() => {
  const found = props.branches.find(b => b.id === props.draft.to_branch_id)
  return found ? found.name : '-'
})

//
// Cantidad con signo
//
const signedQuantity = (q) => {
  if (props.draft.movement_type === 'ADJUSTMENT') return `-${Math.abs(q)}`
  return `+${Math.abs(q)}`
}

//
// Etiqueta del resultado
//
const resultLabel = computed(() => {
  return {
    TRANSFER: 'Traslado',
    ADJUSTMENT: 'Ajuste',
    INTERNAL: 'Ingreso interno'
  }[props.draft.movement_type]
})
</script>