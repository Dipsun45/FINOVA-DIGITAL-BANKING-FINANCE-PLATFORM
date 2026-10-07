const Card = require('../models/Card');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { notifyUser } = require('../services/socketService');

// @desc    Get user cards
// @route   GET /api/cards
// @access  Private
const getCards = async (req, res, next) => {
  try {
    const cards = await Card.find({ user: req.user._id }).populate('account', 'accountNumber accountType balance availableBalance');
    res.json({ success: true, count: cards.length, cards });
  } catch (error) {
    next(error);
  }
};

// @desc    Create / Issue virtual or physical ATM card
// @route   POST /api/cards
// @access  Private
const createCard = async (req, res, next) => {
  try {
    const { accountId, cardType = 'Debit', brand = 'Visa', pin = '1234', spendingLimit = 5000 } = req.body;
    const account = await Account.findOne({ _id: accountId, user: req.user._id });
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });

    const cleanPin = (pin && pin.length === 4) ? pin : '1234';

    const card = await Card.create({
      user: req.user._id,
      account: account._id,
      cardNumber: '4821 ' + Math.floor(1000 + Math.random() * 9000) + ' ' + Math.floor(1000 + Math.random() * 9000) + ' ' + Math.floor(1000 + Math.random() * 9000),
      cardHolderName: req.user.fullName.toUpperCase(),
      validThru: '12/29',
      cvv: Math.floor(100 + Math.random() * 900).toString(),
      cardType,
      brand,
      pin: cleanPin,
      spendingLimit: parseFloat(spendingLimit) || 5000,
      cardColor: cardType === 'Credit' ? 'from-amber-600 via-yellow-600 to-yellow-800' : 'from-cyan-600 via-blue-600 to-indigo-800'
    });

    res.status(201).json({ success: true, message: 'ATM Card issued successfully', card });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle freeze/unfreeze or block card
// @route   PUT /api/cards/:id/status
// @access  Private
const updateCardStatus = async (req, res, next) => {
  try {
    const { action } = req.body; // 'freeze', 'unfreeze', 'block'
    const card = await Card.findOne({ _id: req.params.id, user: req.user._id });
    if (!card) return res.status(404).json({ success: false, message: 'Card not found' });

    if (action === 'freeze') card.isFrozen = true;
    if (action === 'unfreeze') card.isFrozen = false;
    if (action === 'block') card.isBlocked = true;

    await card.save();

    res.json({
      success: true,
      message: `Card status updated: ${action}`,
      card
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change Card 4-digit PIN
// @route   PUT /api/cards/:id/pin
// @access  Private
const changePin = async (req, res, next) => {
  try {
    const { newPin } = req.body;
    if (!newPin || newPin.length !== 4) {
      return res.status(400).json({ success: false, message: 'PIN must be exactly 4 digits' });
    }
    const card = await Card.findOne({ _id: req.params.id, user: req.user._id });
    if (!card) return res.status(404).json({ success: false, message: 'Card not found' });

    card.pin = newPin;
    await card.save();

    res.json({ success: true, message: 'Card ATM PIN updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update card spending limits & controls
// @route   PUT /api/cards/:id/settings
// @access  Private
const updateCardSettings = async (req, res, next) => {
  try {
    const { spendingLimit, onlinePaymentsEnabled, internationalPaymentsEnabled } = req.body;
    const card = await Card.findOne({ _id: req.params.id, user: req.user._id });
    if (!card) return res.status(404).json({ success: false, message: 'Card not found' });

    if (spendingLimit !== undefined) card.spendingLimit = spendingLimit;
    if (onlinePaymentsEnabled !== undefined) card.onlinePaymentsEnabled = onlinePaymentsEnabled;
    if (internationalPaymentsEnabled !== undefined) card.internationalPaymentsEnabled = internationalPaymentsEnabled;

    await card.save();
    res.json({ success: true, message: 'Card controls updated successfully', card });
  } catch (error) {
    next(error);
  }
};

// @desc    Withdraw cash from ATM using ATM Card & PIN
// @route   POST /api/cards/atm-withdraw
// @access  Private
const atmWithdraw = async (req, res, next) => {
  try {
    const { cardId, pin, amount, accountId } = req.body;

    const card = await Card.findOne({ _id: cardId, user: req.user._id });
    if (!card) {
      return res.status(404).json({ success: false, message: 'ATM Card not found' });
    }

    if (card.isBlocked) {
      return res.status(403).json({ success: false, message: 'This ATM card has been blocked. Contact bank support.' });
    }

    if (card.isFrozen) {
      return res.status(403).json({ success: false, message: 'This ATM card is frozen. Unfreeze card to use ATM.' });
    }

    // Verify 4-digit PIN
    if (card.pin && card.pin !== pin) {
      return res.status(401).json({ success: false, message: 'Incorrect 4-digit ATM Card PIN' });
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Enter a valid cash withdrawal amount' });
    }

    if (withdrawAmount > (card.spendingLimit || 5000)) {
      return res.status(400).json({ success: false, message: `Exceeds card daily limit of $${card.spendingLimit}` });
    }

    // Find account
    const targetAccountId = accountId || card.account;
    const account = await Account.findOne({ _id: targetAccountId, user: req.user._id });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account linked to ATM card not found' });
    }

    if (account.balance < withdrawAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient account balance for ATM cash withdrawal' });
    }

    // Deduct cash from account balance
    account.balance -= withdrawAmount;
    account.availableBalance -= withdrawAmount;
    await account.save();

    const refNo = 'ATM-' + Math.floor(10000000 + Math.random() * 90000000);

    const transaction = await Transaction.create({
      user: req.user._id,
      account: account._id,
      type: 'Withdrawal',
      amount: withdrawAmount,
      currency: 'USD',
      status: 'Completed',
      description: `ATM Cash Withdrawal (Card ending in ${card.cardNumber.slice(-4)})`,
      category: 'ATM Withdrawal',
      referenceNumber: refNo,
      recipientName: 'Cash Dispenser'
    });

    const notif = await Notification.create({
      user: req.user._id,
      title: 'ATM Cash Withdrawal',
      message: `Cash of $${withdrawAmount.toLocaleString()} withdrawn via ATM Card ending ${card.cardNumber.slice(-4)}. Remaining balance: $${account.balance.toLocaleString()}.`,
      type: 'transaction'
    });
    notifyUser(req.user._id.toString(), notif);

    res.json({
      success: true,
      message: 'ATM cash dispensed successfully!',
      transaction,
      remainingBalance: account.balance
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCards,
  createCard,
  updateCardStatus,
  changePin,
  updateCardSettings,
  atmWithdraw
};
