<!-- src/components/movements/MovementTypeStep.vue -->
<template>
  <div class="flex flex-col gap-6">
    <div>
      <h3 class="mb-3 text-lg font-semibold text-[var(--color-text-base)]">Tipo de movimiento</h3>

      <div class="grid gap-3 md:grid-cols-3">
        <button
          v-for="t in movementTypes"
          :key="t.value"
          class="rounded-[24px] border px-4 py-4 text-left text-sm font-medium transition-all"
          :class="{
            'border-[var(--color-primary)] bg-[#EAF2FF] text-[var(--color-primary)] shadow-[var(--shadow-card)]': movementType === t.value,
            'border-[var(--color-border)] bg-white text-[var(--color-text-base)] hover:border-[#CFE0FF] hover:bg-[#F8FBFF]': movementType !== t.value
          }"
          @click="setMovementType(t.value)"
        >
          <p class="font-semibold">{{ t.label }}</p>
          <p class="mt-1 text-xs opacity-80">{{ t.description }}</p>
        </button>
      </div>
    </div>

    <div class="rounded-[28px] border border-[var(--color-border)] bg-[#FAFBFE] p-5">
      <h3 class="mb-4 text-lg font-semibold text-[var(--color-text-base)]">Sucursal</h3>

      <div v-if="movementType === 'TRANSFER'" class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="mb-2 block text-sm font-medium text-[var(--color-text-base)]">Sucursal origen</label>
          <select
            v-model="localFromBranchId"
            class="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text-base)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[#DCEBFF]"
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

        <div>
          <label class="mb-2 block text-sm font-medium text-[var(--color-text-base)]">Sucursal destino</label>
          <select
            v-model="localToBranchId"
            class="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text-base)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[#DCEBFF]"
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

      <div v-else class="max-w-sm">
        <label class="mb-2 block text-sm font-medium text-[var(--color-text-base)]">Sucursal</label>
        <select
          v-model="localFromBranchId"
          class="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text-base)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[#DCEBFF]"
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

    <div v-if="movementType !== 'TRANSFER'" class="max-w-md">
      <div class="mb-2 flex items-center justify-between gap-3">
        <h3 class="text-lg font-semibold text-[var(--color-text-base)]">Motivo del movimiento</h3>
        <span v-if="loadingReasonCategories" class="text-xs text-[var(--color-text-muted)]">Cargando motivos...</span>
      </div>
      <select
        v-model="localReasonCategoryId"
        class="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text-base)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[#DCEBFF]"
        :disabled="loadingReasonCategories || reasonOptions.length === 0"
      >
        <option :value="null">Seleccionar motivo...</option>
        <option
          v-for="opt in reasonOptions"
          :key="opt.id"
          :value="opt.id"
        >
          {{ opt.label }}
        </option>
      </select>
      <p v-if="!loadingReasonCategories && reasonOptions.length === 0" class="mt-2 text-sm text-[var(--color-text-muted)]">
        No hay motivos configurados para este tipo de movimiento.
      </p>
    </div>

    <div>
      <h3 class="mb-2 text-lg font-semibold text-[var(--color-text-base)]">Descripción</h3>
      <textarea
        v-model="localReason"
        rows="3"
        class="w-full rounded-[24px] border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text-base)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[#DCEBFF]"
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
  reasonCategoryId: Number,
  reason: String,
  branches: Array,
  reasonCategories: { type: Array, default: () => [] },
  loadingReasonCategories: { type: Boolean, default: false }
})

const emit = defineEmits([
  'update:movementType',
  'update:fromBranchId',
  'update:toBranchId',
  'update:reasonCategoryId',
  'update:reason'
])

const localMovementType = ref(props.movementType)
const localFromBranchId = ref(props.fromBranchId)
const localToBranchId = ref(props.toBranchId)
const localReasonCategoryId = ref(props.reasonCategoryId)
const localReason = ref(props.reason)

const movementTypes = [
  { value: 'TRANSFER', label: 'Traslado', description: 'Descuenta stock en origen y acredita en destino.' },
  { value: 'ADJUSTMENT', label: 'Ajuste', description: 'Corrige diferencias o mermas de inventario.' },
  { value: 'INTERNAL', label: 'Interno', description: 'Registra ingresos internos en una sucursal.' }
]

const reasonOptions = computed(() => {
  return props.reasonCategories.filter(category => category.movement_type === localMovementType.value)
})

watch(localMovementType, val => emit('update:movementType', val))
watch(localFromBranchId, val => emit('update:fromBranchId', val))
watch(localToBranchId, val => emit('update:toBranchId', val))
watch(localReasonCategoryId, val => emit('update:reasonCategoryId', val))
watch(localReason, val => emit('update:reason', val))

watch(() => props.movementType, val => { localMovementType.value = val })
watch(() => props.fromBranchId, val => { localFromBranchId.value = val })
watch(() => props.toBranchId, val => { localToBranchId.value = val })
watch(() => props.reasonCategoryId, val => { localReasonCategoryId.value = val })
watch(() => props.reason, val => { localReason.value = val })

const setMovementType = (type) => {
  localMovementType.value = type

  if (type !== 'TRANSFER') {
    localToBranchId.value = null
  }

  if (!reasonOptions.value.some(option => option.id === localReasonCategoryId.value)) {
    localReasonCategoryId.value = null
  }
}
</script>
