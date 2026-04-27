const { Router } = require('express')
const { requireAuth } = require('../middleware/auth')

const authRoutes = require('./auth.routes')
const branchesRoutes = require('./branches.routes')
const dashboardRoutes = require('./dashboard.routes')
const reasonCategoriesRoutes = require('./reasonCategories.routes')
const reportsRoutes = require('./reports.routes')
const stockMovementsRoutes = require('./stockMovements.routes')
const usersRoutes = require('./users.routes')

const router = Router()

router.use('/auth', authRoutes)
router.use('/branches', requireAuth, branchesRoutes)
router.use('/dashboard', requireAuth, dashboardRoutes)
router.use('/reason-categories', requireAuth, reasonCategoriesRoutes)
router.use('/reports', requireAuth, reportsRoutes)
router.use('/stock-movements', requireAuth, stockMovementsRoutes)
router.use('/users', requireAuth, usersRoutes)

module.exports = router
