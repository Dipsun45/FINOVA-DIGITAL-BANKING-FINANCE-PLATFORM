const Loan = require('../models/Loan');
const Notification = require('../models/Notification');
const { notifyUser } = require('../services/socketService');

// Helper function to calculate EMI
const calculateEMIDetails = (principal, annualRate, months) => {
  const monthlyRate = annualRate / 12 / 100;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;
  return {
    monthlyEMI: parseFloat(emi.toFixed(2)),
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    totalPayment: parseFloat(totalPayment.toFixed(2))
  };
};

// @desc    Calculate Loan EMI endpoint
// @route   POST /api/loans/calculate
// @access  Public / Private
const calculateEMI = (req, res) => {
  const { amount, interestRate, durationMonths } = req.body;
  const P = parseFloat(amount) || 10000;
  const R = parseFloat(interestRate) || 8.5;
  const N = parseInt(durationMonths) || 24;

  const result = calculateEMIDetails(P, R, N);
  res.json({
    success: true,
    amount: P,
    interestRate: R,
    durationMonths: N,
    ...result
  });
};

// @desc    Get user loans
// @route   GET /api/loans
// @access  Private
const getLoans = async (req, res, next) => {
  try {
    const loans = await Loan.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: loans.length, loans });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply for demo loan
// @route   POST /api/loans/apply
// @access  Private
const applyLoan = async (req, res, next) => {
  try {
    const { loanType, amount, interestRate, durationMonths } = req.body;

    const P = parseFloat(amount);
    const R = parseFloat(interestRate) || 8.5;
    const N = parseInt(durationMonths);

    if (!P || P <= 0 || !N || N <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid loan parameters' });
    }

    const { monthlyEMI, totalInterest, totalPayment } = calculateEMIDetails(P, R, N);

    // Generate schedule
    const repaymentSchedule = [];
    const now = new Date();
    for (let i = 1; i <= N; i++) {
      const dueDate = new Date(now.getFullYear(), now.getMonth() + i, 15);
      repaymentSchedule.push({
        month: i,
        dueDate,
        amount: monthlyEMI,
        principal: parseFloat((P / N).toFixed(2)),
        interest: parseFloat((totalInterest / N).toFixed(2)),
        status: 'Pending'
      });
    }

    const loan = await Loan.create({
      user: req.user._id,
      loanType: loanType || 'Personal Loan',
      amount: P,
      interestRate: R,
      durationMonths: N,
      monthlyEMI,
      totalInterest,
      totalPayment,
      remainingAmount: totalPayment,
      status: 'Pending',
      repaymentSchedule
    });

    const notif = await Notification.create({
      user: req.user._id,
      title: 'Loan Application Submitted',
      message: `Your application for a $${P.toLocaleString()} ${loanType} is currently under review by our credit team.`,
      type: 'loan'
    });
    notifyUser(req.user._id.toString(), notif);

    res.status(201).json({
      success: true,
      message: 'Loan application submitted successfully',
      loan
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  calculateEMI,
  getLoans,
  applyLoan
};
