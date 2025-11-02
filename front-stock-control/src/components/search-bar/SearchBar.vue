<template>
  <div class="relative w-full md:w-72">
    <input
      type="text"
      v-model="model"
      placeholder="Buscar producto..."
      class="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
    />
    <svg
      class="absolute right-3 top-2.5 text-gray-400"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
      />
    </svg>
  </div>
</template>

<script setup>
const model = defineModel()
</script>