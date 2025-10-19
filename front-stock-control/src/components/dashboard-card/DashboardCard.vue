<template>
  <div
    class="rounded-[var(--radius-lg)] p-[var(--spacing-card)] shadow-[var(--shadow-card)] bg-[var(--color-card)] text-[var(--color-text-base)] flex flex-col gap-2"
  >
    <div class="flex items-center justify-between">
      <h2 class="text-[var(--font-size-xl)] font-[var(--font-weight-semibold)] text-[var(--color-primary)]">
        {{ title }}
      </h2>
      <slot name="icon"></slot>
    </div>

    <p class="text-[var(--font-size-2xl)] font-[var(--font-weight-bold)]">
      {{ value }}
    </p>

    <p class="text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
      {{ description }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  value: [String, Number],
  description: String
});
</script>