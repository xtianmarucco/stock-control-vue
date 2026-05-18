<template>
  <div class="flex flex-wrap gap-2">
    <button
      @click="$emit('update:selected', null)"
      class="px-4 py-2 rounded-lg border font-medium transition-all"
      :class="!selected ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'"
    >
      Todos
    </button>

    <button
      v-for="cat in categories"
      :key="cat"
      @click="$emit('update:selected', cat)"
      class="px-4 py-2 rounded-lg border font-medium transition-all"
      :class="cat === selected ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'"
    >
      {{ cat }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  categories: Array,
  selected: String
})
</script>