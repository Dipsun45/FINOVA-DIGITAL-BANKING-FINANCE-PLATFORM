const Transfer = require('../models/Transfer');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { notifyUser } = require('../services/socketService');

// @desc    Process money transfer (Internal, Bank, International)
// @route   POST /api/transfers
// @access  Private
const createTransfer = async (req, res, next) => {
  try {
    const { fromAccountId, recipientAccount, recipientName, amount, transferType, description } = req.body;

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid transfer amount' });
    }

    const fromAccount = await Account.findOne({ _id: fromAccountId, user: req.user._id });
    if (!fromAccount) return res.status(404).json({ success: false, message: 'Source account not found' });

    // Calculate fee based on transfer type
    let fee = 0;
    if (transferType === 'Bank Transfer') fee = 1.50;
    if (transferType === 'International Transfer') fee = 5.00;

    const totalDeduction = parsedAmount + fee;

    if (fromAccount.availableBalance < totalDeduction) {
      return res.status(400).json({
        success: false,
        message: `Insufficient funds. Required $${totalDeduction.toFixed(2)} (including $${fee.toFixed(2)} fee). Available: $${fromAccount.availableBalance.toFixed(2)}`
      });
    }

    // Reference number generator
    const refNum = 'FN-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000);

    // Perform atomic balance deduction on sender
    fromAccount.balance -= totalDeduction;
    fromAccount.availableBalance -= totalDeduction;
    await fromAccount.save();

    // Check if recipient account is an internal Finova account
    const internalRecipientAcc = await Account.findOne({ accountNumber: recipientAccount });
    if (internalRecipientAcc) {
      internalRecipientAcc.balance += parsedAmount;
      internalRecipientAcc.availableBalance += parsedAmount;
      await internalRecipientAcc.save();

      // Create transaction record for recipient
      await Transaction.create({
        user: internalRecipientAcc.user,
        account: internalRecipientAcc._id,
        type: 'Transfer',
        amount: parsedAmount,
        currency: internalRecipientAcc.currency || 'USD',
        status: 'Completed',
        description: `Transfer received from ${req.user.fullName}`,
        category: 'Transfer',
        referenceNumber: refNum + '-IN',
        senderName: req.user.fullName,
        date: new Date()
      });

      // Notify recipient
      const recNotif = await Notification.create({
        user: internalRecipientAcc.user,
        title: 'Money Received',
        message: `You received $${parsedAmount.toFixed(2)} from ${req.user.fullName}. Ref: ${refNum}`,
        type: 'transaction'
      });
      notifyUser(internalRecipientAcc.user.toString(), recNotif);
    }

    // Create Sender Transaction record
    const senderTx = await Transaction.create({
      user: req.user._id,
      account: fromAccount._id,
      type: 'Transfer',
      amount: parsedAmount,
      currency: fromAccount.currency || 'USD',
      status: 'Completed',
      description: `Transfer to ${recipientName} (${transferType})`,
      category: 'Transfer',
      referenceNumber: refNum,
      recipientName,
      recipientAccount,
      date: new Date()
    });

    // Create Transfer Record
    const transferRecord = await Transfer.create({
      user: req.user._id,
      fromAccount: fromAccount._id,
      toAccount: recipientAccount,
      recipientName,
      amount: parsedAmount,
      fee,
      totalAmount: totalDeduction,
      currency: fromAccount.currency || 'USD',
      transferType: transferType || 'Internal Transfer',
      description,
      referenceNumber: refNum,
      status: 'Completed'
    });

    // Sender notification
    const senderNotif = await Notification.create({
      user: req.user._id,
      title: 'Transfer Completed',
      message: `Successfully transferred $${parsedAmount.toFixed(2)} to ${recipientName}. Ref: ${refNum}`,
      type: 'transaction'
    });
    notifyUser(req.user._id.toString(), senderNotif);

    res.status(201).json({
      success: true,
      message: 'Transfer executed successfully',
      referenceNumber: refNum,
      fee,
      totalDeduction,
      transfer: transferRecord,
      transaction: senderTx
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transfer history
// @route   GET /api/transfers
// @access  Private
const getTransfers = async (req, res, next) => {
  try {
    const transfers = await Transfer.find({ user: req.user._id })
      .populate('fromAccount', 'accountNumber accountType')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: transfers.length, transfers });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransfer,
  getTransfers
};
