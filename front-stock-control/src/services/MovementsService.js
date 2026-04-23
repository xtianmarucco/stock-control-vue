import apiClient from './apiClient'

export const getStockMovements = async (filters = {}) => {
  const params = {}
  if (filters.branch) params.branch_id = filters.branch
  if (filters.type) params.type = filters.type
  if (filters.from) params.from = filters.from
  if (filters.to) params.to = filters.to

  const res = await apiClient.get('/stock-movements', { params })
  return res.data.data
}

export const createStockMovement = async (movementData) => {
  const res = await apiClient.post('/stock-movements', movementData)
  return res.data.data
}

export const getStockMovementById = async (id) => {
  const res = await apiClient.get(`/stock-movements/${id}`)
  return res.data.data
}
