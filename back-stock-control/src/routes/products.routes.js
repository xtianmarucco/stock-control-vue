const express = require('express')
const router = express.Router()
const { requireAdmin } = require('../middleware/auth')
const { getAll, getCategories, getProductById, create, update, remove, restore, destroy } = require('../controllers/products.controller')

router.get('/', getAll)
router.get('/categories', getCategories)
router.get('/:id', getProductById)
router.post('/', requireAdmin, create)
router.put('/:id', requireAdmin, update)
router.delete('/:id', requireAdmin, remove)
router.patch('/:id/restore', requireAdmin, restore)
router.delete('/:id/permanent', requireAdmin, destroy)

module.exports = router
