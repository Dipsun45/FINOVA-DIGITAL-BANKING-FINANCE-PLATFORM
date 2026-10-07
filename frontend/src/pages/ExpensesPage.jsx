import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Trash2, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency, formatDateShort } from '../utils/formatters';
import api from '../services/api';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Form
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses', { params: { category: categoryFilter } });
      setExpenses(res.data.expenses || []);
      setTotalExpense(res.data.totalExpense || 0);
    } catch (err) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post('/expenses', { category, amount, description });
      toast.success('Expense recorded!');
      setModalOpen(false);
      setAmount('');
      setDescription('');
      fetchExpenses();
    } catch (err) {
      toast.error('Failed to record expense');
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      toast.success('Expense deleted');
      fetchExpenses();
    } catch (err) {
      toast.error('Failed to delete expense');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Expense Tracker</h1>
          <p className="text-xs text-slate-400 mt-1">Record and categorize daily expenses. Total Tracked: <strong className="text-rose-400">{formatCurrency(totalExpense)}</strong></p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center space-x-3 glass-panel p-4 rounded-xl border border-slate-800">
        <Filter className="w-4 h-4 text-slate-400" />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-transparent text-xs text-white focus:outline-none"
        >
          <option value="All" className="bg-slate-900">All Expense Categories</option>
          {['Food', 'Shopping', 'Transport', 'Entertainment', 'Bills', 'Education', 'Healthcare', 'Travel', 'Subscriptions', 'Other'].map((c) => (
            <option key={c} value={c} className="bg-slate-900">{c}</option>
          ))}
        </select>
      </div>

      {/* Expenses Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4 font-semibold">Description</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold text-right">Amount</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {expenses.map((exp) => (
              <tr key={exp._id} className="hover:bg-slate-800/40">
                <td className="p-4 font-medium text-slate-200">{exp.description}</td>
                <td className="p-4 text-slate-400">{exp.category}</td>
                <td className="p-4 text-slate-400">{formatDateShort(exp.date)}</td>
                <td className="p-4 text-right font-bold text-rose-400">{formatCurrency(exp.amount)}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDeleteExpense(exp._id)} className="p-1 text-slate-500 hover:text-rose-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel border border-slate-700 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Record Expense</h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Lunch at Gourmet Bistro"
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
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
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="84.20"
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-bold"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
