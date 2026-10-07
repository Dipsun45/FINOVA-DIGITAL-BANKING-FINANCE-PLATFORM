import React, { useState, useEffect } from 'react';
import { Receipt, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../../utils/formatters';
import api from '../../services/api';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTxs = async () => {
      try {
        const res = await api.get('/transactions?limit=50');
        setTransactions(res.data.transactions || []);
      } catch (err) {
        toast.error('Failed to load transaction audit');
      } finally {
        setLoading(false);
      }
    };
    fetchTxs();
  }, []);

  return (
    <div className="space-y-8">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h1 className="text-2xl font-extrabold text-white">System Transactions Audit</h1>
        <p className="text-xs text-slate-400 mt-1">Real-time audit log of all financial transfers, deposits, and payments</p>
      </div>

      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4 font-semibold">Reference</th>
              <th className="p-4 font-semibold">Description</th>
              <th className="p-4 font-semibold">Type</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {transactions.map((tx) => (
              <tr key={tx._id} className="hover:bg-slate-800/40">
                <td className="p-4 font-mono text-cyan-400">{tx.referenceNumber}</td>
                <td className="p-4 font-medium text-slate-200">{tx.description}</td>
                <td className="p-4 text-slate-400">{tx.type}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                    {tx.status}
                  </span>
                </td>
                <td className="p-4 text-slate-400">{formatDate(tx.date || tx.createdAt)}</td>
                <td className="p-4 text-right font-bold text-white">{formatCurrency(tx.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
