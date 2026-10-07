import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Wallet, ArrowLeft, Send, ArrowDownLeft, ArrowUpRight, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../utils/formatters';
import api from '../services/api';
import { TableSkeleton } from '../components/SkeletonLoader';

export default function AccountDetailPage() {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/accounts/${id}`);
        setAccount(res.data.account);
        setTransactions(res.data.transactions || []);
      } catch (err) {
        toast.error('Failed to load account statement');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleCopy = () => {
    if (account?.accountNumber) {
      navigator.clipboard.writeText(account.accountNumber);
      setCopied(true);
      toast.success('Account number copied');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <TableSkeleton rows={8} />;

  if (!account) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Account not found.</p>
        <Link to="/accounts" className="text-cyan-400 text-sm hover:underline mt-2 inline-block">Back to Accounts</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link to="/accounts" className="inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-cyan-400">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Accounts</span>
      </Link>

      {/* Account Overview Header Card */}
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            {account.accountType}
          </span>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-mono text-white">{account.accountNumber}</h1>
            <button onClick={handleCopy} className="p-1 text-slate-400 hover:text-white">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-400">Currency: {account.currency || 'USD'} • Status: {account.status}</p>
        </div>

        <div className="text-left md:text-right space-y-1">
          <p className="text-xs text-slate-400 uppercase tracking-wider">AVAILABLE BALANCE</p>
          <h2 className="text-4xl font-extrabold text-white">{formatCurrency(account.balance, account.currency)}</h2>
        </div>
      </div>

      {/* Account Statement Transactions */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">Account Mini Statement</h3>
        {transactions.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No transactions recorded for this account yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Reference</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((tx) => {
                  const isCredit = ['Deposit', 'Salary', 'Refund'].includes(tx.type);
                  return (
                    <tr key={tx._id} className="hover:bg-slate-800/40">
                      <td className="py-3 font-medium text-slate-200">{tx.description}</td>
                      <td className="py-3 font-mono text-slate-400">{tx.referenceNumber}</td>
                      <td className="py-3 text-slate-400">{formatDate(tx.date || tx.createdAt)}</td>
                      <td className={`py-3 text-right font-bold ${isCredit ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
