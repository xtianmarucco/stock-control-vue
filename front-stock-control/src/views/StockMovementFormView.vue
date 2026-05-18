<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-[#1479FF]">Operación crítica</p>
        <h1 class="text-xl font-bold text-[#193B68] mt-1">Nuevo movimiento de stock</h1>
        <p class="text-sm text-gray-400 mt-0.5">Completá el flujo y validamos stock disponible antes de confirmar.</p>
      </div>
      <button
        class="border border-gray-200 text-[#193B68] font-medium px-5 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors"
        @click="cancel"
      >
        ← Cancelar
      </button>
    </div>

    <!-- Stepper -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
      <div class="grid gap-3 sm:grid-cols-3">
        <div
          v-for="(label, index) in stepsLabels"
          :key="label"
          class="rounded-2xl border px-4 py-3 transition"
          :class="index === currentStep
            ? 'border-[#1479FF] bg-white shadow-sm'
            : index < currentStep
            ? 'border-transparent bg-[#EAF2FF]'
            : 'border-transparent bg-gray-50'"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-semibold"
              :class="index === currentStep
                ? 'bg-[#1479FF] text-white'
                : index < currentStep
                ? 'bg-[#D8E7FF] text-[#1479FF]'
                : 'bg-[#EEF3FA] text-gray-400'"
            >
              {{ index + 1 }}
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-gray-400">Paso {{ index + 1 }}</p>
              <p class="text-sm font-semibold text-[#193B68]">{{ label }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div
      v-if="formMessage"
      class="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]"
    >
      {{ formMessage }}
    </div>

    <!-- Form content -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-6">
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

    <!-- Navigation -->
    <div class="flex items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4">
      <button
        class="rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-[#193B68] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="currentStep === 0"
        @click="prevStep"
      >
        ← Atrás
      </button>

      <div class="flex gap-2">
        <button
          v-if="currentStep < stepsLabels.length - 1"
          class="rounded-2xl bg-[#1479FF] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(20,121,255,0.22)] transition hover:bg-[#0f66e0]"
          @click="nextStep"
        >
          Siguiente →
        </button>

        <button
          v-else
          class="rounded-2xl bg-[#1479FF] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(20,121,255,0.22)] transition hover:bg-[#0f66e0] disabled:cursor-wait disabled:opacity-70"
          :disabled="submitting"
          @click="submit"
        >
          {{ submitting ? 'Guardando...' : 'Confirmar movimiento' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { createStockMovement } from '../services/MovementsService.js'
import { getStockByBranch } from '../services/ProductService.js'
import { getReasonCategories } from '../services/ReasonCategoriesService.js'
import { getBranches } from '../services/BranchService.js'
import { useToastStore } from '../stores/toastStore'
import MovementTypeStep from '../components/StockMovementModal/MovementTypeStep.vue'
import MovementItemsStep from '../components/StockMovementModal/MovementItemsStep.vue'
import MovementReviewStep from '../components/StockMovementModal/MovementReviewStep.vue'

const router = useRouter()
const toast = useToastStore()

const stepsLabels = ['Tipo y sucursal', 'Productos', 'Revisión']
const currentStep = ref(0)
const submitting = ref(false)
const loadingProducts = ref(false)
const loadingReasonCategories = ref(false)
const availableProducts = ref([])
const reasonCategories = ref([])
const branches = ref([])
const formMessage = ref('')

const draft = reactive({
  movement_type: null,
  from_branch_id: null,
  to_branch_id: null,
  reason_category_id: null,
  reason: '',
  items: []
})

const selectedReasonCategory = computed(() =>
  reasonCategories.value.find(c => c.id === draft.reason_category_id) ?? null
)

const cancel = () => router.push('/movements')

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

const toUnidades = (item) => {
  const q = item.quantity_input
  if (!q || q <= 0) return null
  const unit = item.quantity_unit ?? 'UNIDAD'
  if (unit === 'UNIDAD') return q
  if (unit === 'CAJA') return item.unidades_x_caja ? q * item.unidades_x_caja : null
  if (unit === 'BULTO') return item.unidades_x_pack ? q * item.unidades_x_pack : null
  return null
}

const unitLabel = (unit) => ({ BULTO: 'bultos', CAJA: 'cajas', UNIDAD: 'unidades' }[unit] ?? 'unidades')

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

    const unidades = toUnidades(item)
    if (unidades === null) {
      formMessage.value = `No se pudo convertir la cantidad de "${item.product_name}" a unidades. Verificá los datos del producto.`
      return false
    }

    if (draft.movement_type === 'TRANSFER' && unidades > item.available_stock) {
      formMessage.value = `Stock insuficiente para "${item.product_name}". Disponible: ${item.available_stock} unidades, solicitado: ${unidades} unidades (${item.quantity_input} ${unitLabel(item.quantity_unit)}).`
      return false
    }
  }

  return true
}

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
    formMessage.value = err.response?.data?.error?.message || 'No se pudo cargar el stock disponible.'
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
        quantity: transformQuantity(toUnidades(item), draft.movement_type)
      }))
    }

    await createStockMovement(payload)
    toast.add('Movimiento registrado correctamente')
    router.push('/movements')
  } catch (err) {
    formMessage.value = err.response?.data?.error?.message || 'No se pudo guardar el movimiento.'
    toast.add(formMessage.value, 'error')
  } finally {
    submitting.value = false
  }
}

watch(
  () => draft.from_branch_id,
  async (branchId, prev) => {
    if (branchId !== prev) {
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
  const [fetchedBranches] = await Promise.all([
    getBranches(),
    loadReasonCategories()
  ])
  branches.value = fetchedBranches
  if (fetchedBranches.length) {
    draft.from_branch_id = fetchedBranches[0].id
  }
})
</script>
