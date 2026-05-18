<template>
  <div class="relative">
    <input
      type="text"
      v-model="query"
      @focus="open = true"
      @input="onInput"
      placeholder="Buscar producto..."
      class="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text-base)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[#DCEBFF]"
    />

    <ul
      v-if="open && filteredOptions.length > 0"
      class="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-[24px] border border-[var(--color-border)] bg-white p-2 shadow-[0_20px_40px_rgba(15,35,64,0.12)] text-sm"
    >
      <li
        v-for="opt in filteredOptions"
        :key="opt.id"
        class="flex cursor-pointer items-center justify-between rounded-2xl px-3 py-3 transition hover:bg-[#F5F8FF]"
        @click="select(opt)"
      >
        <span class="text-[var(--color-text-base)]">{{ opt.name }}</span>
        <span class="text-xs font-medium text-[var(--color-text-muted)]">Stock: {{ opt.total }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  options: { type: Array, required: true }, // [{ id, name, total }]
  modelValue: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'select'])

const query = ref('')
const open = ref(false)

const filteredOptions = computed(() => {
  if (!query.value) return props.options.slice(0, 20)
  const q = query.value.toLowerCase()
  return props.options
    .filter(p => p.name.toLowerCase().includes(q))
    .slice(0, 20)
})

const select = (opt) => {
  emit('update:modelValue', opt)
  emit('select', opt)
  query.value = opt.name
  open.value = false
}

const onInput = () => {
  open.value = true
}

// si desde fuera cambian el producto, actualizamos el texto
watch(
  () => props.modelValue,
  (val) => {
    if (val) query.value = val.name
  },
  { immediate: true }
)
</script>
