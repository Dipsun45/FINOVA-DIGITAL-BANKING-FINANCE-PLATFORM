import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { formatCurrency } from '../utils/formatters';
import api from '../services/api';

export default function TransferPage() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [transferType, setTransferType] = useState('Internal Transfer');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const [step, setStep] = useState(1); // 1: Form, 2: Summary Confirmation, 3: Success
  const [loading, setLoading] = useState(false);
  const [transferResult, setTransferResult] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await api.get('/accounts');
        const accs = res.data.accounts || [];
        setAccounts(accs);
        if (accs.length > 0) setSelectedAccountId(accs[0]._id);
      } catch (err) {
        toast.error('Failed to load source accounts');
      }
    };
    fetchAccounts();
  }, []);

  const selectedAccount = accounts.find((a) => a._id === selectedAccountId);

  // Fee calculation
  const parsedAmount = parseFloat(amount) || 0;
  let fee = 0;
  if (transferType === 'Bank Transfer') fee = 1.50;
  if (transferType === 'International Transfer') fee = 5.00;
  const totalAmount = parsedAmount + fee;

  const handleProceedToSummary = (e) => {
    e.preventDefault();
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error('Please enter a valid transfer amount');
      return;
    }
    if (!recipientName.trim() || !recipientAccount.trim()) {
      toast.error('Please enter recipient details');
      return;
    }
    if (selectedAccount && selectedAccount.balance < totalAmount) {
      toast.error(`Insufficient balance ($${totalAmount.toFixed(2)} required including $${fee.toFixed(2)} fee)`);
      return;
    }

    setStep(2);
  };

  const handleConfirmTransfer = async () => {
    setLoading(true);
    try {
      const res = await api.post('/transfers', {
        fromAccountId: selectedAccountId,
        recipientAccount,
        recipientName,
        amount: parsedAmount,
        transferType,
        description
      });

      if (res.data.success) {
        setTransferResult(res.data);
        setStep(3);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        toast.success('Transfer executed successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Title */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-cyan-500/20">
          <Send className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Money Transfer</h1>
        <p className="text-xs text-slate-400">Send money instantly via Internal, Bank, or International Wire</p>
      </div>

      {/* STEP 1: FORM */}
      {step === 1 && (
        <form onSubmit={handleProceedToSummary} className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
          {/* Transfer Type Pills */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">Transfer Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['Internal Transfer', 'Bank Transfer', 'International Transfer', 'Scheduled Transfer'].map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setTransferType(type)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    transferType === type
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* From Account */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">From Account</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl glass-input text-sm"
            >
              {accounts.map((acc) => (
                <option key={acc._id} value={acc._id} className="bg-slate-900 text-white">
                  {acc.accountType} ({acc.accountNumber}) — Available: {formatCurrency(acc.balance)}
                </option>
              ))}
            </select>
          </div>

          {/* Recipient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Recipient Full Name *</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Alex Johnson"
                className="w-full px-3.5 py-3 rounded-xl glass-input text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Recipient Account / IBAN *</label>
              <input
                type="text"
                value={recipientAccount}
                onChange={(e) => setRecipientAccount(e.target.value)}
                placeholder="FN-CHK-849201938"
                className="w-full px-3.5 py-3 rounded-xl glass-input text-sm"
                required
              />
            </div>
          </div>

          {/* Amount & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="500.00"
                className="w-full px-3.5 py-3 rounded-xl glass-input text-sm font-bold text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Description (Optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Rent payment / Freelance"
                className="w-full px-3.5 py-3 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          {/* Fee Breakdown Preview */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Transfer Fee ({transferType})</span>
              <span>{fee > 0 ? formatCurrency(fee) : 'FREE ($0.00)'}</span>
            </div>
            <div className="flex justify-between text-white font-bold pt-1 border-t border-slate-800">
              <span>Total Deduction</span>
              <span className="text-cyan-400">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2"
          >
            <span>Review Transfer Summary</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* STEP 2: TRANSFER SUMMARY CONFIRMATION */}
      {step === 2 && (
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Transfer Summary Review</h2>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Transfer Type</span>
              <span className="font-semibold text-cyan-400">{transferType}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">From Account</span>
              <span className="text-slate-200 font-mono">{selectedAccount?.accountType} ({selectedAccount?.accountNumber})</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Recipient Name</span>
              <span className="text-slate-200 font-bold">{recipientName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Recipient Account</span>
              <span className="text-slate-200 font-mono">{recipientAccount}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Transfer Amount</span>
              <span className="text-white font-bold">{formatCurrency(parsedAmount)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Processing Fee</span>
              <span className="text-slate-300">{formatCurrency(fee)}</span>
            </div>
            <div className="flex justify-between py-3 bg-slate-900/60 rounded-xl px-4 text-base font-extrabold text-white">
              <span>Total Deduction</span>
              <span className="text-cyan-400">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              onClick={() => setStep(1)}
              className="w-1/3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold"
            >
              Back & Edit
            </button>
            <button
              onClick={handleConfirmTransfer}
              disabled={loading}
              className="w-2/3 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Processing...' : 'Confirm & Execute Transfer'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SUCCESS */}
      {step === 3 && transferResult && (
        <div className="glass-panel p-8 rounded-2xl border border-emerald-500/30 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-white">Transfer Completed!</h2>
            <p className="text-xs text-slate-400 mt-1">Ref: <span className="font-mono text-cyan-400">{transferResult.referenceNumber}</span></p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 max-w-sm mx-auto text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Sent to</span>
              <span className="text-white font-semibold">{recipientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Amount</span>
              <span className="text-emerald-400 font-bold">{formatCurrency(parsedAmount)}</span>
            </div>
          </div>

          <div className="flex justify-center space-x-4 pt-4">
            <button
              onClick={() => {
                setStep(1);
                setAmount('');
                setRecipientName('');
                setRecipientAccount('');
              }}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs"
            >
              Make Another Transfer
            </button>
            <button
              onClick={() => navigate('/transactions')}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
            >
              View Transactions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
