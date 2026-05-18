import apiClient from './apiClient'

export const getBranches = async () => {
  const res = await apiClient.get('/branches')
  return res.data.data
}

export const getAllBranches = getBranches

export const getBranchById = async (branchId) => {
  const res = await apiClient.get(`/branches/${branchId}`)
  return res.data.data
}

export const createBranch = async (data) => {
  const res = await apiClient.post('/branches', data)
  return res.data.data
}

export const updateBranch = async (id, data) => {
  const res = await apiClient.put(`/branches/${id}`, data)
  return res.data.data
}

export const deleteBranch = async (id) => {
  await apiClient.delete(`/branches/${id}`)
}

export const getStockByBranch = async (branchId, category) => {
  const params = category ? { category } : {}
  const res = await apiClient.get(`/branches/${branchId}/stock`, { params })
  return res.data.data.products ?? []
}
