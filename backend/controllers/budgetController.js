const asyncHandler = require('express-async-handler');
const Budget = require('../models/Budget');

// @desc    Get all shield limits
// @route   GET /api/budgets
// @access  Private
const getBudgets = asyncHandler(async (req, res) => {
  const budgets = await Budget.find({ user: req.user.id });
  
  // Convert the array to a simple object: { "food": 5000, "rent": 20000 }
  // This makes it easier for your frontend to read.
  const budgetMap = {};
  budgets.forEach(b => {
    budgetMap[b.category] = b.limit;
  });

  res.status(200).json(budgetMap);
});

// @desc    Set or Update a shield limit
// @route   POST /api/budgets
// @access  Private
const setBudget = asyncHandler(async (req, res) => {
  const { category, limit } = req.body;

  if (!category || !limit) {
    res.status(400);
    throw new Error('Please provide category and limit');
  }

  // Find and update, or create if it doesn't exist (this is called "upsert")
  const budget = await Budget.findOneAndUpdate(
    { user: req.user.id, category }, 
    { limit },
    { new: true, upsert: true } 
  );

  res.status(200).json(budget);
});

// @desc    Delete a shield
// @route   DELETE /api/budgets/:category
// @access  Private
const deleteBudget = asyncHandler(async (req, res) => {
  const { category } = req.params;

  await Budget.findOneAndDelete({ 
    user: req.user.id, 
    category 
  });

  res.status(200).json({ message: `Deleted shield for ${category}` });
});

module.exports = {
  getBudgets,
  setBudget,
  deleteBudget,
};