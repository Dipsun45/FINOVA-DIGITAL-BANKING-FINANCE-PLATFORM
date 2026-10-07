const mongoose = require('mongoose');

const fixedDepositSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    fdNumber: { type: String, required: true, unique: true },
    principalAmount: { type: Number, required: true },
    tenureMonths: { type: Number, required: true },
    interestRate: { type: Number, required: true }, // % per annum
    payoutFrequency: { type: String, enum: ['Monthly', 'Quarterly', 'On Maturity'], default: 'On Maturity' },
    maturityAmount: { type: Number, required: true },
    maturityDate: { type: Date, required: true },
    startDate: { type: Date, default: Date.now },
    nomineeName: { type: String, required: true },
    nomineeRelation: { type: String, required: true },
    nomineeAge: { type: Number, required: true },
    autoRenewal: { type: Boolean, default: false },
    status: { type: String, enum: ['Active', 'Matured', 'Closed', 'Broken'], default: 'Active' },
    closureDate: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FixedDeposit', fixedDepositSchema);
