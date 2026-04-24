import apiClient from './apiClient'

export const getReasonCategories = async () => {
  const res = await apiClient.get('/reason-categories')
  return res.data.data
}
