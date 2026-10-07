const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: {
      type: String,
      enum: ['Food', 'Shopping', 'Transport', 'Entertainment', 'Bills', 'Education', 'Healthcare', 'Travel', 'Subscriptions', 'Other'],
      required: true
    },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
    paymentMethod: { type: String, default: 'Debit Card' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
