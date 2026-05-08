const express = require('express');
const router = express.Router();
const { getProductById } = require('../controllers/products.controller');

router.get('/:id', getProductById);

module.exports = router;
