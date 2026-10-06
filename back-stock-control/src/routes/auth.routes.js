const { Router } = require('express')
const { login, logout, me, forgotPassword, resetPassword } = require('../controllers/auth.controller')
const { requireAuth } = require('../middleware/auth')

const router = Router()

router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/logout', requireAuth, logout)
router.get('/me', requireAuth, me)

module.exports = router
