const service = require('../services/reasonCategories.service')
const { handleError } = require('../utils/handleError')

const getReasonCategories = async (_req, res) => {
  try {
    const data = await service.getAll()
    res.json({ success: true, data })
  } catch (err) {
    handleError(res, err)
  }
}

module.exports = { getReasonCategories }
