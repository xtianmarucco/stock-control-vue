<template>
  <header class="flex items-center justify-between px-6 h-60 bg-[var(--color-card)] text-[var(--color-text-base)] shadow-sm">
    <!-- Logo e ítem principal -->
    <div class="flex items-center gap-4">
      <!-- <img src="/logo.svg" alt="Logo" class="w-8 h-8" /> -->
      
      <div class="hidden md:flex items-center gap-6 ml-10">
        <a href="#" class="text-sm hover:text-[var(--color-primary)]">link
          
        </a>
        <a href="#" class="text-sm hover:text-[var(--color-primary)]">link
          
        </a>
        <a href="#" class="text-sm hover:text-[var(--color-primary)]">link
          
        </a>
        <a href="#" class="text-sm hover:text-[var(--color-primary)]">link
          
        </a>
      </div>
    </div>

    <!-- Íconos lado derecho -->
    <div class="flex items-center gap-4">
      <!-- <button><i class="i-lucide-moon text-lg"></i></button>
      <button><span class="text-sm">🇬🇧</span></button> -->
      <!-- <button class="relative">
        <i class="i-lucide-bell text-lg"></i>
        <span class="absolute -top-1 -right-1 bg-[var(--color-primary)] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">•</span>
      </button> -->
      <button class="relative">
        <i class="i-lucide-shopping-cart text-lg"></i>
        <span class="absolute -top-1 -right-1 bg-[var(--color-danger)] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">0</span>
      </button>
      <img src="https://i.pravatar.cc/40?u=usuario" alt="Avatar" class="w-8 h-8 rounded-full" />
    </div>
  </header>
</template>

<script setup>
// Sin lógica por ahora
</script>

<style scoped>
/* Para íconos, podés usar lucide o Heroicons. Aquí usamos "i-lucide-*" como ejemplo */
@import url('https://unpkg.com/lucide-static@latest/icons.css');
</style>