import axios from 'axios'

const API_URL = 'http://localhost:3000/api/products'

export const getAllProducts = async () => {
  const res = await axios.get(API_URL)
  return res.data
}

export const getProductsByCategory = async (category) => {
  const res = await axios.get(`${API_URL}/category/${category}`)
  return res.data
}

export const getProductsWithStock = async () => {
  const res = await axios.get(`${API_URL}/with-stock`)
  return res.data
}
export const getAllCategories = async () => {
  const res = await axios.get(API_URL)
  // Derivamos las categorías únicas de los productos
  const categories = [...new Set(res.data.map(p => p.category_id || p.category_name))].filter(Boolean)
  return categories
}