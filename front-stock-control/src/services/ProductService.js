import apiClient from './apiClient'

export const getStockByBranch = async (branchId, category = null) => {
  const params = category ? { category } : {}
  const res = await apiClient.get(`/branches/${branchId}/stock`, { params })
  return res.data.data
}

export const getProductById = async (id) => {
  const res = await apiClient.get(`/products/${id}`)
  return res.data.data
}
