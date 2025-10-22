<template>
  <a
    href="#"
    :class="[
      'flex items-center gap-3 px-3 py-2 rounded-md transition-all',
      active
        ? 'bg-[var(--color-primary)] text-white shadow-sm'
        : 'hover:bg-gray-100 text-[var(--color-text-muted)]'
    ]"
  >
    <i :class="`i-lucide-${icon} text-lg`"></i>
    <span class="text-sm font-medium">{{ label }}</span>
  </a>
</template>

<script setup>
defineProps({
  icon: String,
  label: String,
  active: Boolean
});
</script>

<style scoped>
@import url('https://unpkg.com/lucide-static@latest/icons.css');
</style>
