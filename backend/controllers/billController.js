const Bill = require('../models/Bill');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { notifyUser } = require('../services/socketService');

// @desc    Get user bills
// @route   GET /api/bills
// @access  Private
const getBills = async (req, res, next) => {
  try {
    const bills = await Bill.find({ user: req.user._id }).sort({ dueDate: 1 });
    res.json({ success: true, count: bills.length, bills });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new biller / bill
// @route   POST /api/bills
// @access  Private
const createBill = async (req, res, next) => {
  try {
    const { billerName, category, accountNumber, amount, dueDate, isRecurring, autoPay } = req.body;

    const bill = await Bill.create({
      user: req.user._id,
      billerName,
      category,
      accountNumber,
      amount: parseFloat(amount),
      dueDate: new Date(dueDate),
      isRecurring: !!isRecurring,
      autoPay: !!autoPay
    });

    res.status(201).json({ success: true, message: 'Bill added successfully', bill });
  } catch (error) {
    next(error);
  }
};

// @desc    Pay a bill
// @route   POST /api/bills/:id/pay
// @access  Private
const payBill = async (req, res, next) => {
  try {
    const { accountId } = req.body;
    const bill = await Bill.findOne({ _id: req.params.id, user: req.user._id });
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });

    if (bill.status === 'Paid') {
      return res.status(400).json({ success: false, message: 'Bill is already paid' });
    }

    const account = await Account.findOne({ _id: accountId, user: req.user._id });
    if (!account) return res.status(404).json({ success: false, message: 'Payment account not found' });

    if (account.availableBalance < bill.amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance to pay bill of $${bill.amount.toFixed(2)}. Available: $${account.availableBalance.toFixed(2)}`
      });
    }

    // Deduct balance
    account.balance -= bill.amount;
    account.availableBalance -= bill.amount;
    await account.save();

    bill.status = 'Paid';
    bill.lastPaidDate = new Date();
    await bill.save();

    const refNum = 'FN-BILL-' + Math.floor(100000 + Math.random() * 900000);

    const transaction = await Transaction.create({
      user: req.user._id,
      account: account._id,
      type: 'Bill Payment',
      amount: bill.amount,
      currency: account.currency || 'USD',
      status: 'Completed',
      description: `Bill Payment: ${bill.billerName} (${bill.category})`,
      category: 'Bills',
      referenceNumber: refNum,
      date: new Date()
    });

    const notif = await Notification.create({
      user: req.user._id,
      title: 'Bill Paid Successfully',
      message: `Paid $${bill.amount.toFixed(2)} to ${bill.billerName}. Ref: ${refNum}`,
      type: 'transaction'
    });
    notifyUser(req.user._id.toString(), notif);

    res.json({
      success: true,
      message: `Bill of $${bill.amount.toFixed(2)} paid to ${bill.billerName}`,
      bill,
      transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete bill
// @route   DELETE /api/bills/:id
// @access  Private
const deleteBill = async (req, res, next) => {
  try {
    const bill = await Bill.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });

    res.json({ success: true, message: 'Bill removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBills,
  createBill,
  payBill,
  deleteBill
};
