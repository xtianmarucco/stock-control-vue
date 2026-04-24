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

router.get('/', getAllBranches);
router.post('/', createBranch);
router.get('/:id', getBranchById);
router.put('/:id', updateBranch);
router.delete('/:id', deleteBranch);
router.get('/:id/stock-summary-by-category', getStockSummaryByCategory);
router.get('/:id/stock', getStockByBranch);

module.exports = router;
