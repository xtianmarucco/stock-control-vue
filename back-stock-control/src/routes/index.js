const { Router } = require('express')

const branchesRoutes = require('./branches.routes')
const stockMovementsRoutes = require('./stockMovements.routes')

const router = Router()

router.use('/branches', branchesRoutes)
router.use('/stock-movements', stockMovementsRoutes)

module.exports = router
