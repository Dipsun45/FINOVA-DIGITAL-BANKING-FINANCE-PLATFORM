import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Receipt, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../utils/formatters';
import api from '../services/api';
import { TableSkeleton } from '../components/SkeletonLoader';
import ReceiptModal from '../components/ReceiptModal';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTx, setSelectedTx] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/transactions', {
        params: {
          search,
          type: typeFilter,
          status: statusFilter,
          page,
          limit: 15
        }
      });
      setTransactions(res.data.transactions || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [search, typeFilter, statusFilter, page]);

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['Reference Number', 'Type', 'Amount', 'Description', 'Category', 'Status', 'Date'];
    const rows = transactions.map((t) => [
      t.referenceNumber,
      t.type,
      t.amount,
      `"${t.description.replace(/"/g, '""')}"`,
      t.category || 'General',
      t.status,
      formatDate(t.date || t.createdAt)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `finova_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Transactions exported to CSV');
  };

  return (
    <div className="space-y-8">
      {/* Header & Export CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Transaction History</h1>
          <p className="text-xs text-slate-400 mt-1">View, filter, and export all digital financial activities</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center space-x-2 border border-slate-700"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export CSV Statement</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search description or ref..."
            className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs"
          />
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-xl glass-input text-xs"
        >
          <option value="All" className="bg-slate-900">All Transaction Types</option>
          <option value="Deposit" className="bg-slate-900">Deposit</option>
          <option value="Withdrawal" className="bg-slate-900">Withdrawal</option>
          <option value="Transfer" className="bg-slate-900">Transfer</option>
          <option value="Payment" className="bg-slate-900">Payment</option>
          <option value="Salary" className="bg-slate-900">Salary</option>
          <option value="Bill Payment" className="bg-slate-900">Bill Payment</option>
          <option value="Investment" className="bg-slate-900">Investment</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-xl glass-input text-xs"
        >
          <option value="All" className="bg-slate-900">All Statuses</option>
          <option value="Completed" className="bg-slate-900">Completed</option>
          <option value="Pending" className="bg-slate-900">Pending</option>
          <option value="Failed" className="bg-slate-900">Failed</option>
        </select>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <TableSkeleton rows={10} />
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
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
                {transactions.map((tx) => {
                  const isCredit = ['Deposit', 'Salary', 'Refund'].includes(tx.type);
                  return (
                    <tr
                      key={tx._id}
                      onClick={() => setSelectedTx(tx)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                    >
                      <td className="p-4 font-mono text-cyan-400">{tx.referenceNumber}</td>
                      <td className="p-4 font-medium text-slate-200 group-hover:text-white">{tx.description}</td>
                      <td className="p-4 text-slate-400">{tx.type}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">{formatDate(tx.date || tx.createdAt)}</td>
                      <td className={`p-4 text-right font-bold ${isCredit ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Page {page} of {totalPages}</span>
            <div className="flex space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg bg-slate-800 disabled:opacity-40 hover:bg-slate-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg bg-slate-800 disabled:opacity-40 hover:bg-slate-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <ReceiptModal isOpen={!!selectedTx} onClose={() => setSelectedTx(null)} transaction={selectedTx} />
    </div>
  );
}
