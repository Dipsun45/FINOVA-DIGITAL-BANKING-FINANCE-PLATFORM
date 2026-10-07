import React, { useState, useEffect } from 'react';
import { PieChart, Plus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/formatters';
import api from '../services/api';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('500');

  const fetchBudgets = async () => {
    try {
      const res = await api.get('/budgets');
      setBudgets(res.data.budgets || []);
    } catch (err) {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleSetBudget = async (e) => {
    e.preventDefault();
    try {
      await api.post('/budgets', { category, amount });
      toast.success(`Budget set for ${category}`);
      setModalOpen(false);
      fetchBudgets();
    } catch (err) {
      toast.error('Failed to set budget');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Monthly Budgets</h1>
          <p className="text-xs text-slate-400 mt-1">Set spending caps per category and receive automated 80% limit alerts</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Set Category Budget</span>
        </button>
      </div>

      {/* Budget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((b) => {
          const pct = Math.min(100, Math.round((b.spent / b.amount) * 100));
          const isWarning = pct >= 80;
          const remaining = Math.max(0, b.amount - b.spent);

          return (
            <div key={b._id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{b.category}</h3>
                  <p className="text-xs text-slate-400">{b.month} {b.year}</p>
                </div>
                {isWarning ? (
                  <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/30 flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{pct}% Budget Used</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                    On Track ({pct}%)
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isWarning ? 'bg-rose-500' : 'bg-gradient-to-r from-cyan-500 to-blue-600'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs pt-1">
                  <span className="text-slate-400">Spent: <strong className="text-white">{formatCurrency(b.spent)}</strong></span>
                  <span className="text-slate-400">Remaining: <strong className={isWarning ? 'text-rose-400' : 'text-emerald-400'}>{formatCurrency(remaining)}</strong></span>
                  <span className="text-slate-400">Cap: <strong className="text-white">{formatCurrency(b.amount)}</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Set Budget Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel border border-slate-700 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Set Monthly Budget</h3>
            <form onSubmit={handleSetBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                >
                  {['Food', 'Shopping', 'Transport', 'Entertainment', 'Bills', 'Education', 'Healthcare', 'Travel', 'Subscriptions', 'Other'].map((c) => (
                    <option key={c} value={c} className="bg-slate-900">{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Budget Limit ($)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="500"
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-sm font-bold"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">Save Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
