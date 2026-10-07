const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    accountNumber: { type: String, required: true, unique: true, index: true },
    accountType: {
      type: String,
      enum: ['Checking Account', 'Savings Account', 'Business Account', 'Investment Account'],
      default: 'Checking Account'
    },
    balance: { type: Number, default: 0.0, required: true },
    availableBalance: { type: Number, default: 0.0 },
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: ['Active', 'Frozen', 'Closed'], default: 'Active' },
    interestRate: { type: Number, default: 0.05 } // 5% APY for savings
  },
  { timestamps: true }
);

module.exports = mongoose.model('Account', accountSchema);
