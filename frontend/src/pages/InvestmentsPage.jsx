import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, DollarSign, ShieldAlert, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/formatters';
import api from '../services/api';

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState([]);
  const [summary, setSummary] = useState({});
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyModalOpen, setBuyModalOpen] = useState(false);

  // Buy form
  const [accountId, setAccountId] = useState('');
  const [assetName, setAssetName] = useState('NVIDIA Corporation');
  const [symbol, setSymbol] = useState('NVDA');
  const [assetType, setAssetType] = useState('Stocks');
  const [shares, setShares] = useState('5');
  const [pricePerShare, setPricePerShare] = useState('125.00');

  const fetchData = async () => {
    try {
      const [iRes, aRes] = await Promise.all([api.get('/investments'), api.get('/accounts')]);
      setInvestments(iRes.data.investments || []);
      setSummary(iRes.data.portfolioSummary || {});
      const accs = aRes.data.accounts || [];
      setAccounts(accs);
      if (accs.length > 0) setAccountId(accs[0]._id);
    } catch (err) {
      toast.error('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBuyAsset = async (e) => {
    e.preventDefault();
    try {
      await api.post('/investments/buy', { accountId, assetName, symbol, assetType, shares, pricePerShare });
      toast.success(`Successfully bought ${shares} shares of ${symbol}!`);
      setBuyModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Trade failed');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Investment Portfolio</h1>
          <p className="text-xs text-slate-400 mt-1">Simulated asset growth, stocks, ETFs, mutual funds, and crypto portfolio</p>
        </div>
        <button
          onClick={() => setBuyModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Buy Simulated Asset</span>
        </button>
      </div>

      {/* Educational Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-300 flex items-center space-x-2">
        <ShieldAlert className="w-5 h-5 text-purple-400 shrink-0" />
        <span>
          <strong>Simulated Market Notice:</strong> Market prices and asset valuations are simulated demo figures for educational training inside FINOVA.
        </span>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 uppercase">Portfolio Value</p>
          <p className="text-2xl font-extrabold text-white mt-1">{formatCurrency(summary.totalCurrentValue || 0)}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 uppercase">Total Invested</p>
          <p className="text-2xl font-extrabold text-white mt-1">{formatCurrency(summary.totalInvested || 0)}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 uppercase">Total Profit / Loss</p>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">+{formatCurrency(summary.totalProfitLoss || 0)}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 uppercase">All-Time Return</p>
          <p className="text-2xl font-extrabold text-cyan-400 mt-1">+{(summary.totalReturnPercentage || 0).toFixed(2)}%</p>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 font-bold text-white text-sm">Asset Holdings</div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4 font-semibold">Asset Name</th>
              <th className="p-4 font-semibold">Symbol</th>
              <th className="p-4 font-semibold">Asset Type</th>
              <th className="p-4 font-semibold">Shares</th>
              <th className="p-4 font-semibold">Avg Price</th>
              <th className="p-4 font-semibold text-right">Current Value</th>
              <th className="p-4 font-semibold text-right">Profit / Loss</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {investments.map((inv) => (
              <tr key={inv._id} className="hover:bg-slate-800/40">
                <td className="p-4 font-bold text-white">{inv.assetName}</td>
                <td className="p-4 font-mono text-cyan-400">{inv.symbol}</td>
                <td className="p-4 text-slate-400">{inv.assetType}</td>
                <td className="p-4 text-slate-200">{inv.shares}</td>
                <td className="p-4 text-slate-400">{formatCurrency(inv.purchasePrice)}</td>
                <td className="p-4 text-right font-bold text-white">{formatCurrency(inv.currentValue)}</td>
                <td className="p-4 text-right font-bold text-emerald-400">+{formatCurrency(inv.profitLoss)} ({inv.returnPercentage}%)</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Buy Asset Modal */}
      {buyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel border border-slate-700 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Buy Simulated Asset</h3>
            <form onSubmit={handleBuyAsset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Source Account</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-sm"
                >
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id} className="bg-slate-900">
                      {acc.accountType} ({acc.accountNumber}) — Bal: {formatCurrency(acc.balance)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Asset Name</label>
                  <input
                    type="text"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Symbol</label>
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-mono"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Type</label>
                  <select value={assetType} onChange={(e) => setAssetType(e.target.value)} className="w-full px-2 py-2.5 rounded-xl glass-input text-xs">
                    {['Stocks', 'Mutual Funds', 'ETFs', 'Bonds', 'Crypto', 'Gold'].map((t) => (
                      <option key={t} value={t} className="bg-slate-900">{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Shares</label>
                  <input type="number" step="0.01" value={shares} onChange={(e) => setShares(e.target.value)} className="w-full px-3 py-2.5 rounded-xl glass-input text-xs" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Price ($)</label>
                  <input type="number" step="0.01" value={pricePerShare} onChange={(e) => setPricePerShare(e.target.value)} className="w-full px-3 py-2.5 rounded-xl glass-input text-xs" required />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setBuyModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">Execute Trade</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
