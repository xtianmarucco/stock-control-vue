const { Router } = require('express')
const { requireAdmin } = require('../middleware/auth')
const { getAllUsers, createUser, updateUser, deleteUser } = require('../controllers/users.controller')

const router = Router()

router.get('/', getAllUsers)
router.post('/', requireAdmin, createUser)
router.put('/:id', requireAdmin, updateUser)
router.delete('/:id', requireAdmin, deleteUser)

module.exports = router
