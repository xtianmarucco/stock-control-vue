<template>
  <DashboardLayout>
  <div class="space-y-6">

    <!-- Encabezado -->
    <section class="rounded-[32px] border border-[var(--color-border)] bg-white px-6 py-6 shadow-[0_24px_50px_rgba(15,35,64,0.08)] sm:px-8">
      <div class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p class="text-sm font-medium text-[var(--color-primary)]">Exportar datos</p>
          <h1 class="mt-1 text-3xl font-bold text-[var(--color-text-base)]">Reportes de stock</h1>
          <p class="mt-2 text-sm text-[var(--color-text-muted)]">
            Filtrá por categoría y exportá el inventario consolidado en Excel o PDF.
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-2 xl:min-w-[280px]">
          <div class="rounded-[24px] border border-[var(--color-border)] bg-[#FAFBFE] px-4 py-4">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Productos</p>
            <p class="mt-2 text-2xl font-bold text-[var(--color-text-base)]">{{ products.length }}</p>
          </div>
          <div class="rounded-[24px] border border-[var(--color-border)] bg-[#FAFBFE] px-4 py-4">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Total global</p>
            <p class="mt-2 text-2xl font-bold text-[var(--color-text-base)]">{{ grandTotal }} <span class="text-base font-normal text-[var(--color-text-muted)]">bts</span></p>
          </div>
        </div>
      </div>
    </section>

    <!-- Filtros + exportar -->
    <section class="rounded-[32px] border border-[var(--color-border)] bg-white px-6 py-5 shadow-[0_24px_50px_rgba(15,35,64,0.08)] sm:px-8">
      <div class="flex flex-wrap items-end gap-4">
        <div class="flex flex-col gap-2">
          <label class="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Categoría</label>
          <select
            v-model="filters.category"
            class="min-w-[220px] rounded-2xl border border-[var(--color-border)] bg-[#FAFBFE] px-4 py-3 text-sm text-[var(--color-text-base)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[#DCEBFF]"
          >
            <option value="">Todas las categorías</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>

        <div class="flex gap-2">
          <button
            class="rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(20,121,255,0.22)] transition hover:bg-[var(--color-primary-hover)]"
            @click="fetchReport"
          >
            Filtrar
          </button>
          <button
            class="rounded-2xl border border-[var(--color-border)] px-5 py-3 text-sm font-semibold text-[var(--color-text-base)] transition hover:bg-[#F7FAFF]"
            @click="clearFilters"
          >
            Limpiar
          </button>
        </div>

        <div class="ml-auto flex gap-2">
          <button
            :disabled="!products.length"
            class="flex items-center gap-2 rounded-2xl border border-[#16A34A] px-4 py-3 text-sm font-semibold text-[#16A34A] transition hover:bg-[#F0FDF4] disabled:cursor-not-allowed disabled:opacity-40"
            @click="exportExcel"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Excel
          </button>
          <button
            :disabled="!products.length"
            class="flex items-center gap-2 rounded-2xl border border-[#DC2626] px-4 py-3 text-sm font-semibold text-[#DC2626] transition hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:opacity-40"
            @click="exportPdf"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            PDF
          </button>
        </div>
      </div>
    </section>

    <!-- Tabla -->
    <section class="rounded-[32px] border border-[var(--color-border)] bg-white p-5 shadow-[0_24px_50px_rgba(15,35,64,0.08)]">

      <div v-if="loading" class="overflow-hidden rounded-[28px] border border-[var(--color-border)]">
        <div class="border-b border-[var(--color-border)] bg-[#F8FAFD] px-5 py-4">
          <SkeletonBlock width="120px" height="11px" rounded="4px" />
        </div>
        <div class="divide-y divide-[var(--color-border)]">
          <div v-for="i in 6" :key="i" class="flex items-center gap-4 px-5 py-4">
            <div class="flex-1">
              <SkeletonBlock :width="`${110 + i * 16}px`" height="14px" rounded="4px" class="mb-2" />
              <SkeletonBlock width="90px" height="11px" rounded="4px" />
            </div>
            <SkeletonBlock width="60px" height="14px" rounded="4px" />
            <SkeletonBlock width="60px" height="14px" rounded="4px" />
          </div>
        </div>
      </div>

      <div v-else-if="!products.length" class="rounded-[28px] border border-[var(--color-border)] bg-[#FAFBFE] px-5 py-12 text-center">
        <p class="text-base font-semibold text-[var(--color-text-base)]">Sin datos para mostrar</p>
        <p class="mt-1 text-sm text-[var(--color-text-muted)]">Probá cambiando el filtro de categoría.</p>
      </div>

      <div v-else class="overflow-hidden rounded-[28px] border border-[var(--color-border)]">
        <!-- Sub-header -->
        <div class="flex items-center gap-3 border-b border-[var(--color-border)] bg-[#F8FAFD] px-5 py-4">
          <span
            class="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
            :class="filters.category ? 'bg-[#EAF2FF] text-[var(--color-primary)]' : 'bg-[#EEF3FA] text-[var(--color-text-muted)]'"
          >
            {{ filters.category || 'Todas las categorías' }}
          </span>
          <span class="text-sm text-[var(--color-text-muted)]">
            {{ products.length }} productos
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="border-b border-[var(--color-border)] bg-[#F8FAFD] text-[var(--color-text-muted)]">
              <tr>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] whitespace-nowrap">Producto</th>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] whitespace-nowrap">Categoría</th>
                <th
                  v-for="branch in branches"
                  :key="branch.id"
                  class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em] whitespace-nowrap"
                >
                  {{ branch.name }}
                </th>
                <th class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-base)] whitespace-nowrap">
                  Total (bultos)
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-[var(--color-border)]">
              <tr
                v-for="product in products"
                :key="product.product_id"
                class="transition hover:bg-[#F0F6FF]"
              >
                <td class="px-5 py-3.5 font-semibold text-[var(--color-text-base)] whitespace-nowrap">
                  {{ product.product_name }}
                </td>
                <td class="px-5 py-3.5 whitespace-nowrap">
                  <span class="inline-flex rounded-full bg-[#EEF3FA] px-3 py-1 text-xs font-semibold text-[var(--color-text-base)]">
                    {{ product.category_name }}
                  </span>
                </td>
                <td
                  v-for="branch in branches"
                  :key="branch.id"
                  class="px-5 py-3.5 text-right whitespace-nowrap font-medium"
                  :class="(product.stock[branch.id] ?? 0) === 0
                    ? 'text-[var(--color-text-muted)]'
                    : (product.stock[branch.id] ?? 0) <= 3
                      ? 'text-[#DC2626]'
                      : 'text-[var(--color-text-base)]'"
                >
                  {{ product.stock[branch.id] ?? 0 }}
                  <span
                    v-if="(product.stock[branch.id] ?? 0) > 0"
                    class="text-xs font-normal text-[var(--color-text-muted)]"
                  >bts</span>
                </td>
                <td class="px-5 py-3.5 text-right font-bold text-[var(--color-text-base)] whitespace-nowrap">
                  {{ product.total }}
                  <span class="text-xs font-normal text-[var(--color-text-muted)]">bts</span>
                </td>
              </tr>
            </tbody>

            <tfoot class="border-t-2 border-[var(--color-border)] bg-[#F8FAFD]">
              <tr>
                <td class="px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-text-base)]" colspan="2">
                  Totales
                </td>
                <td
                  v-for="branch in branches"
                  :key="branch.id"
                  class="px-5 py-4 text-right font-bold text-[var(--color-text-base)]"
                >
                  {{ branchTotal(branch.id) }}
                  <span class="text-xs font-normal text-[var(--color-text-muted)]">bts</span>
                </td>
                <td class="px-5 py-4 text-right font-bold text-[var(--color-primary)]">
                  {{ grandTotal }}
                  <span class="text-xs font-normal text-[var(--color-primary)]">bts</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>

  </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import SkeletonBlock from '../components/ui/SkeletonBlock.vue'
