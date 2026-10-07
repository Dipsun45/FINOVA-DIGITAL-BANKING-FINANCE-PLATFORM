import React, { useState, useEffect } from 'react';
import { Landmark, Calculator, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency, formatDateShort } from '../utils/formatters';
import api from '../services/api';

export default function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  // EMI Calculator Inputs
  const [calcAmount, setCalcAmount] = useState('10000');
  const [calcRate, setCalcRate] = useState('7.5');
  const [calcMonths, setCalcMonths] = useState('24');
  const [emiResult, setEmiResult] = useState(null);

  // Application Form State
  const [loanType, setLoanType] = useState('Personal Loan');
  const [appAmount, setAppAmount] = useState('15000');
  const [appRate, setAppRate] = useState('7.5');
  const [appMonths, setAppMonths] = useState('36');

  const fetchLoans = async () => {
    try {
      const res = await api.get('/loans');
      setLoans(res.data.loans || []);
    } catch (err) {
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
    handleCalculateEMI();
  }, []);

  const handleCalculateEMI = async () => {
    try {
      const res = await api.post('/loans/calculate', {
        amount: calcAmount,
        interestRate: calcRate,
        durationMonths: calcMonths
      });
      setEmiResult(res.data);
    } catch (err) {
      console.error('EMI calc error', err);
    }
  };

  const handleApplyLoan = async (e) => {
    e.preventDefault();
    try {
      await api.post('/loans/apply', {
        loanType,
        amount: appAmount,
        interestRate: appRate,
        durationMonths: appMonths
      });
      toast.success('Loan application submitted for approval!');
      fetchLoans();
    } catch (err) {
      toast.error('Failed to submit loan application');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h1 className="text-2xl font-extrabold text-white">Loan Management & EMI Calculator</h1>
        <p className="text-xs text-slate-400 mt-1">Apply for digital loans, calculate repayment schedules, and manage active EMI plans</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Interactive Loan EMI Calculator */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Interactive EMI Calculator</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>Loan Amount ($)</span>
                <span className="font-bold text-cyan-400">${parseInt(calcAmount).toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="100000"
                step="1000"
                value={calcAmount}
                onChange={(e) => {
                  setCalcAmount(e.target.value);
                  handleCalculateEMI();
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>Interest Rate (%)</span>
                <span className="font-bold text-cyan-400">{calcRate}% APY</span>
              </div>
              <input
                type="range"
                min="3.5"
                max="18.0"
                step="0.5"
                value={calcRate}
                onChange={(e) => {
                  setCalcRate(e.target.value);
                  handleCalculateEMI();
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>Duration (Months)</span>
                <span className="font-bold text-cyan-400">{calcMonths} Months ({Math.round(calcMonths / 12)} Yrs)</span>
              </div>
              <input
                type="range"
                min="6"
                max="60"
                step="6"
                value={calcMonths}
                onChange={(e) => {
                  setCalcMonths(e.target.value);
                  handleCalculateEMI();
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {emiResult && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] uppercase text-slate-400">Monthly EMI</p>
                <p className="text-lg font-black text-cyan-400">{formatCurrency(emiResult.monthlyEMI)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-400">Total Interest</p>
                <p className="text-lg font-black text-rose-400">{formatCurrency(emiResult.totalInterest)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-400">Total Payable</p>
                <p className="text-lg font-black text-white">{formatCurrency(emiResult.totalPayment)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Loan Application Form */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Apply for Demo Loan</h3>
          <form onSubmit={handleApplyLoan} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Loan Type</label>
              <select value={loanType} onChange={(e) => setLoanType(e.target.value)} className="w-full px-3 py-2.5 rounded-xl glass-input text-xs">
                {['Personal Loan', 'Home Loan', 'Auto Loan', 'Student Loan', 'Business Loan'].map((t) => (
                  <option key={t} value={t} className="bg-slate-900">{t}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Amount ($)</label>
                <input type="number" value={appAmount} onChange={(e) => setAppAmount(e.target.value)} className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-bold" required />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Duration (Months)</label>
                <input type="number" value={appMonths} onChange={(e) => setAppMonths(e.target.value)} className="w-full px-3 py-2.5 rounded-xl glass-input text-xs" required />
              </div>
            </div>
            <button type="submit" className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all">
              Submit Application
            </button>
          </form>
        </div>
      </div>

      {/* Active Loans List */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">Your Loan Applications & Active Plans</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3 font-semibold">Loan Type</th>
                <th className="p-3 font-semibold">Principal</th>
                <th className="p-3 font-semibold">Monthly EMI</th>
                <th className="p-3 font-semibold">Duration</th>
                <th className="p-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loans.map((loan) => (
                <tr key={loan._id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-white">{loan.loanType}</td>
                  <td className="p-3 text-slate-200">{formatCurrency(loan.amount)}</td>
                  <td className="p-3 text-cyan-400 font-bold">{formatCurrency(loan.monthlyEMI)}</td>
                  <td className="p-3 text-slate-400">{loan.durationMonths} Months</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${loan.status === 'Approved' || loan.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
                      {loan.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
