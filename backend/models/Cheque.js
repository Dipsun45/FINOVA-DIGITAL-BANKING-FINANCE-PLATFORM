const mongoose = require('mongoose');

const chequeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    chequeType: { type: String, enum: ['Deposit', 'Withdrawal'], required: true },
    chequeNumber: { type: String, required: true },
    bankName: { type: String, required: true },
    payeeName: { type: String, required: true },
    drawerName: { type: String, default: '' },
    accountNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    issueDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Cleared'], default: 'Pending' },
    rejectionReason: { type: String, default: '' },
    chequeImage: { type: String, default: '' },
    signatureUrl: { type: String, default: '' },
    referenceNumber: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cheque', chequeSchema);
