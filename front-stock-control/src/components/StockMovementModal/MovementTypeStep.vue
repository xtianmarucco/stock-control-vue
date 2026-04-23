<!-- src/components/movements/MovementTypeStep.vue -->
<template>
  <div class="flex flex-col gap-6">

    <!-- Selección de tipo de movimiento -->
    <div>
      <h3 class="font-semibold text-lg mb-2">Tipo de movimiento</h3>

      <div class="grid grid-cols-3 gap-3">
        <button
          v-for="t in movementTypes"
          :key="t.value"
          class="p-3 border rounded-lg text-sm font-medium transition-all"
          :class="{
            'bg-blue-600 text-white border-blue-600': movementType === t.value,
            'bg-white text-gray-800 border-gray-300 hover:bg-gray-100': movementType !== t.value
          }"
          @click="setMovementType(t.value)"
        >
          {{ t.label }}
        </button>
      </div>
    </div>

    <!-- Selección de sucursal/es -->
    <div>
      <h3 class="font-semibold text-lg mb-2">Sucursal</h3>

      <!-- TRANSFER → origen + destino -->
      <div v-if="movementType === 'TRANSFER'" class="grid grid-cols-2 gap-4">

        <!-- Origen -->
        <div>
          <label class="text-sm text-gray-600 mb-1 block">Sucursal origen</label>
          <select
            v-model="localFromBranchId"
            class="border rounded-lg w-full px-3 py-2"
          >
            <option :value="null">Seleccionar...</option>
            <option
              v-for="b in branches"
              :key="b.id"
              :value="b.id"
            >
              {{ b.name }}
            </option>
          </select>
        </div>

        <!-- Destino -->
        <div>
          <label class="text-sm text-gray-600 mb-1 block">Sucursal destino</label>
          <select
            v-model="localToBranchId"
            class="border rounded-lg w-full px-3 py-2"
          >
            <option :value="null">Seleccionar...</option>
            <option
              v-for="b in branches"
              :key="b.id"
              :value="b.id"
              :disabled="b.id === localFromBranchId"
            >
              {{ b.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- ADJUSTMENT / INTERNAL → una sola sucursal -->
      <div v-else class="w-64">
        <label class="text-sm text-gray-600 mb-1 block">Sucursal</label>
        <select
          v-model="localFromBranchId"
          class="border rounded-lg w-full px-3 py-2"
        >
          <option :value="null">Seleccionar...</option>
          <option
            v-for="b in branches"
            :key="b.id"
            :value="b.id"
          >
            {{ b.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Motivo (reason_category), depende del movimiento -->
    <div v-if="reasonOptions.length > 0">
      <h3 class="font-semibold text-lg mb-2">Motivo del movimiento</h3>
      <select
        v-model="localReasonCategory"
        class="border rounded-lg px-3 py-2 w-72"
      >
        <option :value="null">Seleccionar motivo...</option>
        <option
          v-for="opt in reasonOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>
    </div>

    <!-- Descripción libre -->
    <div>
      <h3 class="font-semibold text-lg mb-2">Descripción (opcional)</h3>
      <textarea
        v-model="localReason"
        rows="3"
        class="border rounded-lg w-full px-3 py-2"
        placeholder="Describe brevemente el motivo..."
      ></textarea>
    </div>

  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  movementType: String,
  fromBranchId: Number,
  toBranchId: Number,
  reasonCategory: String,
  reason: String,
  branches: Array
})

const emit = defineEmits([
  'update:movementType',
  'update:fromBranchId',
  'update:toBranchId',
  'update:reasonCategory',
  'update:reason'
])

// -----------------------------
// ESTADOS LOCALES
// -----------------------------
const localMovementType = ref(props.movementType)
const localFromBranchId = ref(props.fromBranchId)
const localToBranchId = ref(props.toBranchId)
const localReasonCategory = ref(props.reasonCategory)
const localReason = ref(props.reason)

// -----------------------------
// TIPOS DE MOVIMIENTO
// -----------------------------
const movementTypes = [
  { value: 'TRANSFER', label: 'Traslado' },
  { value: 'ADJUSTMENT', label: 'Ajuste' },
  { value: 'INTERNAL', label: 'Interno' }
]

// -----------------------------
// OPCIONES DE MOTIVO
// -----------------------------
const reasonOptions = computed(() => {
  if (localMovementType.value === 'ADJUSTMENT') {
    return [
      { value: 'EXPIRED', label: 'Vencido' },
      { value: 'BROKEN', label: 'Roto' },
      { value: 'BOX_FINISHED', label: 'Caja terminada' }
    ]
  }

  if (localMovementType.value === 'INTERNAL') {
    return [
      { value: 'SUPPLIER_UNLOAD', label: 'Descarga proveedor' },
      { value: 'OTHER_INCOME', label: 'Otros ingresos' }
    ]
  }

  // TRANSFER → sin motivos
  return []
})

// -----------------------------
// EVENTOS → sincronicemos con el padre
// -----------------------------
watch(localMovementType, val => emit('update:movementType', val))
watch(localFromBranchId, val => emit('update:fromBranchId', val))
watch(localToBranchId, val => emit('update:toBranchId', val))
watch(localReasonCategory, val => emit('update:reasonCategory', val))
watch(localReason, val => emit('update:reason', val))

// Cuando cambia el tipo de movimiento → limpiar campos no válidos
const setMovementType = (type) => {
  localMovementType.value = type

  // Reset automático según reglas
  if (type !== 'TRANSFER') {
    localToBranchId.value = null
  }

  if (type === 'TRANSFER') {
    localReasonCategory.value = null
  }
}
</script>