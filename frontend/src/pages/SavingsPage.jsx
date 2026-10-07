import React, { useState, useEffect } from 'react';
import { PiggyBank, Plus, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { formatCurrency, formatDateShort } from '../utils/formatters';
import api from '../services/api';

export default function SavingsPage() {
  const [goals, setGoals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [depositAccountId, setDepositAccountId] = useState('');
  const [depositAmount, setDepositAmount] = useState('');

  // Create Goal state
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const fetchData = async () => {
    try {
      const [gRes, aRes] = await Promise.all([api.get('/savings'), api.get('/accounts')]);
      setGoals(gRes.data.goals || []);
      const accs = aRes.data.accounts || [];
      setAccounts(accs);
      if (accs.length > 0) setDepositAccountId(accs[0]._id);
    } catch (err) {
      toast.error('Failed to load savings goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      await api.post('/savings', { name, targetAmount, deadline });
      toast.success('Savings goal created!');
      setCreateModalOpen(false);
      setName('');
      setTargetAmount('');
      fetchData();
    } catch (err) {
      toast.error('Failed to create goal');
    }
  };

  const handleDepositToGoal = async (e) => {
    e.preventDefault();
    if (!selectedGoal) return;
    try {
      const res = await api.post(`/savings/${selectedGoal._id}/add-money`, {
        accountId: depositAccountId,
        amount: depositAmount
      });
      if (res.data.success) {
        toast.success(`Deposited $${parseFloat(depositAmount).toFixed(2)} into ${selectedGoal.name}`);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        setDepositModalOpen(false);
        setDepositAmount('');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Deposit failed');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Savings Goals</h1>
          <p className="text-xs text-slate-400 mt-1">Set target milestones for travel, gadgets, and emergency funds</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          return (
            <div key={goal._id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{goal.name}</h3>
                  <p className="text-xs text-slate-400">Target Deadline: {formatDateShort(goal.deadline)}</p>
                </div>
                <span className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-xs">
                  {pct}%
                </span>
              </div>

              {/* Progress Ring / Bar */}
              <div className="space-y-2">
                <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Saved: <strong className="text-emerald-400">{formatCurrency(goal.currentAmount)}</strong></span>
                  <span>Target: <strong className="text-white">{formatCurrency(goal.targetAmount)}</strong></span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedGoal(goal);
                  setDepositModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-xs border border-slate-700 transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>Add Money to Goal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Create Goal Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel border border-slate-700 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Create Savings Goal</h3>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Goal Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. New M3 MacBook Pro"
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Target Amount ($)</label>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="2500"
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setCreateModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">Create Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit to Goal Modal */}
      {depositModalOpen && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel border border-slate-700 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Deposit to {selectedGoal.name}</h3>
            <form onSubmit={handleDepositToGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Source Account</label>
                <select
                  value={depositAccountId}
                  onChange={(e) => setDepositAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-sm"
                >
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id} className="bg-slate-900">
                      {acc.accountType} ({acc.accountNumber}) — Bal: {formatCurrency(acc.balance)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Deposit Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="250.00"
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-sm font-bold"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setDepositModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">Confirm Deposit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
