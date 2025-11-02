<template>
  <div class="flex flex-row gap-6">
    <div class="flex flex-col w-1/5">
      <CategoryTabs class="w-11/12 space-y-2" :categories="categories" v-model:selected="selectedCategory" />
    </div>
    <div class="flex flex-col flex-1">
      <SearchBar v-model="searchQuery" />
      <ProductsTable :category="selectedCategory" :search="searchQuery" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CategoryTabs from '../components/category-tabs/CategoryTabs.vue'
import SearchBar from '../components/search-bar/SearchBar.vue'
import ProductsTable from '../components/products-table/ProductsTable.vue'
import { getAllCategories } from '../services/ProductService.js'

const categories = ref([])
const selectedCategory = ref(null)
const searchQuery = ref('')

onMounted(async () => {
  categories.value = await getAllCategories()
})
</script>