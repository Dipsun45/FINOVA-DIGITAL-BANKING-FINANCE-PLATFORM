const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

// @desc    Get user budgets for current month
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res, next) => {
  try {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();

    const budgets = await Budget.find({ user: req.user._id, month: currentMonth, year: currentYear });

    res.json({ success: true, count: budgets.length, month: currentMonth, year: currentYear, budgets });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update category budget
// @route   POST /api/budgets
// @access  Private
const setBudget = async (req, res, next) => {
  try {
    const { category, amount } = req.body;
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();

    let budget = await Budget.findOne({ user: req.user._id, category, month: currentMonth, year: currentYear });

    if (budget) {
      budget.amount = parseFloat(amount);
      await budget.save();
    } else {
      // Calculate current spent in this category for the month
      const startOfMonth = new Date(currentYear, new Date().getMonth(), 1);
      const endOfMonth = new Date(currentYear, new Date().getMonth() + 1, 0);

      const expenses = await Expense.find({
        user: req.user._id,
        category,
        date: { $gte: startOfMonth, $lte: endOfMonth }
      });
      const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

      budget = await Budget.create({
        user: req.user._id,
        category,
        amount: parseFloat(amount),
        spent: totalSpent,
        month: currentMonth,
        year: currentYear
      });
    }

    res.status(201).json({ success: true, message: `Budget for ${category} updated`, budget });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!budget) return res.status(404).json({ success: false, message: 'Budget not found' });

    res.json({ success: true, message: 'Budget deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  setBudget,
  deleteBudget
};
