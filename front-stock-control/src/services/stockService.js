import apiClient from './apiClient'

export const getStockSummaryByCategory = async (branchId) => {
  const res = await apiClient.get(`/branches/${branchId}/stock-summary-by-category`)
  return res.data.data
}
