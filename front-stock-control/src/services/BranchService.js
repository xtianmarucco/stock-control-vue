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
