<template>
  <div
    class="flex h-screen bg-[var(--color-background)] text-[var(--color-text-base)]"
  >
    <!-- Sidebar -->
    <Sidebar class="w-[var(--width-sidebar)] shrink-0" />

    <!-- Contenido principal -->
    <div class="flex flex-col flex-1 overflow-hidden">
      <!-- Navbar superior -->
      <Navbar
        class="h-[var(--height-navbar)] border-b border-[var(--color-border)]"
      />

      <!-- Contenido scrollable -->
      <main class="flex-1 overflow-y-auto p-[var(--spacing-section)]">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import Navbar from "../components/navbar/Navbar.vue";
import Sidebar from "../components/sidebar/Sidebar.vue";
</script>
