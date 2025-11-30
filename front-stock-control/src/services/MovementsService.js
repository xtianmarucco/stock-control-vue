// src/services/movementsService.js
import axios from 'axios'

const API_URL = 'http://localhost:3000/api/stock-movements'

// 🔹 Obtener movimientos con filtros opcionales
export const getStockMovements = async (filters = {}) => {
  try {
    const params = {}

    if (filters.branch) params.branch_id = filters.branch
    if (filters.type) params.type = filters.type
    if (filters.from) params.from = filters.from
    if (filters.to) params.to = filters.to

    const { data } = await axios.get(API_URL, { params })
    return data
  } catch (error) {
    console.error('❌ Error fetching stock movements:', error)
    throw error
  }
}

// 🔹 Crear nuevo movimiento
export const createStockMovement = async (movementData) => {
  try {
    const { data } = await axios.post(API_URL, movementData)
    return data
  } catch (error) {
    console.error('❌ Error creating stock movement:', error.response?.data || error)
    throw error
  }
}

// 🔹 Obtener detalles de un movimiento específico
export const getStockMovementById = async (id) => {
  try {
    const { data } = await axios.get(`${API_URL}/${id}`)
    return data
  } catch (error) {
    console.error('❌ Error fetching stock movement by ID:', error)
    throw error
  }
}
