<template>
  <div>
    <RouterLink
      v-if="to"
      :to="to"
      custom
      v-slot="{ navigate, href, isActive: linkIsActive }"
    >
      <a
        :href="href"
        @click="navigate"
        :class="linkClasses(active ?? linkIsActive)"
      >
        <i :class="`i-lucide-${icon} text-lg`"></i>
        <span class="text-sm font-medium">{{ label }}</span>
      </a>
    </RouterLink>

    <button
      v-else
      type="button"
      :class="linkClasses(active ?? false)"
      @click="$emit('toggle')"
    >
      <i :class="`i-lucide-${icon} text-lg`"></i>
      <span class="text-sm font-medium flex-1 text-left">{{ label }}</span>
      <i
        v-if="hasDropdown"
        :class="[
          'i-lucide-chevron-down text-sm transition-transform duration-200',
          { 'rotate-180': open }
        ]"
      ></i>
    </button>

    <div
      v-if="hasDropdown && open"
      class="flex flex-col gap-1 mt-1 pl-9"
    >
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed, useSlots } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: undefined
  },
  to: {
    type: [String, Object],
    default: null
  },
  open: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle'])

const baseClasses =
  'flex items-center gap-3 px-3 py-2 rounded-md transition-all w-full text-left'
const activeClasses = 'bg-[var(--color-primary)] text-white shadow-sm'
const inactiveClasses =
  'hover:bg-gray-100 text-[var(--color-text-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]'

const linkClasses = (isActive) => [
  baseClasses,
  isActive ? activeClasses : inactiveClasses
]

const slots = useSlots()
const hasDropdown = computed(() => !!slots.default)
</script>

<style scoped>
@import url('https://unpkg.com/lucide-static@latest/icons.css');
</style>
