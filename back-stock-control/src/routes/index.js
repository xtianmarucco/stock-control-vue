const { Router } = require('express')
const { requireAuth } = require('../middleware/auth')

const authRoutes = require('./auth.routes')
const branchesRoutes = require('./branches.routes')
const dashboardRoutes = require('./dashboard.routes')
const reasonCategoriesRoutes = require('./reasonCategories.routes')
const stockMovementsRoutes = require('./stockMovements.routes')
const usersRoutes = require('./users.routes')

const router = Router()

router.use('/auth', authRoutes)
router.use('/branches', requireAuth, branchesRoutes)
router.use('/dashboard', requireAuth, dashboardRoutes)
router.use('/reason-categories', requireAuth, reasonCategoriesRoutes)
router.use('/stock-movements', requireAuth, stockMovementsRoutes)
router.use('/users', requireAuth, usersRoutes)

module.exports = router
