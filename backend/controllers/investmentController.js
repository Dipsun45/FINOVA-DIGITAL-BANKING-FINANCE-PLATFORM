const Investment = require('../models/Investment');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// @desc    Get user investment portfolio
// @route   GET /api/investments
// @access  Private
const getInvestments = async (req, res, next) => {
  try {
    const investments = await Investment.find({ user: req.user._id });

    const totalInvested = investments.reduce((sum, item) => sum + item.amountInvested, 0);
    const totalCurrentValue = investments.reduce((sum, item) => sum + item.currentValue, 0);
    const totalProfitLoss = totalCurrentValue - totalInvested;
    const totalReturnPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    res.json({
      success: true,
      count: investments.length,
      portfolioSummary: {
        totalInvested,
        totalCurrentValue,
        totalProfitLoss,
        totalReturnPercentage
      },
      investments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Buy Simulated Asset
// @route   POST /api/investments/buy
// @access  Private
const buyAsset = async (req, res, next) => {
  try {
    const { accountId, assetName, symbol, assetType, shares, pricePerShare } = req.body;

    const numShares = parseFloat(shares);
    const price = parseFloat(pricePerShare);
    const totalCost = numShares * price;

    const account = await Account.findOne({ _id: accountId, user: req.user._id });
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });

    if (account.availableBalance < totalCost) {
      return res.status(400).json({ success: false, message: `Insufficient balance ($${totalCost.toFixed(2)} required)` });
    }

    account.balance -= totalCost;
    account.availableBalance -= totalCost;
    await account.save();

    let asset = await Investment.findOne({ user: req.user._id, symbol });
    if (asset) {
      asset.shares += numShares;
      asset.amountInvested += totalCost;
      asset.currentValue += totalCost;
      await asset.save();
    } else {
      asset = await Investment.create({
        user: req.user._id,
        assetName,
        symbol,
        assetType,
        shares: numShares,
        purchasePrice: price,
        currentPrice: price,
        amountInvested: totalCost,
        currentValue: totalCost,
        profitLoss: 0.0,
        returnPercentage: 0.0
      });
    }

    await Transaction.create({
      user: req.user._id,
      account: account._id,
      type: 'Investment',
      amount: totalCost,
      currency: account.currency || 'USD',
      status: 'Completed',
      description: `Bought ${numShares} shares of ${symbol} (${assetName})`,
      category: 'Investment',
      referenceNumber: 'FN-INV-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date()
    });

    res.status(201).json({ success: true, message: `Successfully purchased ${numShares} ${symbol}`, asset });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvestments,
  buyAsset
};
