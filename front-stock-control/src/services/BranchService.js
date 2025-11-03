import axios from 'axios'

const API_URL = 'http://localhost:3000/api/branches'

export const getAllBranches = async () => {
  const res = await axios.get(API_URL)
  return res.data
}
// ✅ Nuevo helper
export const getBranchById = async (branchId) => {
  const res = await axios.get(`${API_URL}/${branchId}`)
  return res.data
}