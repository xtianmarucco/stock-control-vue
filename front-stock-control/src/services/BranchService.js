import axios from 'axios'

const API_URL = 'http://localhost:3000/api/branches'

export const getBranches = async () => {
  const res = await axios.get(API_URL)
  return res.data
}

// Alias temporal para compatibilidad con componentes existentes
export const getAllBranches = getBranches

export const getBranchById = async (branchId) => {
  const res = await axios.get(`${API_URL}/${branchId}`)
  return res.data
}
