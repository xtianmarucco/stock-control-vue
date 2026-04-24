const { Router } = require('express')
const { getReasonCategories } = require('../controllers/reasonCategories.controller')

const router = Router()

router.get('/', getReasonCategories)

module.exports = router
