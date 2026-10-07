const Cheque = require('../models/Cheque');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const AdminLog = require('../models/AdminLog');
const { notifyUser } = require('../services/socketService');

// @desc    Submit cheque for deposit or withdrawal
// @route   POST /api/cheques
// @access  Private
const submitCheque = async (req, res, next) => {
  try {
    const { accountId, chequeType, chequeNumber, bankName, payeeName, drawerName, amount, chequeImage } = req.body;

    const account = await Account.findOne({ _id: accountId, user: req.user._id });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid cheque amount' });
    }

    // If cheque withdrawal, check if sufficient balance
    if (chequeType === 'Withdrawal' && account.balance < numericAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient account balance for cheque withdrawal' });
    }

    const referenceNumber = 'CHQ-' + Math.floor(10000000 + Math.random() * 90000000);

    const cheque = await Cheque.create({
      user: req.user._id,
      account: account._id,
      chequeType: chequeType || 'Deposit',
      chequeNumber,
      bankName: bankName || 'Finova Digital Bank',
      payeeName,
      drawerName: drawerName || req.user.fullName,
      accountNumber: account.accountNumber,
      amount: numericAmount,
      chequeImage: chequeImage || '',
      referenceNumber,
      status: 'Pending'
    });

    const notif = await Notification.create({
      user: req.user._id,
      title: `Cheque ${chequeType} Submitted`,
      message: `Your cheque #${chequeNumber} for $${numericAmount.toLocaleString()} has been submitted for clearance.`,
      type: 'transaction'
    });
    notifyUser(req.user._id.toString(), notif);

    res.status(201).json({
      success: true,
      message: `Cheque ${chequeType.toLowerCase()} submitted successfully. Pending bank clearance.`,
      cheque
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's submitted cheques
// @route   GET /api/cheques
// @access  Private
const getUserCheques = async (req, res, next) => {
  try {
    const cheques = await Cheque.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, cheques });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all cheques (Admin)
// @route   GET /api/cheques/admin/all
// @access  Private/Admin
const getAllCheques = async (req, res, next) => {
  try {
    const cheques = await Cheque.find().populate('user', 'fullName email phone').populate('account', 'accountNumber accountType').sort({ createdAt: -1 });
    res.json({ success: true, cheques });
  } catch (error) {
    next(error);
  }
};

// @desc    Process/Approve/Reject Cheque (Admin)
// @route   PUT /api/cheques/admin/:id
// @access  Private/Admin
const processCheque = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body; // Approved, Rejected
    const cheque = await Cheque.findById(req.params.id);
    if (!cheque) return res.status(404).json({ success: false, message: 'Cheque record not found' });

    if (cheque.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Cheque is already ${cheque.status}` });
    }

    const account = await Account.findById(cheque.account);
    if (!account) return res.status(404).json({ success: false, message: 'Associated account not found' });

    cheque.status = status;
    if (rejectionReason) cheque.rejectionReason = rejectionReason;

    if (status === 'Approved') {
      if (cheque.chequeType === 'Deposit') {
        account.balance += cheque.amount;
        account.availableBalance += cheque.amount;
        await account.save();

        await Transaction.create({
          user: cheque.user,
          account: account._id,
          type: 'Deposit',
          amount: cheque.amount,
          currency: 'USD',
          status: 'Completed',
          description: `Cheque Deposit Clearing #${cheque.chequeNumber}`,
          category: 'Deposit',
          referenceNumber: cheque.referenceNumber,
          senderName: cheque.bankName,
          recipientName: cheque.payeeName
        });
      } else if (cheque.chequeType === 'Withdrawal') {
        if (account.balance < cheque.amount) {
          cheque.status = 'Rejected';
          cheque.rejectionReason = 'Insufficient funds at clearing';
          await cheque.save();
          return res.status(400).json({ success: false, message: 'Insufficient funds in user account' });
        }
        account.balance -= cheque.amount;
        account.availableBalance -= cheque.amount;
        await account.save();

        await Transaction.create({
          user: cheque.user,
          account: account._id,
          type: 'Withdrawal',
          amount: cheque.amount,
          currency: 'USD',
          status: 'Completed',
          description: `Cheque Cash Withdrawal Clearance #${cheque.chequeNumber}`,
          category: 'Withdrawal',
          referenceNumber: cheque.referenceNumber,
          recipientName: cheque.payeeName
        });
      }
    }

    await cheque.save();

    const notif = await Notification.create({
      user: cheque.user,
      title: `Cheque ${cheque.chequeNumber} ${status}`,
      message: `Your cheque ${cheque.chequeType.toLowerCase()} of $${cheque.amount.toLocaleString()} was ${status.toLowerCase()}.${status === 'Rejected' ? ' Reason: ' + cheque.rejectionReason : ''}`,
      type: 'transaction'
    });
    notifyUser(cheque.user.toString(), notif);

    await AdminLog.create({
      actor: req.user._id,
      actorName: req.user.fullName,
      action: `${status} Cheque`,
      target: cheque.chequeNumber,
      ip: req.ip || '127.0.0.1',
      description: `Admin ${status.toLowerCase()} cheque #${cheque.chequeNumber} for amount $${cheque.amount}`
    });

    res.json({ success: true, message: `Cheque ${status.toLowerCase()} successfully`, cheque });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitCheque,
  getUserCheques,
  getAllCheques,
  processCheque
};
