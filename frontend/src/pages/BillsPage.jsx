import React, { useState, useEffect } from 'react';
import { FileText, Plus, CheckCircle2, Calendar, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency, formatDateShort } from '../utils/formatters';
import api from '../services/api';

export default function BillsPage() {
  const [bills, setBills] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [payAccountId, setPayAccountId] = useState('');

  // Add Bill Form State
  const [billerName, setBillerName] = useState('');
  const [category, setCategory] = useState('Electricity');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  const fetchData = async () => {
    try {
      const [bRes, aRes] = await Promise.all([api.get('/bills'), api.get('/accounts')]);
      setBills(bRes.data.bills || []);
      const accs = aRes.data.accounts || [];
      setAccounts(accs);
      if (accs.length > 0) setPayAccountId(accs[0]._id);
    } catch (err) {
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddBillSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/bills', { billerName, category, accountNumber, amount, dueDate });
      toast.success('Biller added successfully');
      setAddModalOpen(false);
      setBillerName('');
      setAmount('');
      fetchData();
    } catch (err) {
      toast.error('Failed to add biller');
    }
  };

  const handlePayBillSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBill) return;
    try {
      await api.post(`/bills/${selectedBill._id}/pay`, { accountId: payAccountId });
      toast.success(`Bill of $${selectedBill.amount.toFixed(2)} paid successfully!`);
      setPayModalOpen(false);
      setSelectedBill(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Pay Bills & Subscriptions</h1>
          <p className="text-xs text-slate-400 mt-1">Manage utility bills, rent, insurance, and recurring payments</p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Biller</span>
        </button>
      </div>

      {/* Bill Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bills.map((bill) => (
          <div key={bill._id} className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700">
                  {bill.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-2">{bill.billerName}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Acc: {bill.accountNumber}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${bill.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
                {bill.status}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-2">
              <div>
                <p className="text-[10px] uppercase text-slate-400">AMOUNT DUE</p>
                <p className="text-2xl font-extrabold text-white">{formatCurrency(bill.amount)}</p>
              </div>
              <p className="text-xs text-slate-400">Due: {formatDateShort(bill.dueDate)}</p>
            </div>

            {bill.status !== 'Paid' ? (
              <button
                onClick={() => {
                  setSelectedBill(bill);
                  setPayModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all"
              >
                Pay Bill Now
              </button>
            ) : (
              <div className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-emerald-400 font-semibold flex items-center justify-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Paid on {formatDateShort(bill.lastPaidDate || bill.updatedAt)}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Biller Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel border border-slate-700 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Add Biller</h3>
            <form onSubmit={handleAddBillSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Biller Name</label>
                <input
                  type="text"
                  value={billerName}
                  onChange={(e) => setBillerName(e.target.value)}
                  placeholder="e.g. City Electric Co."
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
                    {['Electricity', 'Water', 'Internet', 'Mobile', 'Insurance', 'Credit Card', 'Education', 'Rent'].map((c) => (
                      <option key={c} value={c} className="bg-slate-900">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Account / Reference No</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="ELEC-9281"
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="145.20"
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setAddModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">Save Biller</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Bill Modal */}
      {payModalOpen && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel border border-slate-700 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Pay {selectedBill.billerName}</h3>
            <p className="text-xs text-slate-400">Total Amount: <strong className="text-white">{formatCurrency(selectedBill.amount)}</strong></p>

            <form onSubmit={handlePayBillSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Payment Source Account</label>
                <select
                  value={payAccountId}
                  onChange={(e) => setPayAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-sm"
                >
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id} className="bg-slate-900">
                      {acc.accountType} ({acc.accountNumber}) — Bal: {formatCurrency(acc.balance)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setPayModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">Confirm Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
