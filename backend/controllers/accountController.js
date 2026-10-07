const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// @desc    Get user accounts
// @route   GET /api/accounts
// @access  Private
const getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find({ user: req.user._id });
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    res.json({
      success: true,
      count: accounts.length,
      totalBalance,
      accounts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single account details
// @route   GET /api/accounts/:id
// @access  Private
const getAccountById = async (req, res, next) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, user: req.user._id });
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });

    const transactions = await Transaction.find({ account: account._id }).sort({ createdAt: -1 }).limit(20);

    res.json({
      success: true,
      account,
      transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new account (Checking, Savings, Business, Investment)
// @route   POST /api/accounts
// @access  Private
const createAccount = async (req, res, next) => {
  try {
    const { accountType, initialBalance } = req.body;

    const prefix = accountType === 'Savings Account' ? 'SAV' : accountType === 'Business Account' ? 'BUS' : accountType === 'Investment Account' ? 'INV' : 'CHK';
    const accountNumber = `FN-${prefix}-` + Math.floor(100000000 + Math.random() * 900000000);
    const balance = parseFloat(initialBalance) || 0;

    const account = await Account.create({
      user: req.user._id,
      accountNumber,
      accountType: accountType || 'Checking Account',
      balance,
      availableBalance: balance
    });

    if (balance > 0) {
      await Transaction.create({
        user: req.user._id,
        account: account._id,
        type: 'Deposit',
        amount: balance,
        status: 'Completed',
        description: `Initial Deposit for new ${account.accountType}`,
        category: 'Deposit',
        referenceNumber: 'FN-DEP-' + Math.floor(100000 + Math.random() * 900000)
      });
    }

    res.status(201).json({
      success: true,
      message: `${accountType} opened successfully`,
      account
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAccounts,
  getAccountById,
  createAccount
};
