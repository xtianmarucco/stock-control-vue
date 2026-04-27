<template>
  <div class="space-y-5">
    <!-- Encabezado -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex justify-between items-center">
      <div>
        <h1 class="text-xl font-bold text-[#193B68]">Reportes</h1>
        <p class="text-sm text-gray-400 mt-0.5">Exportá reportes de stock en Excel o PDF</p>
      </div>
    </div>

    <!-- Filtros + exportar -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
      <div class="flex flex-wrap items-end gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Categoría</label>
          <select
            v-model="filters.category"
            class="border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#193B68] focus:outline-none focus:ring-2 focus:ring-[#1479FF] min-w-[200px]"
          >
            <option value="">Todas las categorías</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>

        <div class="flex gap-2 ml-auto">
          <button
            class="bg-[#1479FF] hover:bg-[#0f66e0] text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors"
            @click="fetchReport"
          >
            Filtrar
          </button>
          <button
            class="border border-gray-200 text-[#193B68] font-medium px-5 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            @click="clearFilters"
          >
            Limpiar
          </button>
        </div>

        <div class="flex gap-2">
          <button
            :disabled="!products.length"
            class="flex items-center gap-2 border border-[#16A34A] text-[#16A34A] font-medium px-4 py-2 rounded-lg text-sm hover:bg-green-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            @click="exportExcel"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Excel
          </button>
          <button
            :disabled="!products.length"
            class="flex items-center gap-2 border border-[#DC2626] text-[#DC2626] font-medium px-4 py-2 rounded-lg text-sm hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            @click="exportPdf"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            PDF
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="flex items-center justify-between gap-3 border-b border-gray-100 bg-[#F8FAFD] px-6 py-4">
        <p class="text-sm text-gray-500">
          <span class="font-semibold text-[#193B68]">{{ products.length }}</span> productos
          <template v-if="filters.category"> · {{ filters.category }}</template>
        </p>
      </div>

      <div v-if="loading" class="text-center py-10 text-gray-300 text-sm">Cargando...</div>
      <div v-else-if="!products.length" class="text-center py-10 text-gray-400 text-sm">
        Sin datos para mostrar
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full text-sm text-left">
          <thead class="border-b border-gray-100 bg-[#F8FAFD]">
            <tr>
              <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Producto</th>
              <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Categoría</th>
              <th
                v-for="branch in branches"
                :key="branch.id"
                class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right whitespace-nowrap"
              >
                {{ branch.name }}
              </th>
              <th class="px-4 py-3 text-xs font-semibold text-[#193B68] uppercase tracking-wide text-right whitespace-nowrap">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="product in products"
              :key="product.product_id"
              class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3 text-[#193B68] font-medium whitespace-nowrap">{{ product.product_name }}</td>
              <td class="px-4 py-3 text-gray-400 whitespace-nowrap">{{ product.category_name }}</td>
              <td
                v-for="branch in branches"
                :key="branch.id"
                class="px-4 py-3 text-right whitespace-nowrap"
                :class="(product.stock[branch.id] ?? 0) <= 3 && (product.stock[branch.id] ?? 0) > 0
                  ? 'text-orange-500 font-semibold'
                  : (product.stock[branch.id] ?? 0) === 0
                    ? 'text-gray-300'
                    : 'text-[#193B68]'"
              >
                {{ product.stock[branch.id] ?? 0 }}
              </td>
              <td class="px-4 py-3 text-right font-bold text-[#193B68] whitespace-nowrap">
                {{ product.total }}
              </td>
            </tr>
          </tbody>
          <tfoot class="border-t-2 border-gray-200 bg-[#F8FAFD]">
            <tr>
              <td class="px-4 py-3 text-xs font-bold text-[#193B68] uppercase tracking-wide" colspan="2">Totales</td>
              <td
                v-for="branch in branches"
                :key="branch.id"
                class="px-4 py-3 text-right font-bold text-[#193B68]"
              >
                {{ branchTotal(branch.id) }}
              </td>
              <td class="px-4 py-3 text-right font-bold text-[#193B68]">{{ grandTotal }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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
