import apiClient from './apiClient'

export const getStockReport = (params = {}) =>
  apiClient.get('/reports/stock', { params }).then(r => r.data)
