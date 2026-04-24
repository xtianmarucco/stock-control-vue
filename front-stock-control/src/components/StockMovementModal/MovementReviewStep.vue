<!-- src/components/movements/MovementReviewStep.vue -->
<template>
  <div class="flex flex-col gap-6">
    <h3 class="text-xl font-semibold text-[var(--color-text-base)]">Revisión del movimiento</h3>

    <div class="rounded-[28px] border border-[var(--color-border)] bg-[#FAFBFE] p-5">
      <h4 class="mb-4 text-lg font-semibold text-[var(--color-text-base)]">Detalles generales</h4>

      <div class="space-y-3 text-sm text-[var(--color-text-base)]">
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

    <div class="rounded-[28px] border border-[var(--color-border)] bg-[#FAFBFE] p-5">
      <h4 class="mb-4 text-lg font-semibold text-[var(--color-text-base)]">Productos afectados</h4>

      <div class="overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-white">
        <table class="w-full text-sm">
          <thead class="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
          <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">Producto</th>
              <th class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.16em]">Stock actual</th>
              <th class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.16em]">Cantidad</th>
              <th class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.16em]">Resultado</th>
          </tr>
          </thead>

          <tbody>
            <tr
              v-for="(item, idx) in draft.items"
              :key="idx"
              class="border-b border-[var(--color-border)] last:border-b-0"
            >
              <td class="px-4 py-3 text-[var(--color-text-base)]">{{ item.product_name }}</td>
              <td class="px-4 py-3 text-center text-[var(--color-text-muted)]">{{ item.available_stock ?? '-' }}</td>
              <td class="px-4 py-3 text-center font-semibold text-[var(--color-text-base)]">{{ signedQuantity(item.quantity_input) }}</td>
              <td class="px-4 py-3 text-center">
                <span :class="resultBadgeClass">{{ resultLabel }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>


<script setup>
import { computed } from 'vue'

const props = defineProps({
  draft: { type: Object, required: true },
  branches: { type: Array, required: true },
  reasonCategories: { type: Array, default: () => [] }
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
  return props.reasonCategories.find(category => category.id === props.draft.reason_category_id)?.label || null
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

const resultBadgeClass = computed(() => {
  const base = 'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold'

  return {
    TRANSFER: `${base} bg-[#DBEAFE] text-[#1D4ED8]`,
    ADJUSTMENT: `${base} bg-[#FEE2E2] text-[#DC2626]`,
    INTERNAL: `${base} bg-[#DCFCE7] text-[#16A34A]`
  }[props.draft.movement_type] || `${base} bg-[#E5E7EB] text-[#4B5563]`
})
</script>
