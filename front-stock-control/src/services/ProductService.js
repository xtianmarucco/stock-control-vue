import apiClient from './apiClient'

export const getStockByBranch = async (branchId, category = null) => {
  const params = category ? { category } : {}
  const res = await apiClient.get(`/branches/${branchId}/stock`, { params })
  return res.data.data
}
