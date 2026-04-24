const { Router } = require('express')
const { requireAuth } = require('../middleware/auth')

const authRoutes = require('./auth.routes')
const branchesRoutes = require('./branches.routes')
const reasonCategoriesRoutes = require('./reasonCategories.routes')
const stockMovementsRoutes = require('./stockMovements.routes')

const router = Router()

router.use('/auth', authRoutes)
router.use('/branches', requireAuth, branchesRoutes)
router.use('/reason-categories', requireAuth, reasonCategoriesRoutes)
router.use('/stock-movements', requireAuth, stockMovementsRoutes)

module.exports = router
