const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: {
      type: String,
      enum: ['Food', 'Shopping', 'Transport', 'Entertainment', 'Bills', 'Education', 'Healthcare', 'Travel', 'Subscriptions', 'Other'],
      required: true
    },
    amount: { type: Number, required: true }, // Budget Limit
    spent: { type: Number, default: 0.0 },
    month: { type: String, default: () => new Date().toLocaleString('default', { month: 'long' }) },
    year: { type: Number, default: () => new Date().getFullYear() }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Budget', budgetSchema);
