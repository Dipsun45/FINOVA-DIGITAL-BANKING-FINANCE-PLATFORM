const mongoose = require('mongoose');

const cashDepositSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    slipNumber: { type: String, required: true, unique: true },
    depositorName: { type: String, required: true },
    depositorPhone: { type: String, default: '' },
    denominations: {
      d2000: { type: Number, default: 0 },
      d500: { type: Number, default: 0 },
      d200: { type: Number, default: 0 },
      d100: { type: Number, default: 0 },
      d50: { type: Number, default: 0 },
      d20: { type: Number, default: 0 },
      d10: { type: Number, default: 0 }
    },
    totalAmount: { type: Number, required: true },
    branchCode: { type: String, default: 'FN-MAIN-001' },
    remark: { type: String, default: 'Cash Deposit into Account' },
    status: { type: String, enum: ['Completed', 'Pending', 'Rejected'], default: 'Completed' },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CashDeposit', cashDepositSchema);
