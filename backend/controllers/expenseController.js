const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Notification = require('../models/Notification');
const { notifyUser } = require('../services/socketService');

// @desc    Get user expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res, next) => {
  try {
    const { category, month } = req.query;
    const query = { user: req.user._id };

    if (category && category !== 'All') query.category = category;

    const expenses = await Expense.find(query).sort({ date: -1 });

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Grouping by category for analytics
    const categoryTotals = {};
    expenses.forEach((exp) => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    res.json({
      success: true,
      count: expenses.length,
      totalExpense,
      categoryTotals,
      expenses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res, next) => {
  try {
    const { category, amount, description, date, paymentMethod } = req.body;

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid expense amount' });
    }

    const expense = await Expense.create({
      user: req.user._id,
      category,
      amount: parsedAmount,
      description,
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod || 'Debit Card'
    });

    // Check if there is an active budget for this category & update spent
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();

    const budget = await Budget.findOne({ user: req.user._id, category, month: currentMonth, year: currentYear });
    if (budget) {
      budget.spent += parsedAmount;
      await budget.save();

      // Check if 80% or 100% of budget reached
      const percentage = (budget.spent / budget.amount) * 100;
      if (percentage >= 80) {
        const notif = await Notification.create({
          user: req.user._id,
          title: `Budget Warning: ${category}`,
          message: `You have used ${percentage.toFixed(1)}% of your monthly budget for ${category} ($${budget.spent.toFixed(2)} / $${budget.amount.toFixed(2)}).`,
          type: 'budget'
        });
        notifyUser(req.user._id.toString(), notif);
      }
    }

    res.status(201).json({ success: true, message: 'Expense recorded', expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });

    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  addExpense,
  deleteExpense
};
