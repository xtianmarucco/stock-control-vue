const svc = require('../services/dashboard.service')
const handleError = require('../utils/handleError')

const getDashboard = async (req, res) => {
  try {
    const data = await svc.getDashboardData()
    res.json({ success: true, data })
  } catch (err) {
    handleError(err, res)
  }
}

module.exports = { getDashboard }
