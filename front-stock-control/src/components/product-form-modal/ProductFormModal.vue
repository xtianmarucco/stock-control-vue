<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6"
    @click.self="close"
  >
    <div class="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[32px] bg-[var(--color-card)] shadow-[0_30px_60px_rgba(15,35,64,0.18)]">

      <!-- Header -->
      <header class="border-b border-[var(--color-border)] px-6 py-5 sm:px-8">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-[var(--color-primary)]">
              {{ isEditing ? 'Editar producto' : 'Nuevo producto' }}
            </p>
            <h2 class="mt-1 text-2xl font-bold text-[var(--color-text-base)]">
              {{ isEditing ? form.name || '—' : 'Agregar al catálogo' }}
            </h2>
          </div>
          <button
            @click="close"
            class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5F7FB] text-[var(--color-text-muted)] transition hover:bg-[#E9EEF8] hover:text-[var(--color-text-base)]"
          >✕</button>
        </div>
      </header>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto px-6 py-6 sm:px-8 space-y-6">

        <!-- Error -->
        <div
          v-if="errorMsg"
          class="rounded-[20px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]"
        >
          {{ errorMsg }}
        </div>

        <!-- Sección 1: Información básica -->
        <section class="space-y-4">
          <h3 class="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
            Información básica
          </h3>

          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-[var(--color-text-base)]">
              Nombre <span class="text-[#DC2626]">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Ej: BOMBON CROCANTE X 6 X 8"
              class="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-text-base)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[#DCEBFF]"
              :class="{ 'border-[#FCA5A5]': errors.name }"
            />
            <p v-if="errors.name" class="text-xs text-[#DC2626]">{{ errors.name }}</p>
          </div>

          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-[var(--color-text-base)]">
              Categoría <span class="text-[#DC2626]">*</span>
            </label>
            <input
              v-model="form.category_name"
              type="text"
              list="product-categories"
              placeholder="Seleccioná o escribí una nueva..."
              class="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-text-base)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[#DCEBFF]"
              :class="{ 'border-[#FCA5A5]': errors.category_name }"
            />
            <datalist id="product-categories">
              <option v-for="cat in categories" :key="cat" :value="cat" />
            </datalist>
            <p v-if="errors.category_name" class="text-xs text-[#DC2626]">{{ errors.category_name }}</p>
          </div>
        </section>

        <!-- Sección 2: Estructura de embalaje -->
        <section class="space-y-4">
          <h3 class="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
            Estructura de embalaje
          </h3>

          <!-- Toggle contenedor intermedio -->
          <div class="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[#FAFBFE] px-4 py-3">
            <div>
              <p class="text-sm font-semibold text-[var(--color-text-base)]">¿Tiene contenedor intermedio?</p>
              <p class="mt-0.5 text-xs text-[var(--color-text-muted)]">Activo si el bulto contiene cajas, bolsas u otro contenedor</p>
            </div>
            <button
              type="button"
              class="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none"
              :class="hasCajas ? 'bg-[var(--color-primary)]' : 'bg-[#D1D5DB]'"
              @click="toggleHasCajas"
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform"
                :class="hasCajas ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>

          <!-- Sin contenedor intermedio: solo unidades_x_pack (opcional) -->
          <template v-if="!hasCajas">
            <div class="space-y-1.5">
              <label class="block text-sm font-semibold text-[var(--color-text-base)]">
                Unidades por Bulto
                <span class="ml-1 text-xs font-normal text-[var(--color-text-muted)]">(opcional)</span>
              </label>
              <input
                v-model.number="form.unidades_x_pack"
                type="number"
                min="1"
                step="1"
                placeholder="Ej: 48"
                class="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-text-base)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[#DCEBFF]"
                :class="{ 'border-[#FCA5A5]': errors.unidades_x_pack }"
              />
              <p class="text-xs text-[var(--color-text-muted)]">Dejalo vacío si el producto no se agrupa en bultos (ej: latas individuales)</p>
              <p v-if="errors.unidades_x_pack" class="text-xs text-[#DC2626]">{{ errors.unidades_x_pack }}</p>
            </div>
          </template>

          <!-- Con contenedor intermedio: cantidad + label -->
          <template v-else>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="block text-sm font-semibold text-[var(--color-text-base)]">
                  Contenedores por Bulto <span class="text-[#DC2626]">*</span>
                </label>
                <input
                  v-model.number="form.cajas_x_pack"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Ej: 6"
                  class="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-text-base)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[#DCEBFF]"
                  :class="{ 'border-[#FCA5A5]': errors.cajas_x_pack }"
                />
                <p v-if="errors.cajas_x_pack" class="text-xs text-[#DC2626]">{{ errors.cajas_x_pack }}</p>
              </div>

              <div class="space-y-1.5">
                <label class="block text-sm font-semibold text-[var(--color-text-base)]">
                  Unidades por Contenedor <span class="text-[#DC2626]">*</span>
                </label>
                <input
                  v-model.number="form.unidades_x_caja"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Ej: 8"
                  class="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-text-base)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[#DCEBFF]"
                  :class="{ 'border-[#FCA5A5]': errors.unidades_x_caja }"
                />
                <p v-if="errors.unidades_x_caja" class="text-xs text-[#DC2626]">{{ errors.unidades_x_caja }}</p>
              </div>
            </div>

            <!-- Label del contenedor intermedio -->
            <div class="space-y-1.5">
              <label class="block text-sm font-semibold text-[var(--color-text-base)]">
                Nombre del contenedor
                <span class="ml-1 text-xs font-normal text-[var(--color-text-muted)]">(opcional)</span>
              </label>
              <input
                v-model="form.nivel2_label"
                type="text"
                placeholder="caja"
                maxlength="50"
                class="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-text-base)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[#DCEBFF]"
              />
              <p class="text-xs text-[var(--color-text-muted)]">Ej: bolsa, tarro, balde (por defecto: caja)</p>
            </div>

            <!-- Unidades x pack calculado -->
            <div class="space-y-1.5">
              <label class="block text-sm font-semibold text-[var(--color-text-muted)]">
                Unidades por Bulto (calculado)
              </label>
              <div class="flex items-center rounded-2xl border border-[var(--color-border)] bg-[#F8FAFD] px-4 py-2.5">
                <span class="text-sm font-bold text-[var(--color-primary)]">
                  {{ computedUnidadesXPack ?? '—' }}
                </span>
                <span class="ml-1.5 text-xs text-[var(--color-text-muted)]">{{ pluralize(form.unidad_label || 'unidad', computedUnidadesXPack ?? 2) }} / bulto</span>
              </div>
            </div>
          </template>

          <!-- Label de unidad base (siempre visible) -->
          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-[var(--color-text-base)]">
              Nombre de unidad base
              <span class="ml-1 text-xs font-normal text-[var(--color-text-muted)]">(opcional)</span>
            </label>
            <input
              v-model="form.unidad_label"
              type="text"
              placeholder="unidad"
              maxlength="50"
              class="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-text-base)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[#DCEBFF]"
            />
            <p class="text-xs text-[var(--color-text-muted)]">Ej: lata, balde, bandeja (por defecto: unidad)</p>
          </div>

          <!-- Preview vivo -->
          <div
            v-if="packagingPreview"
            class="rounded-2xl border border-[#C7DEFF] bg-[#F0F6FF] px-4 py-3 text-sm font-semibold text-[var(--color-primary)]"
          >
            {{ packagingPreview }}
          </div>
        </section>

        <!-- Sección 3: Estado (solo en edición) -->
        <section v-if="isEditing" class="space-y-4">
          <h3 class="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
            Estado
          </h3>
          <div class="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[#FAFBFE] px-4 py-3">
            <div>
              <p class="text-sm font-semibold text-[var(--color-text-base)]">Producto activo</p>
              <p class="mt-0.5 text-xs text-[var(--color-text-muted)]">
                Los productos inactivos no aparecen en movimientos ni reportes
              </p>
            </div>
            <button
              type="button"
              class="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none"
              :class="form.is_available ? 'bg-[#16A34A]' : 'bg-[#D1D5DB]'"
              @click="form.is_available = !form.is_available"
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform"
                :class="form.is_available ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>
        </section>

      </div>

      <!-- Footer -->
      <footer class="border-t border-[var(--color-border)] bg-[#F8FAFD] px-6 py-4 sm:px-8">
        <div class="flex items-center justify-end gap-3">
          <button
            @click="close"
            class="rounded-2xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text-base)] transition hover:bg-white"
          >
            Cancelar
          </button>
          <button
            @click="submit"
            :disabled="loading"
            class="rounded-2xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(20,121,255,0.25)] transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ loading ? 'Guardando...' : (isEditing ? 'Guardar cambios' : 'Crear producto') }}
          </button>
        </div>
      </footer>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { createProduct, updateProduct } from '../../services/ProductService.js'
import { useToastStore } from '../../stores/toastStore.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  product: { type: Object, default: null },
  categories: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToastStore()
const loading = ref(false)
const errorMsg = ref(null)
const errors = ref({})

const isEditing = computed(() => !!props.product)

const hasCajas = ref(false)

const pluralize = (word, count) => {
  if (count === 1) return word
  const last = word.slice(-1).toLowerCase()
  return 'aeiouáéíóú'.includes(last) ? word + 's' : word + 'es'
}

const blankForm = () => ({
  name: '',
  category_name: '',
  unidades_x_pack: null,
  cajas_x_pack: null,
  unidades_x_caja: null,
  nivel2_label: '',
  unidad_label: '',
  is_available: true
})

const form = ref(blankForm())

watch(
  () => [props.modelValue, props.product],
  ([open]) => {
    if (!open) return
    errors.value = {}
    errorMsg.value = null
    if (props.product) {
      form.value = {
        name: props.product.name,
        category_name: props.product.category_name,
        unidades_x_pack: props.product.unidades_x_pack,
        cajas_x_pack: props.product.cajas_x_pack,
        unidades_x_caja: props.product.unidades_x_caja,
        nivel2_label: props.product.nivel2_label || '',
        unidad_label: props.product.unidad_label || '',
        is_available: props.product.is_available
      }
      hasCajas.value = !!props.product.cajas_x_pack
    } else {
      form.value = blankForm()
      hasCajas.value = false
    }
  },
  { immediate: true }
)

const computedUnidadesXPack = computed(() => {
  if (!hasCajas.value) return null
  const c = Number(form.value.cajas_x_pack)
  const u = Number(form.value.unidades_x_caja)
  if (c > 0 && u > 0) return c * u
  return null
})

const packagingPreview = computed(() => {
  const n2 = form.value.nivel2_label?.trim() || 'caja'
  const ul = form.value.unidad_label?.trim() || 'unidad'
  if (hasCajas.value) {
    const c = Number(form.value.cajas_x_pack)
    const u = Number(form.value.unidades_x_caja)
    const total = computedUnidadesXPack.value
    if (c > 0 && u > 0) return `1 Bulto = ${c} ${pluralize(n2, c)} = ${total} ${pluralize(ul, total)}`
    return null
  }
  const u = Number(form.value.unidades_x_pack)
  if (u > 0) return `1 Bulto = ${u} ${pluralize(ul, u)}`
  if (ul !== 'unidad') return `Unidad base: ${ul}`
  return null
})

const toggleHasCajas = () => {
  hasCajas.value = !hasCajas.value
  form.value.cajas_x_pack = null
  form.value.unidades_x_caja = null
  form.value.unidades_x_pack = null
}

const validate = () => {
  const e = {}
  if (!form.value.name?.trim()) e.name = 'El nombre es requerido'
  if (!form.value.category_name?.trim()) e.category_name = 'La categoría es requerida'

  if (hasCajas.value) {
    if (!form.value.cajas_x_pack || form.value.cajas_x_pack < 1) e.cajas_x_pack = 'Requerido, mínimo 1'
    if (!form.value.unidades_x_caja || form.value.unidades_x_caja < 1) e.unidades_x_caja = 'Requerido, mínimo 1'
  } else if (form.value.unidades_x_pack != null && form.value.unidades_x_pack < 1) {
    e.unidades_x_pack = 'Debe ser mayor a 0'
  }

  errors.value = e
  return Object.keys(e).length === 0
}

const buildPayload = () => {
  const labels = {
    nivel2_label: form.value.nivel2_label?.trim() || null,
    unidad_label: form.value.unidad_label?.trim() || null
  }
  const base = {
    name: form.value.name.trim(),
    category_name: form.value.category_name.trim(),
    ...labels,
    ...(isEditing.value ? { is_available: form.value.is_available } : {})
  }
  if (hasCajas.value) {
    return {
      ...base,
      cajas_x_pack: Number(form.value.cajas_x_pack),
      unidades_x_caja: Number(form.value.unidades_x_caja),
      unidades_x_pack: computedUnidadesXPack.value,
    }
  }
  return {
    ...base,
    unidades_x_pack: form.value.unidades_x_pack ? Number(form.value.unidades_x_pack) : null,
    cajas_x_pack: null,
    unidades_x_caja: null,
  }
}

const submit = async () => {
  if (!validate()) return
  loading.value = true
  errorMsg.value = null
  try {
    const payload = buildPayload()
    if (isEditing.value) {
      await updateProduct(props.product.id, payload)
      toast.add('Producto actualizado correctamente')
    } else {
      await createProduct(payload)
      toast.add('Producto creado correctamente')
    }
    emit('saved')
    close()
  } catch (err) {
    errorMsg.value = err.response?.data?.error?.message || 'Error al guardar el producto'
  } finally {
    loading.value = false
  }
}

const close = () => emit('update:modelValue', false)
</script>
