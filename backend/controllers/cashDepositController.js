const CashDeposit = require('../models/CashDeposit');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const AdminLog = require('../models/AdminLog');
const { notifyUser } = require('../services/socketService');

// @desc    Submit cash deposit slip & credit account
// @route   POST /api/cash-deposits
// @access  Private
const submitCashDepositSlip = async (req, res, next) => {
  try {
    const { accountId, depositorName, depositorPhone, denominations, branchCode, remark } = req.body;

    const account = await Account.findOne({ _id: accountId, user: req.user._id });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    const denom = denominations || {};
    const d2000 = parseInt(denom.d2000) || 0;
    const d500 = parseInt(denom.d500) || 0;
    const d200 = parseInt(denom.d200) || 0;
    const d100 = parseInt(denom.d100) || 0;
    const d50 = parseInt(denom.d50) || 0;
    const d20 = parseInt(denom.d20) || 0;
    const d10 = parseInt(denom.d10) || 0;

    const calculatedTotal = (d2000 * 2000) + (d500 * 500) + (d200 * 200) + (d100 * 100) + (d50 * 50) + (d20 * 20) + (d10 * 10);

    let finalAmount = calculatedTotal;
    if (finalAmount <= 0) {
      // If direct totalAmount was passed without denomination counts
      const rawTotal = parseFloat(req.body.totalAmount);
      if (!isNaN(rawTotal) && rawTotal > 0) {
        finalAmount = rawTotal;
      } else {
        return res.status(400).json({ success: false, message: 'Please enter valid cash denomination counts or amount' });
      }
    }

    const slipNumber = 'SLIP-' + Math.floor(10000000 + Math.random() * 90000000);

    // Credit account balance
    account.balance += finalAmount;
    account.availableBalance += finalAmount;
    await account.save();

    const slip = await CashDeposit.create({
      user: req.user._id,
      account: account._id,
      slipNumber,
      depositorName: depositorName || req.user.fullName,
      depositorPhone: depositorPhone || req.user.phone,
      denominations: { d2000, d500, d200, d100, d50, d20, d10 },
      totalAmount: finalAmount,
      branchCode: branchCode || 'FN-MAIN-001',
      remark: remark || 'Cash Deposit in Account',
      status: 'Completed'
    });

    await Transaction.create({
      user: req.user._id,
      account: account._id,
      type: 'Deposit',
      amount: finalAmount,
      currency: 'USD',
      status: 'Completed',
      description: `Cash Deposit Slip #${slipNumber}`,
      category: 'Cash Deposit',
      referenceNumber: slipNumber,
      senderName: depositorName || req.user.fullName
    });

    const notif = await Notification.create({
      user: req.user._id,
      title: 'Cash Deposit Successful!',
      message: `Cash deposit of $${finalAmount.toLocaleString()} credited to account ${account.accountNumber}. Slip #${slipNumber}.`,
      type: 'transaction'
    });
    notifyUser(req.user._id.toString(), notif);

    res.status(201).json({
      success: true,
      message: 'Cash deposit slip processed & cash deposited successfully',
      slip,
      account
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's cash deposit slips
// @route   GET /api/cash-deposits
// @access  Private
const getUserCashDeposits = async (req, res, next) => {
  try {
    const slips = await CashDeposit.find({ user: req.user._id })
      .populate('account', 'accountNumber accountType')
      .sort({ createdAt: -1 });

    res.json({ success: true, slips });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all cash deposit slips (Admin)
// @route   GET /api/cash-deposits/admin/all
// @access  Private/Admin
const getAllCashDeposits = async (req, res, next) => {
  try {
    const slips = await CashDeposit.find()
      .populate('user', 'fullName email phone')
      .populate('account', 'accountNumber accountType')
      .sort({ createdAt: -1 });

    res.json({ success: true, slips });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitCashDepositSlip,
  getUserCashDeposits,
  getAllCashDeposits
};
