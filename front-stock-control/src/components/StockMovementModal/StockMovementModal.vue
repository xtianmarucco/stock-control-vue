<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 flex flex-col gap-4">
      
      <!-- Header -->
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold">Nuevo movimiento de stock</h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">✕</button>
      </div>

      <!-- Stepper -->
      <div class="flex items-center gap-4 text-sm mb-2">
        <div v-for="(label, index) in stepsLabels" :key="index" class="flex items-center gap-2">
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center border"
            :class="currentStep === index
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-300'"
          >
            {{ index + 1 }}
          </div>

          <span :class="currentStep === index ? 'font-semibold text-blue-700' : 'text-gray-500'">
            {{ label }}
          </span>

          <div v-if="index < stepsLabels.length - 1" class="w-8 h-px bg-gray-300"></div>
        </div>
      </div>

      <!-- Contenido del step -->
      <div class="flex-1 mt-2">

        <!-- Paso 1 -->
        <MovementTypeStep
          v-if="currentStep === 0"
          v-model:movementType="draft.movement_type"
          v-model:fromBranchId="draft.from_branch_id"
          v-model:toBranchId="draft.to_branch_id"
          v-model:reasonCategory="draft.reason_category"
          v-model:reason="draft.reason"
          :branches="branches"
        />

        <!-- Paso 2 -->
        <MovementItemsStep
          v-else-if="currentStep === 1"
          v-model:items="draft.items"
          :movement-type="draft.movement_type"
          :reason-category="draft.reason_category"
          :products="products"
          :branch-id="draft.from_branch_id"
        />

        <!-- Paso 3 -->
        <MovementReviewStep
          v-else
          :draft="draft"
          :branches="branches"
        />
      </div>

      <!-- Footer Botones -->
      <div class="flex justify-between pt-4 border-t mt-2">

        <button
          class="px-4 py-2 rounded-lg border text-sm"
          :disabled="currentStep === 0"
          @click="prevStep"
        >
          ← Atrás
        </button>

        <div class="flex gap-2">
          
          <!-- Botón siguiente -->
          <button
            v-if="currentStep < stepsLabels.length - 1"
            class="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
            @click="nextStep"
          >
            Siguiente →
          </button>

          <!-- Botón submit -->
          <button
            v-else
            class="px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700"
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
import { reactive, ref } from 'vue'
import { createStockMovement } from '../../services/movementsService.js'
import MovementTypeStep from './MovementTypeStep.vue'
import MovementItemsStep from './MovementItemsStep.vue'
import MovementReviewStep from './MovementReviewStep.vue'

const props = defineProps({
  branches: { type: Array, required: true },
  products: { type: Array, required: true },
  defaultBranchId: { type: Number, required: true }
})

const emit = defineEmits(['close', 'saved'])

const stepsLabels = ['Tipo y sucursal', 'Productos', 'Revisión']
const currentStep = ref(0)
const submitting = ref(false)

const draft = reactive({
  movement_type: null,
  from_branch_id: props.defaultBranchId,
  to_branch_id: null,
  reason_category: null,
  reason: '',
  items: []
})

/* -----------------------------
   VALIDACIONES 
----------------------------- */

const validateStep1 = () => {
  if (!draft.movement_type) {
    alert('Debes seleccionar un tipo de movimiento.')
    return false
  }

  if (draft.movement_type === 'TRANSFER') {
    if (!draft.from_branch_id || !draft.to_branch_id) {
      alert('Debes seleccionar sucursal origen y destino.')
      return false
    }
    if (draft.from_branch_id === draft.to_branch_id) {
      alert('La sucursal origen y destino deben ser distintas.')
      return false
    }
  } else {
    if (!draft.from_branch_id) {
      alert('Debes seleccionar la sucursal para este movimiento.')
      return false
    }
  }

  if (['ADJUSTMENT', 'INTERNAL'].includes(draft.movement_type)) {
    if (!draft.reason_category) {
      alert('Debes seleccionar un motivo.')
      return false
    }
  }

  return true
}

const validateStep2 = () => {
  if (!draft.items.length) {
    alert('Debes agregar al menos un producto.')
    return false
  }

  for (const item of draft.items) {
    if (!item.product_id) {
      alert('Hay un producto sin seleccionar.')
      return false
    }
    if (!item.quantity_input || item.quantity_input <= 0) {
      alert(`Cantidad inválida para "${item.product_name}".`)
      return false
    }

    if (draft.movement_type === 'TRANSFER' && item.quantity_input > item.available_stock) {
      alert(
        `Stock insuficiente para "${item.product_name}". ` +
        `Disponible: ${item.available_stock}, solicitado: ${item.quantity_input}`
      )
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
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) currentStep.value--
}

/* -----------------------------
   SUBMIT 
----------------------------- */

const transformQuantity = (q, movementType) => {
  const val = Math.abs(q || 0)
  if (movementType === 'ADJUSTMENT') return -val
  return val
}

const submit = async () => {
  submitting.value = true

  try {
    const payload = {
      movement_type: draft.movement_type,
      from_branch_id: draft.from_branch_id,
      to_branch_id: draft.to_branch_id,
      reason_category: draft.reason_category,
      reason: draft.reason,
      items: draft.items.map(item => ({
        product_id: item.product_id,
        quantity: transformQuantity(item.quantity_input, draft.movement_type)
      }))
    }

    await createStockMovement(payload)
    alert('Movimiento guardado con éxito.')

    emit('saved')
    emit('close')
  } catch (err) {
    console.error('❌ Error al guardar movimiento:', err)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* Podés agregar estilos si querés */
</style>