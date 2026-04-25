const express = require('express');
const router = express.Router();

const {
  getAllBranches,
  getBranchById,
  getStockSummaryByCategory,
  getStockByBranch,
  createBranch,
  updateBranch,
  deleteBranch,
} = require('../controllers/branches.controller');
const { requireAdmin } = require('../middleware/auth');

router.get('/', getAllBranches);
router.post('/', requireAdmin, createBranch);
router.get('/:id', getBranchById);
router.put('/:id', requireAdmin, updateBranch);
router.delete('/:id', requireAdmin, deleteBranch);
router.get('/:id/stock-summary-by-category', getStockSummaryByCategory);
router.get('/:id/stock', getStockByBranch);

module.exports = router;
