<template>
  <div class="flex gap-6 p-6 bg-gray-50 min-h-screen">
    <!-- COLUMNA IZQUIERDA: Categorías -->
    <aside class="w-64 flex-shrink-0">
      <h2 class="text-lg font-semibold mb-3">Categorías</h2>

      <div class="flex flex-col gap-2">
        <button
          class="w-full py-2 px-3 rounded-lg border text-sm font-medium transition-all duration-150"
          :class="{
            'bg-blue-600 text-white': selectedCategory === null,
            'bg-white hover:bg-gray-100 text-gray-800 border-gray-300': selectedCategory !== null
          }"
          @click="selectCategory(null)"
        >
          Todos
        </button>

        <button
          v-for="cat in categories"
          :key="cat"
          class="w-full py-2 px-3 rounded-lg border text-sm font-medium transition-all duration-150 text-left truncate"
          :class="{
            'bg-blue-600 text-white': selectedCategory === cat,
            'bg-white hover:bg-gray-100 text-gray-800 border-gray-300': selectedCategory !== cat
          }"
          @click="selectCategory(cat)"
        >
          {{ cat }}
        </button>
      </div>
    </aside>

    <!-- COLUMNA DERECHA: Tabla -->
    <section class="flex-1 bg-white rounded-xl shadow p-6">
      <!-- ✅ Cabecera dinámica -->
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-semibold">
          Gestión de Productos
          <span v-if="branchName" class="text-blue-600 font-normal text-lg">
            — {{ branchName }}
          </span>
        </h2>
      </div>

      <!-- Barra de búsqueda -->
      <div class="flex items-center mb-4">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Buscar producto..."
          class="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:ring-blue-100 outline-none"
        />
      </div>

      <!-- Tabla -->
      <div class="overflow-x-auto rounded-lg border border-gray-200">
        <table class="w-full text-left text-sm">
          <thead class="bg-gray-100 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 font-medium text-gray-700 uppercase">Producto</th>
              <th class="px-4 py-3 font-medium text-gray-700 uppercase">Categoría</th>
              <th class="px-4 py-3 font-medium text-gray-700 uppercase text-right">Stock Total</th>
            </tr>
          </thead>

          <tbody v-if="filteredProducts.length > 0">
            <tr
              v-for="prod in filteredProducts"
              :key="prod.id"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3 text-gray-800">{{ prod.name }}</td>
              <td class="px-4 py-3 text-gray-600">{{ prod.category_name }}</td>
              <td class="px-4 py-3 text-right font-semibold text-gray-900">{{ prod.total }}</td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr>
              <td colspan="3" class="text-center py-6 text-gray-500">
                No se encontraron productos
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, computed as c } from 'vue'
import { useRoute } from 'vue-router'
import { getStockByBranch } from '../services/ProductService.js'
import { getStockSummaryByCategory } from '../services/stockService.js'
import { getBranchById } from '../services/BranchService.js' // ✅ Nuevo servicio

const route = useRoute()

// ✅ branchId reactivo
const branchId = c(() => Number(route.params.branchId))

// 🔄 Estados
const branchName = ref('')
const products = ref([])
const categories = ref([])
const selectedCategory = ref(null)
const searchTerm = ref('')
const loading = ref(false)

// 🚀 Cargar nombre de la branch
const fetchBranchName = async () => {
  try {
    const data = await getBranchById(branchId.value)
    branchName.value = data.name
  } catch (err) {
    console.error('❌ Error fetching branch name:', err)
    branchName.value = ''
  }
}

// 🚀 Cargar productos del branch
const fetchProducts = async () => {
  loading.value = true
  try {
    const response = await getStockByBranch(branchId.value, selectedCategory.value)
    branchName.value = response.branch.name       // ✅ acá obtenés el nombre
    products.value = response.products
  } catch (err) {
    console.error('❌ Error fetching products:', err)
    products.value = []
  } finally {
    loading.value = false
  }
}

// 🚀 Cargar categorías del branch
const fetchCategories = async () => {
  try {
    const data = await getStockSummaryByCategory(branchId.value)
    categories.value = data.map(item => item.category)
  } catch (err) {
    console.error('❌ Error fetching categories:', err)
    categories.value = []
  }
}

// 🔍 Filtro de búsqueda
const filteredProducts = computed(() => {
  if (!searchTerm.value) return products.value
  const query = searchTerm.value.toLowerCase()
  return products.value.filter(p => p.name.toLowerCase().includes(query))
})

// 🖱️ Seleccionar categoría
const selectCategory = (cat) => {
  selectedCategory.value = cat
}

// 👀 Watchers
watch([selectedCategory], fetchProducts)

// ✅ Reaccionar a cambios de branchId
watch(branchId, async (newVal, oldVal) => {
  if (newVal !== oldVal) {
    console.log('🔁 Branch changed:', newVal)
    await Promise.all([fetchBranchName(), fetchCategories(), fetchProducts()])
  }
})

// 🧠 Montaje inicial
onMounted(async () => {
  await Promise.all([fetchBranchName(), fetchCategories(), fetchProducts()])
})
</script>