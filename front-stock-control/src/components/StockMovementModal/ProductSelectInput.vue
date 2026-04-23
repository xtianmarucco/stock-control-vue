<template>
  <div class="relative">
    <input
      type="text"
      v-model="query"
      @focus="open = true"
      @input="onInput"
      placeholder="Buscar producto..."
      class="w-full border rounded-lg px-3 py-2 text-sm"
    />

    <ul
      v-if="open && filteredOptions.length > 0"
      class="absolute z-20 mt-1 max-h-48 w-full overflow-auto bg-white border rounded-lg shadow text-sm"
    >
      <li
        v-for="opt in filteredOptions"
        :key="opt.id"
        class="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
        @click="select(opt)"
      >
        <span>{{ opt.name }}</span>
        <span class="text-xs text-gray-500">Stock: {{ opt.total }}</span>
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