const { Router } = require('express');
const { requireAdmin } = require('../middleware/auth');
const {
  createStockMovement,
  getStockMovements,
  getStockMovementById,
} = require('../controllers/stockMovements.controller');

const router = Router();

router.get('/', getStockMovements);
router.post('/', requireAdmin, createStockMovement);
router.get('/:id', getStockMovementById);

module.exports = router;