import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Plus, Copy, ExternalLink, ShieldCheck, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency, formatDateShort } from '../utils/formatters';
import api from '../services/api';
import { CardSkeleton } from '../components/SkeletonLoader';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedAcc, setCopiedAcc] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [accountType, setAccountType] = useState('Checking Account');
  const [initialBalance, setInitialBalance] = useState('500');

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/accounts');
      setAccounts(res.data.accounts || []);
    } catch (err) {
      toast.error('Failed to load bank accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCopy = (accNum) => {
    navigator.clipboard.writeText(accNum);
    setCopiedAcc(accNum);
    toast.success('Account number copied to clipboard!');
    setTimeout(() => setCopiedAcc(null), 2000);
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      await api.post('/accounts', { accountType, initialBalance });
      toast.success(`${accountType} opened successfully!`);
      setModalOpen(false);
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to open account');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardSkeleton /><CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Your Bank Accounts</h1>
          <p className="text-xs text-slate-400 mt-1">Manage your digital checking, savings, business, and investment accounts</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Open New Account</span>
        </button>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map((acc) => (
          <div
            key={acc._id}
            className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all space-y-6 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">{acc.accountType}</h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                    <span className="font-mono">{acc.accountNumber}</span>
                    <button onClick={() => handleCopy(acc.accountNumber)} className="hover:text-cyan-400">
                      {copiedAcc === acc.accountNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                {acc.status}
              </span>
            </div>

            <div>
              <p className="text-xs uppercase text-slate-400 tracking-wider">AVAILABLE BALANCE</p>
              <p className="text-3xl font-black text-white mt-1">{formatCurrency(acc.balance, acc.currency)}</p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Opened {formatDateShort(acc.createdAt)}</span>
              <Link
                to={`/accounts/${acc._id}`}
                className="text-cyan-400 font-semibold hover:underline flex items-center space-x-1"
              >
                <span>View Statement</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Open Account Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel border border-slate-700/80 rounded-2xl shadow-2xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-white">Open New Finova Account</h3>
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Account Type</label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-sm"
                >
                  <option value="Checking Account" className="bg-slate-900">Checking Account</option>
                  <option value="Savings Account" className="bg-slate-900">Savings Account (5.0% APY)</option>
                  <option value="Business Account" className="bg-slate-900">Business Account</option>
                  <option value="Investment Account" className="bg-slate-900">Investment Portfolio Account</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Initial Demo Deposit ($)</label>
                <input
                  type="number"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  min="0"
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-sm"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Confirm & Open
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
