const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Notification = require('../models/Notification');
const { notifyUser } = require('../services/socketService');

// @desc    Get user transactions with search, filter, pagination
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const { search, type, status, category, page = 1, limit = 20 } = req.query;

    const query = { user: req.user._id };

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { referenceNumber: { $regex: search, $options: 'i' } },
        { recipientName: { $regex: search, $options: 'i' } }
      ];
    }

    if (type && type !== 'All') query.type = type;
    if (status && status !== 'All') query.status = status;
    if (category && category !== 'All') query.category = category;

    const skip = (page - 1) * limit;
    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('account', 'accountNumber accountType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: transactions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id })
      .populate('account', 'accountNumber accountType balance');
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });

    res.json({ success: true, transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Demo Deposit Money
// @route   POST /api/transactions/deposit
// @access  Private
const deposit = async (req, res, next) => {
  try {
    const { accountId, amount, depositMethod = 'Demo Deposit', description = 'Demo Cash Deposit' } = req.body;

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid deposit amount' });
    }

    const account = await Account.findOne({ _id: accountId, user: req.user._id });
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });

    // Update account balance
    account.balance += parsedAmount;
    account.availableBalance += parsedAmount;
    await account.save();

    const refNum = 'FN-DEP-' + Date.now().toString().slice(-6) + Math.floor(100 + Math.random() * 900);

    const transaction = await Transaction.create({
      user: req.user._id,
      account: account._id,
      type: 'Deposit',
      amount: parsedAmount,
      currency: account.currency || 'USD',
      status: 'Completed',
      description: `${depositMethod}: ${description}`,
      category: 'Deposit',
      referenceNumber: refNum,
      date: new Date()
    });

    const notif = await Notification.create({
      user: req.user._id,
      title: 'Deposit Successful',
      message: `Deposit of $${parsedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} to ${account.accountType} (${account.accountNumber.slice(-4)}) completed. Ref: ${refNum}`,
      type: 'transaction'
    });
    notifyUser(req.user._id.toString(), notif);

    res.status(201).json({
      success: true,
      message: `Successfully deposited $${parsedAmount.toFixed(2)}`,
      accountBalance: account.balance,
      transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Withdraw Money
// @route   POST /api/transactions/withdraw
// @access  Private
const withdraw = async (req, res, next) => {
  try {
    const { accountId, amount, withdrawMethod = 'ATM Withdrawal', description = 'Cash Withdrawal' } = req.body;

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid withdrawal amount' });
    }

    const account = await Account.findOne({ _id: accountId, user: req.user._id });
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });

    if (account.availableBalance < parsedAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient funds. Available balance is $${account.availableBalance.toFixed(2)}`
      });
    }

    // Update balance
    account.balance -= parsedAmount;
    account.availableBalance -= parsedAmount;
    await account.save();

    const refNum = 'FN-WTH-' + Date.now().toString().slice(-6) + Math.floor(100 + Math.random() * 900);

    const transaction = await Transaction.create({
      user: req.user._id,
      account: account._id,
      type: 'Withdrawal',
      amount: parsedAmount,
      currency: account.currency || 'USD',
      status: 'Completed',
      description: `${withdrawMethod}: ${description}`,
      category: 'Withdrawal',
      referenceNumber: refNum,
      date: new Date()
    });

    const notif = await Notification.create({
      user: req.user._id,
      title: 'Withdrawal Processed',
      message: `Withdrawal of $${parsedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} from ${account.accountType} (${account.accountNumber.slice(-4)}) processed. Ref: ${refNum}`,
      type: 'transaction'
    });
    notifyUser(req.user._id.toString(), notif);

    res.status(201).json({
      success: true,
      message: `Successfully withdrew $${parsedAmount.toFixed(2)}`,
      accountBalance: account.balance,
      transaction
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  deposit,
  withdraw
};