import { getStockReport } from '../services/ReportsService.js'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const products = ref([])
const branches = ref([])
const categories = ref([])
const loading = ref(false)
const filters = ref({ category: '' })

const branchTotal = (branchId) =>
  products.value.reduce((sum, p) => sum + (p.stock[branchId] ?? 0), 0)

const grandTotal = computed(() =>
  products.value.reduce((sum, p) => sum + p.total, 0)
)

const fetchReport = async () => {
  loading.value = true
  try {
    const params = filters.value.category ? { category: filters.value.category } : {}
    const data = await getStockReport(params)
    products.value = data.products
    branches.value = data.branches
    categories.value = data.categories
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  filters.value = { category: '' }
  fetchReport()
}

const buildTableData = () => {
  const headers = ['Producto', 'Categoría', ...branches.value.map(b => b.name), 'Total']
  const rows = products.value.map(p => [
    p.product_name,
    p.category_name,
    ...branches.value.map(b => p.stock[b.id] ?? 0),
    p.total
  ])
  const totals = [
    'TOTALES', '',
    ...branches.value.map(b => branchTotal(b.id)),
    grandTotal.value
  ]
  return { headers, rows, totals }
}

const exportExcel = () => {
  const { headers, rows, totals } = buildTableData()
  const wsData = [headers, ...rows, totals]
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Column widths
  ws['!cols'] = headers.map((h, i) => ({
    wch: i === 0 ? 30 : i === 1 ? 24 : 14
  }))

  // Bold header row
  const range = XLSX.utils.decode_range(ws['!ref'])
  for (let c = range.s.c; c <= range.e.c; c++) {
    const headerCell = XLSX.utils.encode_cell({ r: 0, c })
    if (ws[headerCell]) ws[headerCell].s = { font: { bold: true } }
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Stock')
  const label = filters.value.category ? `_${filters.value.category.replace(/\s+/g, '_')}` : ''
  XLSX.writeFile(wb, `reporte_stock${label}.xlsx`)
}

const exportPdf = () => {
  const { headers, rows, totals } = buildTableData()
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const label = filters.value.category ? ` — ${filters.value.category}` : ''
  doc.setFontSize(14)
  doc.setTextColor(25, 59, 104)
  doc.text(`Reporte de Stock${label}`, 14, 16)

  doc.setFontSize(9)
  doc.setTextColor(150)
  doc.text(`Generado: ${new Date().toLocaleDateString('es-AR')}`, 14, 22)

  autoTable(doc, {
    head: [headers],
    body: [...rows, totals],
    startY: 28,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [20, 121, 255], textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: [248, 250, 253], textColor: [25, 59, 104], fontStyle: 'bold' },
    didParseCell(data) {
      if (data.row.index === rows.length) {
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.fillColor = [232, 240, 255]
      }
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 30 }
    },
    alternateRowStyles: { fillColor: [250, 251, 254] }
  })

  const filename = filters.value.category
    ? `reporte_stock_${filters.value.category.replace(/\s+/g, '_')}.pdf`
    : 'reporte_stock.pdf'
  doc.save(filename)
}

onMounted(fetchReport)
</script>
