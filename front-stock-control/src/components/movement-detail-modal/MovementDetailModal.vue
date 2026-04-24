<!-- src/components/MovementDetailModal/MovementDetailModal.vue -->
<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6"
    @click.self="close"
  >
    <div class="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[32px] bg-[var(--color-card)] shadow-[0_30px_60px_rgba(15,35,64,0.18)]">
      <header class="border-b border-[var(--color-border)] px-6 py-5 sm:px-8">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-[var(--color-primary)]">Consulta</p>
            <h2 class="mt-1 text-2xl font-bold text-[var(--color-text-base)]">Detalle del movimiento</h2>
            <p class="mt-1 text-sm text-[var(--color-text-muted)]">
              Resumen completo del movimiento registrado.
            </p>
          </div>
          <button
            @click="close"
            class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5F7FB] text-[var(--color-text-muted)] transition hover:bg-[#E9EEF8] hover:text-[var(--color-text-base)]"
          >
            ✕
          </button>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
        <div
          v-if="loading"
          class="rounded-[28px] border border-[var(--color-border)] bg-[#FAFBFE] px-5 py-10 text-center text-sm text-[var(--color-text-muted)]"
        >
          Cargando detalle del movimiento...
        </div>

        <div
          v-else-if="error"
          class="rounded-[28px] border border-[#FECACA] bg-[#FEF2F2] px-5 py-4 text-sm text-[#B91C1C]"
        >
          {{ error }}
        </div>

        <div v-else-if="movement" class="space-y-6">
          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div class="rounded-[28px] border border-[var(--color-border)] bg-[#FAFBFE] p-5">
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Fecha</p>
              <p class="mt-2 text-lg font-semibold text-[var(--color-text-base)]">{{ formatDate(movement.created_at) }}</p>
            </div>

            <div class="rounded-[28px] border border-[var(--color-border)] bg-[#FAFBFE] p-5">
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Tipo</p>
              <div class="mt-2">
                <span :class="typeBadgeClass(movement.movement_type)">{{ formatType(movement.movement_type) }}</span>
              </div>
            </div>

            <div class="rounded-[28px] border border-[var(--color-border)] bg-[#FAFBFE] p-5">
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Sucursal origen</p>
              <p class="mt-2 text-lg font-semibold text-[var(--color-text-base)]">{{ movement.from_branch_name || '—' }}</p>
            </div>

            <div class="rounded-[28px] border border-[var(--color-border)] bg-[#FAFBFE] p-5">
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Sucursal destino</p>
              <p class="mt-2 text-lg font-semibold text-[var(--color-text-base)]">{{ movement.to_branch_name || '—' }}</p>
            </div>
          </div>

          <div class="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div class="rounded-[28px] border border-[var(--color-border)] bg-[#FAFBFE] p-5">
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Motivo</p>
              <p class="mt-2 text-base font-semibold text-[var(--color-text-base)]">
                {{ movement.reason_category_label || 'Sin categoría' }}
              </p>
              <p class="mt-2 text-sm text-[var(--color-text-muted)]">
                {{ movement.reason || 'Sin descripción adicional.' }}
              </p>
            </div>

            <div class="rounded-[28px] border border-[var(--color-border)] bg-[#FAFBFE] p-5">
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Registrado por</p>
              <p class="mt-2 text-base font-semibold text-[var(--color-text-base)]">
                {{ movement.created_by?.username || '—' }}
              </p>
              <p class="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Productos</p>
              <p class="mt-2 text-2xl font-bold text-[var(--color-text-base)]">{{ movement.items?.length || 0 }}</p>
            </div>
          </div>

          <div class="rounded-[28px] border border-[var(--color-border)] bg-[#FAFBFE] p-5">
            <div class="mb-4 flex items-center justify-between gap-3">
              <h3 class="text-lg font-semibold text-[var(--color-text-base)]">Productos involucrados</h3>
              <span class="rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
                {{ movement.items?.length || 0 }} items
              </span>
            </div>

            <div class="overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-white">
              <table class="min-w-full text-sm">
                <thead class="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">Producto</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em]">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in movement.items"
                    :key="item.product_id"
                    class="border-b border-[var(--color-border)] last:border-b-0"
                  >
                    <td class="px-4 py-3 text-[var(--color-text-base)]">{{ item.product_name }}</td>
                    <td class="px-4 py-3 text-right font-semibold text-[var(--color-text-base)]">
                      {{ formatQuantity(item.quantity) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <footer class="border-t border-[var(--color-border)] bg-[#F8FAFD] px-6 py-4 text-right sm:px-8">
        <button
          @click="close"
          class="rounded-2xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text-base)] transition hover:bg-white"
        >
          Cerrar
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getStockMovementById } from '../../services/MovementsService.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  movementId: { type: [Number, String], default: null }
})

const emit = defineEmits(['update:modelValue'])

const movement = ref(null)
const loading = ref(false)
const error = ref(null)

const formatDate = (date) => new Date(date).toLocaleDateString('es-AR')
const formatType = (type) =>
  ({ TRANSFER: 'Traslado', ADJUSTMENT: 'Ajuste', INTERNAL: 'Interno' }[type] || type)
const formatQuantity = (quantity) => quantity > 0 ? `+${quantity}` : `${quantity}`

const typeBadgeClass = (type) => {
  const base = 'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold'
  const map = {
    TRANSFER: `${base} bg-[#DBEAFE] text-[#1D4ED8]`,
    ADJUSTMENT: `${base} bg-[#FEE2E2] text-[#DC2626]`,
    INTERNAL: `${base} bg-[#EDE9FE] text-[#7C3AED]`
  }

  return map[type] ?? `${base} bg-[#E5E7EB] text-[#4B5563]`
}

const close = () => {
  emit('update:modelValue', false)
}

const fetchMovement = async () => {
  if (!props.modelValue || !props.movementId) return

  loading.value = true
  error.value = null
  movement.value = null

  try {
    movement.value = await getStockMovementById(props.movementId)
  } catch (err) {
    error.value = 'No se pudo cargar el detalle del movimiento.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.modelValue, props.movementId],
  async ([isOpen]) => {
    if (isOpen) {
      await fetchMovement()
    }
  },
  { immediate: true }
)
</script>
