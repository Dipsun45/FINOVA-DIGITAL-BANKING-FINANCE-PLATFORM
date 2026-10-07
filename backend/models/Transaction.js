const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true, index: true },
    type: {
      type: String,
      enum: ['Deposit', 'Withdrawal', 'Transfer', 'Payment', 'Refund', 'Salary', 'Bill Payment', 'Card Payment', 'Loan Payment', 'Investment'],
      required: true
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Cancelled'], default: 'Completed' },
    description: { type: String, required: true },
    category: { type: String, default: 'General' },
    referenceNumber: { type: String, required: true, unique: true, index: true },
    recipientName: { type: String, default: '' },
    recipientAccount: { type: String, default: '' },
    senderName: { type: String, default: '' },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
