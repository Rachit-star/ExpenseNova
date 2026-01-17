const express = require('express');
const router = express.Router();
const { getBudgets, setBudget, deleteBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

// All budget routes are protected (must be logged in)
router.use(protect);

router.route('/').get(getBudgets).post(setBudget);
router.route('/:category').delete(deleteBudget);

module.exports = router;