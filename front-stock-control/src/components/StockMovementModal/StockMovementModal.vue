<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6">
    <div class="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] bg-[var(--color-card)] shadow-[0_30px_60px_rgba(15,35,64,0.18)]">
      <div class="border-b border-[var(--color-border)] px-6 py-5 sm:px-8">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-[var(--color-primary)]">Operación crítica</p>
            <h2 class="mt-1 text-2xl font-bold text-[var(--color-text-base)]">Nuevo movimiento de stock</h2>
            <p class="mt-1 text-sm text-[var(--color-text-muted)]">
              Completá el flujo y validamos stock disponible antes de confirmar.
            </p>
          </div>
          <button
            class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5F7FB] text-[var(--color-text-muted)] transition hover:bg-[#E9EEF8] hover:text-[var(--color-text-base)]"
            @click="$emit('close')"
          >
            ✕
          </button>
        </div>
      </div>

      <div class="border-b border-[var(--color-border)] bg-[#F8FAFD] px-6 py-4 sm:px-8">
        <div class="grid gap-3 sm:grid-cols-3">
          <div
            v-for="(label, index) in stepsLabels"
            :key="label"
            class="rounded-2xl border px-4 py-3 transition"
            :class="index === currentStep
              ? 'border-[var(--color-primary)] bg-white shadow-[var(--shadow-card)]'
              : index < currentStep
              ? 'border-transparent bg-[#EAF2FF]'
              : 'border-transparent bg-white/70'"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-semibold"
                :class="index === currentStep
                  ? 'bg-[var(--color-primary)] text-white'
                  : index < currentStep
                  ? 'bg-[#D8E7FF] text-[var(--color-primary)]'
                  : 'bg-[#EEF3FA] text-[var(--color-text-muted)]'"
              >
                {{ index + 1 }}
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Paso {{ index + 1 }}</p>
                <p class="text-sm font-semibold text-[var(--color-text-base)]">{{ label }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
        <div v-if="formMessage" class="mb-5 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
          {{ formMessage }}
        </div>

        <MovementTypeStep
          v-if="currentStep === 0"
          v-model:movementType="draft.movement_type"
          v-model:fromBranchId="draft.from_branch_id"
          v-model:toBranchId="draft.to_branch_id"
          v-model:reasonCategoryId="draft.reason_category_id"
          v-model:reason="draft.reason"
          :branches="branches"
          :reason-categories="reasonCategories"
          :loading-reason-categories="loadingReasonCategories"
        />

        <MovementItemsStep
          v-else-if="currentStep === 1"
          v-model:items="draft.items"
          :movement-type="draft.movement_type"
          :products="availableProducts"
          :branch-id="draft.from_branch_id"
          :loading-products="loadingProducts"
        />

        <MovementReviewStep
          v-else
          :draft="draft"
          :branches="branches"
          :reason-categories="reasonCategories"
        />
      </div>

      <div class="flex items-center justify-between gap-3 border-t border-[var(--color-border)] bg-[#F8FAFD] px-6 py-4 sm:px-8">
        <button
          class="rounded-2xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text-base)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="currentStep === 0"
          @click="prevStep"
        >
          ← Atrás
        </button>

        <div class="flex gap-2">
          <button
            v-if="currentStep < stepsLabels.length - 1"
            class="rounded-2xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(20,121,255,0.22)] transition hover:bg-[var(--color-primary-hover)]"
            @click="nextStep"
          >
            Siguiente →
          </button>

          <button
            v-else
            class="rounded-2xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(20,121,255,0.22)] transition hover:bg-[var(--color-primary-hover)] disabled:cursor-wait disabled:opacity-70"
            @click="submit"
            :disabled="submitting"
          >
            {{ submitting ? 'Guardando...' : 'Confirmar movimiento' }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { createStockMovement } from '../../services/MovementsService.js'
import { getStockByBranch } from '../../services/ProductService.js'
import { getReasonCategories } from '../../services/ReasonCategoriesService.js'
import { useToastStore } from '../../stores/toastStore'
import MovementTypeStep from './MovementTypeStep.vue'
import MovementItemsStep from './MovementItemsStep.vue'
import MovementReviewStep from './MovementReviewStep.vue'

const props = defineProps({
  branches: { type: Array, required: true },
  defaultBranchId: { type: Number, required: true }
})

const emit = defineEmits(['close', 'saved'])
const toast = useToastStore()

const stepsLabels = ['Tipo y sucursal', 'Productos', 'Revisión']
const currentStep = ref(0)
const submitting = ref(false)
const loadingProducts = ref(false)
const loadingReasonCategories = ref(false)
const availableProducts = ref([])
const reasonCategories = ref([])
const formMessage = ref('')

const draft = reactive({
  movement_type: null,
  from_branch_id: props.defaultBranchId,
  to_branch_id: null,
  reason_category_id: null,
  reason: '',
  items: []
})

const selectedReasonCategory = computed(() =>
  reasonCategories.value.find(category => category.id === draft.reason_category_id) ?? null
)

const validateStep1 = () => {
  formMessage.value = ''

  if (!draft.movement_type) {
    formMessage.value = 'Seleccioná un tipo de movimiento.'
    return false
  }

  if (draft.movement_type === 'TRANSFER') {
    if (!draft.from_branch_id || !draft.to_branch_id) {
      formMessage.value = 'Seleccioná una sucursal origen y otra destino.'
      return false
    }
    if (draft.from_branch_id === draft.to_branch_id) {
      formMessage.value = 'La sucursal origen y destino deben ser distintas.'
      return false
    }
  } else {
    if (!draft.from_branch_id) {
      formMessage.value = 'Seleccioná la sucursal a la que pertenece el movimiento.'
      return false
    }
  }

  if (draft.movement_type !== 'TRANSFER' && !draft.reason_category_id) {
    formMessage.value = 'Seleccioná un motivo para continuar.'
    return false
  }

  return true
}

const validateStep2 = () => {
  formMessage.value = ''

  if (!draft.items.length) {
    formMessage.value = 'Agregá al menos un producto al movimiento.'
    return false
  }

  for (const item of draft.items) {
    if (!item.product_id) {
      formMessage.value = 'Hay un renglón sin producto seleccionado.'
      return false
    }
    if (!item.quantity_input || item.quantity_input <= 0) {
      formMessage.value = `La cantidad para "${item.product_name || 'el producto'}" debe ser mayor a cero.`
      return false
    }

    if (draft.movement_type === 'TRANSFER' && item.quantity_input > item.available_stock) {
      formMessage.value = `Stock insuficiente para "${item.product_name}". Disponible: ${item.available_stock}, solicitado: ${item.quantity_input}.`
      return false
    }
  }

  return true
}

/* -----------------------------
   STEP CONTROLS 
----------------------------- */

const nextStep = () => {
  if (currentStep.value === 0 && !validateStep1()) return
  if (currentStep.value === 1 && !validateStep2()) return

  if (currentStep.value < stepsLabels.length - 1) {
    formMessage.value = ''
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) currentStep.value--
}

const transformQuantity = (q, movementType) => {
  const val = Math.abs(q || 0)
  if (movementType === 'ADJUSTMENT') return -val
  return val
}

const loadReasonCategories = async () => {
  loadingReasonCategories.value = true
  try {
    reasonCategories.value = await getReasonCategories()
  } catch (err) {
    formMessage.value = err.response?.data?.error?.message || 'No se pudieron cargar los motivos.'
  } finally {
    loadingReasonCategories.value = false
  }
}

const loadProductsForBranch = async (branchId) => {
  if (!branchId) {
    availableProducts.value = []
    return
  }

  loadingProducts.value = true
  try {
    const response = await getStockByBranch(branchId)
    availableProducts.value = response.products
  } catch (err) {
    availableProducts.value = []
    formMessage.value = err.response?.data?.error?.message || 'No se pudo cargar el stock disponible de la sucursal.'
  } finally {
    loadingProducts.value = false
  }
}

const submit = async () => {
  formMessage.value = ''
  submitting.value = true

  try {
    const payload = {
      movement_type: draft.movement_type,
      from_branch_id: draft.from_branch_id,
      to_branch_id: draft.to_branch_id,
      reason_category_id: draft.reason_category_id,
      reason: draft.reason,
      items: draft.items.map(item => ({
        product_id: item.product_id,
        quantity: transformQuantity(item.quantity_input, draft.movement_type)
      }))
    }

    await createStockMovement(payload)
    toast.add('Movimiento registrado correctamente')
    emit('saved')
    emit('close')
  } catch (err) {
    formMessage.value = err.response?.data?.error?.message || 'No se pudo guardar el movimiento.'
    toast.add(formMessage.value, 'error')
  } finally {
    submitting.value = false
  }
}

watch(
  () => draft.from_branch_id,
  async (branchId, previousBranchId) => {
    if (branchId !== previousBranchId) {
      draft.items = []
      formMessage.value = ''
    }

    await loadProductsForBranch(branchId)
  },
  { immediate: true }
)

watch(
  () => draft.movement_type,
  (movementType) => {
    draft.items = []
    formMessage.value = ''

    if (
      !selectedReasonCategory.value ||
      selectedReasonCategory.value.movement_type !== movementType ||
      movementType === 'TRANSFER'
    ) {
      draft.reason_category_id = null
    }
  }
)

onMounted(async () => {
  await loadReasonCategories()
})
</script>
