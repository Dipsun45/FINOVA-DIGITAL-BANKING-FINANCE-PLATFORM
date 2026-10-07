const SavingsGoal = require('../models/SavingsGoal');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// @desc    Get savings goals
// @route   GET /api/savings
// @access  Private
const getGoals = async (req, res, next) => {
  try {
    const goals = await SavingsGoal.find({ user: req.user._id }).sort({ deadline: 1 });
    res.json({ success: true, count: goals.length, goals });
  } catch (error) {
    next(error);
  }
};

// @desc    Create savings goal
// @route   POST /api/savings
// @access  Private
const createGoal = async (req, res, next) => {
  try {
    const { name, targetAmount, deadline, category } = req.body;

    const goal = await SavingsGoal.create({
      user: req.user._id,
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0.0,
      deadline: new Date(deadline),
      category: category || 'General'
    });

    res.status(201).json({ success: true, message: 'Savings goal created', goal });
  } catch (error) {
    next(error);
  }
};

// @desc    Deposit / Add money to savings goal
// @route   POST /api/savings/:id/add-money
// @access  Private
const addMoneyToGoal = async (req, res, next) => {
  try {
    const { accountId, amount } = req.body;
    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Savings goal not found' });

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const account = await Account.findOne({ _id: accountId, user: req.user._id });
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });

    if (account.availableBalance < parsedAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient account balance' });
    }

    // Deduct from account balance
    account.balance -= parsedAmount;
    account.availableBalance -= parsedAmount;
    await account.save();

    goal.currentAmount += parsedAmount;
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'Completed';
    }
    await goal.save();

    await Transaction.create({
      user: req.user._id,
      account: account._id,
      type: 'Transfer',
      amount: parsedAmount,
      currency: account.currency || 'USD',
      status: 'Completed',
      description: `Transfer to Savings Goal: ${goal.name}`,
      category: 'Savings',
      referenceNumber: 'FN-SVG-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date()
    });

    res.json({
      success: true,
      message: `Added $${parsedAmount.toFixed(2)} to ${goal.name}`,
      goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete savings goal
// @route   DELETE /api/savings/:id
// @access  Private
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Savings goal not found' });

    res.json({ success: true, message: 'Goal removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoals,
  createGoal,
  addMoneyToGoal,
  deleteGoal
};
