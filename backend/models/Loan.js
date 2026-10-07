const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    loanType: { type: String, enum: ['Personal Loan', 'Home Loan', 'Auto Loan', 'Student Loan', 'Business Loan'], default: 'Personal Loan' },
    amount: { type: Number, required: true },
    interestRate: { type: Number, required: true }, // e.g. 7.5%
    durationMonths: { type: Number, required: true },
    monthlyEMI: { type: Number, required: true },
    totalInterest: { type: Number, required: true },
    totalPayment: { type: Number, required: true },
    remainingAmount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Active', 'Paid'], default: 'Pending' },
    repaymentSchedule: [
      {
        month: Number,
        dueDate: Date,
        amount: Number,
        principal: Number,
        interest: Number,
        status: { type: String, enum: ['Pending', 'Paid', 'Overdue'], default: 'Pending' }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Loan', loanSchema);
