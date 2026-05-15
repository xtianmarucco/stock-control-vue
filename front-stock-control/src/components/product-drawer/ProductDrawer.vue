<template>
  <!-- Overlay -->
  <Transition name="overlay">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-40 bg-slate-950/40"
      @click="$emit('update:modelValue', false)"
    />
  </Transition>

  <!-- Drawer -->
  <Transition name="drawer">
    <aside
      v-if="modelValue"
      class="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-[−40px_0_80px_rgba(15,35,64,0.12)]"
    >
      <!-- Header -->
      <div class="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-6 py-5">
        <div class="min-w-0">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">
            Detalle de producto
          </p>
          <h2 class="mt-1 truncate text-xl font-bold text-[var(--color-text-base)]">
            {{ preview?.name ?? '—' }}
          </h2>
          <span class="mt-2 inline-flex rounded-full bg-[#EEF3FA] px-3 py-1 text-xs font-semibold text-[var(--color-text-base)]">
            {{ preview?.category_name ?? '—' }}
          </span>
        </div>
        <button
          class="mt-0.5 flex-shrink-0 rounded-2xl border border-[var(--color-border)] p-2 text-[var(--color-text-muted)] transition hover:bg-[#F7FAFF]"
          @click="$emit('update:modelValue', false)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Acciones admin -->
      <div v-if="isAdmin" class="border-b border-[var(--color-border)] px-6 py-3">
        <div class="flex gap-2">
          <button
            class="flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-text-base)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            @click="$emit('edit', preview)"
          >
            ✎ Editar
          </button>
          <button
            v-if="preview?.is_available !== false"
            :disabled="actionLoading"
            class="flex items-center gap-1.5 rounded-xl border border-[#FCA5A5] px-3 py-2 text-xs font-semibold text-[#DC2626] transition hover:bg-[#FEF2F2] disabled:opacity-50"
            @click="deactivate"
          >
            {{ actionLoading ? '...' : '✕ Dar de baja' }}
          </button>
          <template v-else>
            <button
              :disabled="actionLoading"
              class="flex items-center gap-1.5 rounded-xl border border-[#BBF7D0] px-3 py-2 text-xs font-semibold text-[#16A34A] transition hover:bg-[#F0FDF4] disabled:opacity-50"
              @click="restore"
            >
              {{ actionLoading ? '...' : '↩ Reactivar' }}
            </button>
            <button
              :disabled="actionLoading"
              class="flex items-center gap-1.5 rounded-xl border border-[#FCA5A5] px-3 py-2 text-xs font-semibold text-[#DC2626] transition hover:bg-[#FEF2F2] disabled:opacity-50"
              @click="confirmingDestroy = true"
            >
              🗑 Eliminar
            </button>
          </template>
        </div>

        <!-- Confirmación de eliminación definitiva -->
        <div v-if="confirmingDestroy" class="mt-3 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3">
          <p class="text-xs font-semibold text-[#DC2626]">Esta acción es irreversible. ¿Eliminar definitivamente este producto?</p>
          <div class="mt-2 flex gap-2">
            <button
              :disabled="actionLoading"
              class="rounded-lg bg-[#DC2626] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#B91C1C] disabled:opacity-50"
              @click="destroyConfirmed"
            >
              {{ actionLoading ? '...' : 'Sí, eliminar' }}
            </button>
            <button
              :disabled="actionLoading"
              class="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-base)] transition hover:bg-[#F7FAFF] disabled:opacity-50"
              @click="confirmingDestroy = false"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto px-6 py-6 space-y-6">

        <!-- Loading -->
        <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-[var(--color-text-muted)]">
          <svg class="h-8 w-8 animate-spin text-[var(--color-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p class="text-sm">Cargando detalles...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="rounded-[20px] border border-[#FCA5A5] bg-[#FEF2F2] px-5 py-4 text-sm text-[#DC2626]">
          {{ error }}
        </div>

        <template v-else-if="product">
          <!-- Stock actual -->
          <div class="rounded-[24px] border border-[var(--color-border)] bg-[#FAFBFE] px-5 py-4">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Stock actual</p>

            <div class="mt-2 flex items-center gap-3">
              <span
                class="text-3xl font-bold"
                :class="preview?.low_stock ? 'text-[#DC2626]' : 'text-[var(--color-text-base)]'"
              >
                {{ preview?.total ?? '—' }}
              </span>
              <div>
                <p class="text-sm font-semibold text-[var(--color-text-base)]">unidades</p>
                <span
                  class="mt-0.5 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="preview?.low_stock ? 'bg-[#FEE2E2] text-[#DC2626]' : 'bg-[#DCFCE7] text-[#16A34A]'"
                >
                  {{ preview?.low_stock ? 'Stock crítico' : 'Normal' }}
                </span>
              </div>
            </div>

            <!-- Desglose calculado -->
            <div v-if="stockBreakdown.length" class="mt-4 space-y-2 border-t border-[var(--color-border)] pt-4">
              <div
                v-for="item in stockBreakdown"
                :key="item.label"
                class="flex items-center justify-between"
              >
                <span class="text-xs text-[var(--color-text-muted)]">{{ item.label }}</span>
                <span class="text-sm font-bold text-[var(--color-text-base)]">
                  {{ item.value }} <span class="font-normal text-[var(--color-text-muted)]">{{ item.unit }}</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Packaging hierarchy -->
          <div>
            <p class="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
              Presentación / Embalaje
            </p>

            <div class="space-y-3">

              <!-- BULTO -->
              <div class="rounded-[20px] border border-[var(--color-border)] bg-white px-5 py-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="flex h-7 w-7 items-center justify-center rounded-full bg-[#EAF2FF] text-sm">📦</span>
                    <span class="text-sm font-semibold text-[var(--color-text-base)]">Bulto</span>
                  </div>
                  <span v-if="product.kg_pack" class="text-sm font-semibold text-[var(--color-primary)]">
                    {{ formatDecimal(product.kg_pack) }} kg
                  </span>
                  <span v-else class="text-xs text-[var(--color-text-muted)]">Sin dato</span>
                </div>

                <div v-if="product.unidades_x_pack || product.cajas_x_pack" class="mt-3 flex flex-wrap gap-2">
                  <span v-if="product.unidades_x_pack" class="rounded-full bg-[#EEF3FA] px-3 py-1 text-xs font-semibold text-[var(--color-text-base)]">
                    {{ product.unidades_x_pack }} unidades/bulto
                  </span>
                  <span v-if="product.cajas_x_pack" class="rounded-full bg-[#EEF3FA] px-3 py-1 text-xs font-semibold text-[var(--color-text-base)]">
                    {{ product.cajas_x_pack }} cajas/bulto
                  </span>
                </div>
              </div>

              <!-- Flecha → CAJA (solo si existe nivel de caja) -->
              <template v-if="product.cajas_x_pack">
                <div class="flex items-center gap-2 px-2">
                  <div class="h-px flex-1 border-t border-dashed border-[var(--color-border)]"></div>
                  <svg class="h-4 w-4 flex-shrink-0 text-[var(--color-text-muted)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
                  </svg>
                  <div class="h-px flex-1 border-t border-dashed border-[var(--color-border)]"></div>
                </div>

                <div class="rounded-[20px] border border-[var(--color-border)] bg-white px-5 py-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="flex h-7 w-7 items-center justify-center rounded-full bg-[#F0FDF4] text-sm">🗃️</span>
                      <span class="text-sm font-semibold text-[var(--color-text-base)]">Caja</span>
                    </div>
                    <span v-if="product.kg_caja" class="text-sm font-semibold text-[var(--color-primary)]">
                      {{ formatDecimal(product.kg_caja) }} kg
                    </span>
                    <span v-else class="text-xs text-[var(--color-text-muted)]">Sin dato</span>
                  </div>

                  <div v-if="product.unidades_x_caja" class="mt-3">
                    <span class="rounded-full bg-[#F0FDF4] px-3 py-1 text-xs font-semibold text-[#16A34A]">
                      {{ product.unidades_x_caja }} unidades/caja
                    </span>
                  </div>
                </div>
              </template>

              <!-- Flecha → UNIDAD -->
              <div class="flex items-center gap-2 px-2">
                <div class="h-px flex-1 border-t border-dashed border-[var(--color-border)]"></div>
                <svg class="h-4 w-4 flex-shrink-0 text-[var(--color-text-muted)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
                </svg>
                <div class="h-px flex-1 border-t border-dashed border-[var(--color-border)]"></div>
              </div>

              <div class="rounded-[20px] border border-[var(--color-border)] bg-white px-5 py-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFF7ED] text-sm">🍦</span>
                    <span class="text-sm font-semibold text-[var(--color-text-base)]">Unidad</span>
                  </div>
                  <span v-if="product.kg_unidades" class="text-sm font-semibold text-[var(--color-primary)]">
                    {{ formatDecimal(product.kg_unidades) }} kg
                  </span>
                  <span v-else class="text-xs text-[var(--color-text-muted)]">Sin dato</span>
                </div>
              </div>

            </div>
          </div>

          <!-- Ratios de conversión -->
          <div v-if="conversionRatios.length" class="rounded-[20px] border border-[#EAF2FF] bg-[#F5F9FF] px-5 py-4">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">Ratios de embalaje</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="ratio in conversionRatios"
                :key="ratio"
                class="rounded-full border border-[#C7DEFF] bg-white px-3 py-1 text-xs font-semibold text-[var(--color-primary)]"
              >
                {{ ratio }}
              </span>
            </div>
          </div>

        </template>
      </div>
    </aside>
  </Transition>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { getProductById, deleteProduct, restoreProduct, destroyProduct } from '../../services/ProductService.js'
import { useAuthStore } from '../../stores/authStore.js'
import { useToastStore } from '../../stores/toastStore.js'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  preview: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'edit', 'deactivated', 'restored', 'destroyed'])

const authStore = useAuthStore()
const toast = useToastStore()
const isAdmin = computed(() => authStore.user?.role === 'admin')
const actionLoading = ref(false)
const confirmingDestroy = ref(false)

const deactivate = async () => {
  if (!props.preview?.id) return
  actionLoading.value = true
  try {
    await deleteProduct(props.preview.id)
    toast.add('Producto dado de baja correctamente')
    emit('deactivated')
  } catch {
    toast.add('No se pudo dar de baja el producto', 'error')
  } finally {
    actionLoading.value = false
  }
}

const restore = async () => {
  if (!props.preview?.id) return
  actionLoading.value = true
  try {
    await restoreProduct(props.preview.id)
    toast.add('Producto reactivado correctamente')
    emit('restored')
  } catch {
    toast.add('No se pudo reactivar el producto', 'error')
  } finally {
    actionLoading.value = false
  }
}

const destroyConfirmed = async () => {
  if (!props.preview?.id) return
  actionLoading.value = true
  try {
    await destroyProduct(props.preview.id)
    toast.add('Producto eliminado definitivamente')
    confirmingDestroy.value = false
    emit('destroyed')
    emit('update:modelValue', false)
  } catch {
    toast.add('No se pudo eliminar el producto', 'error')
  } finally {
    actionLoading.value = false
  }
}

const product = ref(null)
const loading = ref(false)
const error = ref(null)

const formatDecimal = (val) => {
  const n = Number(val)
  return isNaN(n) ? '—' : n % 1 === 0 ? n.toString() : n.toFixed(3).replace(/\.?0+$/, '')
}

const stockBreakdown = computed(() => {
  if (!product.value || props.preview?.total == null) return []
  const p = product.value
  const unidades = props.preview.total
  const items = []

  if (p.unidades_x_pack) {
    items.push({ label: 'Equivale en bultos', value: Math.floor(unidades / p.unidades_x_pack), unit: 'bultos' })
  }

  if (p.unidades_x_caja) {
    items.push({ label: 'Equivale en cajas', value: Math.floor(unidades / p.unidades_x_caja), unit: 'cajas' })
  }

  return items
})

const conversionRatios = computed(() => {
  if (!product.value) return []
  const p = product.value
  const items = []
  if (p.unidades_x_pack) items.push(`1 bulto = ${p.unidades_x_pack} unidades`)
  if (p.unidades_x_caja) items.push(`1 caja = ${p.unidades_x_caja} unidades`)
  if (p.cajas_x_pack) items.push(`1 bulto = ${p.cajas_x_pack} cajas`)
  return items
})

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) { confirmingDestroy.value = false; return }
    if (!props.preview?.id) return
    loading.value = true
    error.value = null
    product.value = null
    try {
      product.value = await getProductById(props.preview.id)
    } catch {
      error.value = 'No se pudo cargar el detalle del producto.'
    } finally {
      loading.value = false
    }
  }
)
</script>

<style scoped>
.overlay-enter-active,
.overlay-leave-active { transition: opacity 0.2s ease; }
.overlay-enter-from,
.overlay-leave-to { opacity: 0; }

.drawer-enter-active,
.drawer-leave-active { transition: transform 0.25s ease; }
.drawer-enter-from,
.drawer-leave-to { transform: translateX(100%); }
</style>
