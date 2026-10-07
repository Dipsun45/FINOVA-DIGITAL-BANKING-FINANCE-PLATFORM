const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fromAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    toAccount: { type: String, required: true }, // Account Number or Target ID
    recipientName: { type: String, required: true },
    amount: { type: Number, required: true },
    fee: { type: Number, default: 0.0 },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    transferType: {
      type: String,
      enum: ['Internal Transfer', 'Bank Transfer', 'International Transfer', 'Scheduled Transfer'],
      default: 'Internal Transfer'
    },
    description: { type: String, default: '' },
    referenceNumber: { type: String, required: true, unique: true },
    status: { type: String, enum: ['Completed', 'Pending', 'Failed'], default: 'Completed' },
    scheduledDate: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transfer', transferSchema);
