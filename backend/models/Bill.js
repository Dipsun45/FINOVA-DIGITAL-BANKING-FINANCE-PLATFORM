const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    billerName: { type: String, required: true },
    category: {
      type: String,
      enum: ['Electricity', 'Water', 'Internet', 'Mobile', 'Insurance', 'Credit Card', 'Education', 'Rent', 'Other'],
      required: true
    },
    accountNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    isRecurring: { type: Boolean, default: false },
    autoPay: { type: Boolean, default: false },
    status: { type: String, enum: ['Unpaid', 'Paid', 'Scheduled'], default: 'Unpaid' },
    lastPaidDate: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bill', billSchema);
