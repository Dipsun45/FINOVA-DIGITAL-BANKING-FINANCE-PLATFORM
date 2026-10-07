const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assetName: { type: String, required: true },
    symbol: { type: String, required: true },
    assetType: {
      type: String,
      enum: ['Stocks', 'Mutual Funds', 'ETFs', 'Bonds', 'Crypto', 'Gold'],
      required: true
    },
    amountInvested: { type: Number, required: true },
    currentValue: { type: Number, required: true },
    shares: { type: Number, required: true },
    purchasePrice: { type: Number, required: true },
    currentPrice: { type: Number, required: true },
    profitLoss: { type: Number, required: true },
    returnPercentage: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Investment', investmentSchema);
