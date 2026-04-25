import apiClient from './apiClient'

export const getDashboardData = async () => {
  const res = await apiClient.get('/dashboard')
  return res.data.data
}
