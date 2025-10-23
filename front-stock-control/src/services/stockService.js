// src/services/stockService.js
import axios from 'axios'

export async function getStockSummaryByCategory(branchId) {
  const res = await axios.get(`http://localhost:3000/api/branches/${branchId}/stock-summary-by-category`)
  return res.data
}