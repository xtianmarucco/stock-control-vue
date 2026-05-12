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

export const getAllProducts = async ({ category, showInactive } = {}) => {
  const params = {}
  if (category) params.category = category
  if (showInactive) params.showInactive = true
  const res = await apiClient.get('/products', { params })
  return res.data.data
}

export const getProductCategories = async () => {
  const res = await apiClient.get('/products/categories')
  return res.data.data
}

export const createProduct = async (data) => {
  const res = await apiClient.post('/products', data)
  return res.data.data
}

export const updateProduct = async (id, data) => {
  const res = await apiClient.put(`/products/${id}`, data)
  return res.data.data
}

export const deleteProduct = async (id) => {
  await apiClient.delete(`/products/${id}`)
}

export const restoreProduct = async (id) => {
  const res = await apiClient.patch(`/products/${id}/restore`)
  return res.data.data
}
