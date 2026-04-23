const service = require('../services/stockMovements.service')
const { handleError } = require('../utils/handleError')

const getStockMovements = async (req, res) => {
  try {
    const movements = await service.getAll(req.query)
    const data = movements.map(service.formatMovement)
    res.json({ success: true, data })
  } catch (err) {
    handleError(res, err)
  }
}

const getStockMovementById = async (req, res) => {
  try {
    const data = await service.getById(Number(req.params.id))
    res.json({ success: true, data })
  } catch (err) {
    handleError(res, err)
  }
}

const createStockMovement = async (req, res) => {
  try {
    const data = await service.create(req.body)
    res.status(201).json({ success: true, data })
  } catch (err) {
    handleError(res, err)
  }
}

module.exports = { getStockMovements, getStockMovementById, createStockMovement }
