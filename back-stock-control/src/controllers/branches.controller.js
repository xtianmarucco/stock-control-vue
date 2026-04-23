const service = require('../services/branches.service')
const { handleError } = require('../utils/handleError')

const getAllBranches = async (req, res) => {
  try {
    const data = await service.getAll()
    res.json({ success: true, data })
  } catch (err) {
    handleError(res, err)
  }
}

const getBranchById = async (req, res) => {
  try {
    const data = await service.getById(Number(req.params.id))
    res.json({ success: true, data })
  } catch (err) {
    handleError(res, err)
  }
}

const getStockSummaryByCategory = async (req, res) => {
  try {
    const data = await service.getStockSummaryByCategory(Number(req.params.id))
    res.json({ success: true, data })
  } catch (err) {
    handleError(res, err)
  }
}

const getStockByBranch = async (req, res) => {
  try {
    const data = await service.getStockByBranch(Number(req.params.id), req.query.category)
    res.json({ success: true, data })
  } catch (err) {
    handleError(res, err)
  }
}

module.exports = { getAllBranches, getBranchById, getStockSummaryByCategory, getStockByBranch }
