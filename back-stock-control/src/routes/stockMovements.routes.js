const { Router } = require('express');
const {
  createStockMovement,
  getStockMovements,
  getStockMovementById,
} = require('../controllers/stockMovements.controller');

const router = Router();

router.get('/', getStockMovements);
router.post('/', createStockMovement);
router.get('/:id', getStockMovementById); // <--- Esta es la ruta que faltaba

module.exports = router;