const FixedDeposit = require('../models/FixedDeposit');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const AdminLog = require('../models/AdminLog');
const { notifyUser } = require('../services/socketService');

// Helper to get FD interest rate by tenure
const getInterestRate = (months) => {
  if (months <= 6) return 6.0;
  if (months <= 12) return 7.0;
  if (months <= 36) return 7.5;
  return 8.0;
};

// @desc    Create / Open a Fixed Deposit
// @route   POST /api/fixed-deposits
// @access  Private
const createFixedDeposit = async (req, res, next) => {
  try {
    const { accountId, principalAmount, tenureMonths, payoutFrequency, nomineeName, nomineeRelation, nomineeAge, autoRenewal } = req.body;

    const account = await Account.findOne({ _id: accountId, user: req.user._id });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Source funding account not found' });
    }

    const principal = parseFloat(principalAmount);
    if (isNaN(principal) || principal < 100) {
      return res.status(400).json({ success: false, message: 'Minimum Fixed Deposit amount is $100' });
    }

    if (account.balance < principal) {
      return res.status(400).json({ success: false, message: 'Insufficient balance in selected funding account' });
    }

    const tenure = parseInt(tenureMonths) || 12;
    const interestRate = getInterestRate(tenure);

    // Calculate Maturity Amount
    const totalInterest = principal * (interestRate / 100) * (tenure / 12);
    const maturityAmount = parseFloat((principal + totalInterest).toFixed(2));

    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + tenure);

    const fdNumber = 'FD-' + Math.floor(10000000 + Math.random() * 90000000);

    // Deduct principal from account
    account.balance -= principal;
    account.availableBalance -= principal;
    await account.save();

    // Create FD Record
    const fd = await FixedDeposit.create({
      user: req.user._id,
      account: account._id,
      fdNumber,
      principalAmount: principal,
      tenureMonths: tenure,
      interestRate,
      payoutFrequency: payoutFrequency || 'On Maturity',
      maturityAmount,
      maturityDate,
      startDate: new Date(),
      nomineeName: nomineeName || 'Not Specified',
      nomineeRelation: nomineeRelation || 'Self/Family',
      nomineeAge: parseInt(nomineeAge) || 25,
      autoRenewal: !!autoRenewal,
      status: 'Active'
    });

    // Record Transaction
    await Transaction.create({
      user: req.user._id,
      account: account._id,
      type: 'Investment',
      amount: principal,
      currency: 'USD',
      status: 'Completed',
      description: `Fixed Deposit Creation #${fdNumber} (${tenure} Mos @ ${interestRate}%)`,
      category: 'Fixed Deposit',
      referenceNumber: fdNumber,
      recipientName: 'Finova Fixed Deposit Pool'
    });

    // Send Notification
    const notif = await Notification.create({
      user: req.user._id,
      title: 'Fixed Deposit Created Successfully!',
      message: `Your FD #${fdNumber} of $${principal.toLocaleString()} at ${interestRate}% p.a. has been opened. Maturity value: $${maturityAmount.toLocaleString()}.`,
      type: 'system'
    });
    notifyUser(req.user._id.toString(), notif);

    res.status(201).json({
      success: true,
      message: 'Fixed Deposit created successfully',
      fixedDeposit: fd
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's Fixed Deposits
// @route   GET /api/fixed-deposits
// @access  Private
const getUserFixedDeposits = async (req, res, next) => {
  try {
    const fixedDeposits = await FixedDeposit.find({ user: req.user._id })
      .populate('account', 'accountNumber accountType')
      .sort({ createdAt: -1 });

    res.json({ success: true, fixedDeposits });
  } catch (error) {
    next(error);
  }
};

// @desc    Prematurely Close / Break Fixed Deposit
// @route   PUT /api/fixed-deposits/:id/withdraw
// @access  Private
const withdrawFixedDeposit = async (req, res, next) => {
  try {
    const fd = await FixedDeposit.findOne({ _id: req.params.id, user: req.user._id });
    if (!fd) return res.status(404).json({ success: false, message: 'Fixed Deposit record not found' });

    if (fd.status !== 'Active') {
      return res.status(400).json({ success: false, message: `Fixed Deposit is already ${fd.status}` });
    }

    const account = await Account.findById(fd.account);
    if (!account) return res.status(404).json({ success: false, message: 'Linked refund account not found' });

    // Calculate elapsed tenure & prorated interest with 1% premature penalty
    const now = new Date();
    const elapsedMs = now - new Date(fd.startDate);
    const elapsedDays = Math.max(1, Math.floor(elapsedMs / (1000 * 60 * 60 * 24)));
    const elapsedYears = elapsedDays / 365;

    const penaltyRate = Math.max(0, fd.interestRate - 1.0);
    const earnedInterest = fd.principalAmount * (penaltyRate / 100) * elapsedYears;
    const refundAmount = parseFloat((fd.principalAmount + earnedInterest).toFixed(2));

    // Update account balance
    account.balance += refundAmount;
    account.availableBalance += refundAmount;
    await account.save();

    fd.status = 'Broken';
    fd.closureDate = now;
    await fd.save();

    await Transaction.create({
      user: req.user._id,
      account: account._id,
      type: 'Deposit',
      amount: refundAmount,
      currency: 'USD',
      status: 'Completed',
      description: `Premature Closure Refund for FD #${fd.fdNumber}`,
      category: 'Fixed Deposit',
      referenceNumber: 'REF-' + fd.fdNumber
    });

    const notif = await Notification.create({
      user: req.user._id,
      title: 'Fixed Deposit Closed',
      message: `FD #${fd.fdNumber} closed prematurely. Total refund of $${refundAmount.toLocaleString()} credited to your account.`,
      type: 'transaction'
    });
    notifyUser(req.user._id.toString(), notif);

    res.json({
      success: true,
      message: 'Fixed Deposit broken & refund credited to account successfully',
      fixedDeposit: fd,
      refundAmount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Fixed Deposits (Admin)
// @route   GET /api/fixed-deposits/admin/all
// @access  Private/Admin
const getAllFixedDeposits = async (req, res, next) => {
  try {
    const fixedDeposits = await FixedDeposit.find()
      .populate('user', 'fullName email phone')
      .populate('account', 'accountNumber accountType')
      .sort({ createdAt: -1 });

    res.json({ success: true, fixedDeposits });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFixedDeposit,
  getUserFixedDeposits,
  withdrawFixedDeposit,
  getAllFixedDeposits
};
