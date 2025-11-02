<template>
  <div class="overflow-x-auto bg-white rounded-lg shadow mt-4">
    <table class="min-w-full border-collapse text-sm">
      <thead class="bg-gray-50 text-gray-600 uppercase text-xs">
        <tr>
          <th class="px-6 py-3 text-left">Producto</th>
          <th class="px-6 py-3 text-left">Categoría</th>
          <th class="px-6 py-3 text-right">Stock total</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="product in filteredProducts"
          :key="product.id"
          class="border-t hover:bg-gray-50 transition-colors"
        >
          <td class="px-6 py-3 font-medium text-gray-800">
            {{ product.name }}
          </td>
          <td class="px-6 py-3">{{ product.category_name || product.category_id }}</td>
          <td class="px-6 py-3 text-right font-semibold text-gray-700">
            {{ product.total_stock ?? product.total ?? 0 }}
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="loading" class="text-center py-4 text-gray-500">Cargando...</div>
    <div v-else-if="filteredProducts.length === 0" class="text-center py-4 text-gray-500">
      No se encontraron productos
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { getProductsWithStock, getProductsByCategory } from '../../services/ProductService'

const props = defineProps({
  category: String,
  search: String
})

const products = ref([])
const loading = ref(true)

const fetchProducts = async () => {
  loading.value = true
  try {
    products.value = props.category
      ? await getProductsByCategory(props.category)
      : await getProductsWithStock()
  } catch (err) {
    console.error('Error fetching products:', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchProducts)
watch(() => props.category, fetchProducts)

// Filtro por texto
const filteredProducts = computed(() => {
  if (!props.search) return products.value
  return products.value.filter(p =>
    p.name.toLowerCase().includes(props.search.toLowerCase())
  )
})
</script>
