<!-- src/components/MovementDetailModal/MovementDetailModal.vue -->
<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="close"
  >
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
      <!-- Encabezado -->
      <header class="p-4 border-b flex justify-between items-center">
        <h2 class="text-xl font-semibold">Detalle del Movimiento</h2>
        <button @click="close" class="text-gray-500 hover:text-gray-800">&times;</button>
      </header>

      <!-- Contenido -->
      <div class="p-6 overflow-y-auto">
        <div v-if="loading" class="text-center text-gray-500">Cargando...</div>
        <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>
        <div v-else-if="movement" class="space-y-6">
          <!-- Info General -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p class="text-gray-500">Fecha</p>
              <p class="font-medium">{{ formatDate(movement.created_at) }}</p>
            </div>
            <div>
              <p class="text-gray-500">Tipo</p>
              <p class="font-medium">{{ formatType(movement.movement_type) }}</p>
            </div>
            <div>
              <p class="text-gray-500">Origen</p>
              <p class="font-medium">{{ movement.from_branch_name || '-' }}</p>
            </div>
            <div>
              <p class="text-gray-500">Destino</p>
              <p class="font-medium">{{ movement.to_branch_name || '-' }}</p>
            </div>
            <div class="col-span-2 md:col-span-4">
              <p class="text-gray-500">Motivo</p>
              <p class="font-medium">{{ movement.reason || 'No especificado' }}</p>
            </div>
          </div>

          <!-- Tabla de Productos -->
          <div>
            <h3 class="font-semibold mb-2">Productos Involucrados</h3>
            <div class="border rounded-lg overflow-hidden">
              <table class="min-w-full">
                <thead class="bg-gray-50 text-xs uppercase text-gray-600">
                  <tr>
                    <th class="px-4 py-2 text-left">Producto</th>
                    <th class="px-4 py-2 text-right">Cantidad</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr v-for="item in movement.items" :key="item.product_id">
                    <td class="px-4 py-2">{{ item.product_name }}</td>
                    <td class="px-4 py-2 text-right font-mono">{{ item.quantity }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Pie -->
      <footer class="p-4 border-t bg-gray-50 text-right">
        <button
          @click="close"
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium"
        >
          Cerrar
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getStockMovementById } from '../../services/movementsService'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  movementId: { type: [Number, String], default: null }
})

const emit = defineEmits(['update:modelValue'])

const movement = ref(null)
const loading = ref(false)
const error = ref(null)

const formatDate = (date) => new Date(date).toLocaleDateString('es-AR')
const formatType = (type) =>
  ({ TRANSFER: 'Traslado', ADJUSTMENT: 'Ajuste', INTERNAL: 'Interno' }[type] || type)

const close = () => {
  emit('update:modelValue', false)
}

watch(
  () => props.movementId,
  async (newId) => {
    if (newId && props.modelValue) {
      loading.value = true
      error.value = null
      movement.value = null
      try {
        movement.value = await getStockMovementById(newId)
      } catch (err) {
        error.value = 'No se pudo cargar el detalle del movimiento.'
        console.error(err)
      } finally {
        loading.value = false
      }
    }
  },
  { immediate: true }
)
</script>