const { Router } = require('express')
const { getStockReport } = require('../controllers/reports.controller')

const router = Router()

router.get('/stock', getStockReport)

module.exports = router
