const service = require('../services/reports.service')

const getStockReport = async (req, res, next) => {
  try {
    const { category } = req.query
    const data = await service.getStockReport({ category: category || null })
    res.json(data)
  } catch (err) {
    next(err)
  }
}

module.exports = { getStockReport }
