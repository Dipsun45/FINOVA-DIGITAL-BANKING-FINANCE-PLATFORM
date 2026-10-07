import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  FileText,
  CreditCard,
  PlusCircle,
  TrendingUp,
  PiggyBank,
  CheckCircle2,
  Clock,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import { CardSkeleton } from '../components/SkeletonLoader';
import ReceiptModal from '../components/ReceiptModal';
import { formatCurrency, formatDateShort } from '../utils/formatters';
import api from '../services/api';

export default function UserDashboard() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [bills, setBills] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [hideBalance, setHideBalance] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [accRes, txRes, goalRes, billRes] = await Promise.all([
          api.get('/accounts'),
          api.get('/transactions?limit=6'),
          api.get('/savings'),
          api.get('/bills')
        ]);

        setAccounts(accRes.data.accounts || []);
        setTransactions(txRes.data.transactions || []);
        setSavingsGoals(goalRes.data.goals || []);
        setBills(billRes.data.bills || []);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        toast.error('Failed to update financial overview');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const savingsBalance = accounts.find((a) => a.accountType === 'Savings Account')?.balance || 50000;
  const investmentBalance = accounts.find((a) => a.accountType === 'Investment Account')?.balance || 18450;
  const monthlyIncome = 8500.00;
  const monthlyExpenses = 1845.20;
  const spendingPercentage = ((monthlyExpenses / monthlyIncome) * 100).toFixed(1);

  // Financial Chart Data
  const overviewChartData = [
    { month: 'Jan', income: 8200, expenses: 1400, balance: 65000 },
    { month: 'Feb', income: 8500, expenses: 1950, balance: 71550 },
    { month: 'Mar', income: 8500, expenses: 1600, balance: 78450 },
    { month: 'Apr', income: 9200, expenses: 2100, balance: 82100 },
    { month: 'May', income: 8500, expenses: 1750, balance: 83200 },
    { month: 'Jun', income: 8500, expenses: 1845, balance: totalBalance > 0 ? totalBalance : 84520.75 }
  ];

  const categoryPieData = [
    { name: 'Food', value: 340, color: '#38BDF8' },
    { name: 'Shopping', value: 290, color: '#A855F7' },
    { name: 'Bills', value: 545, color: '#F59E0B' },
    { name: 'Subscriptions', value: 120, color: '#10B981' },
    { name: 'Entertainment', value: 180, color: '#EC4899' }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Good Morning, {user?.fullName?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Here's your real-time digital banking & financial overview.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setHideBalance(!hideBalance)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-2 transition-colors border border-slate-700"
          >
            {hideBalance ? <Eye className="w-4 h-4 text-cyan-400" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
            <span>{hideBalance ? 'Show Balances' : 'Hide Balances'}</span>
          </button>
          <Link
            to="/transfer"
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Transfer Money</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Balance"
          value={hideBalance ? '••••••••' : formatCurrency(totalBalance)}
          change="+12.4% vs last month"
          isPositive={true}
          icon={Wallet}
          color="cyan"
          subtitle="Combined across 4 accounts"
        />
        <StatCard
          title="Monthly Income"
          value={hideBalance ? '••••••••' : formatCurrency(monthlyIncome)}
          change="+3.5%"
          isPositive={true}
          icon={ArrowDownLeft}
          color="green"
          subtitle="Primary Salary & Consulting"
        />
        <StatCard
          title="Monthly Expenses"
          value={hideBalance ? '••••••••' : formatCurrency(monthlyExpenses)}
          change={`Spent ${spendingPercentage}% of Income`}
          isPositive={false}
          icon={ArrowUpRight}
          color="amber"
          subtitle="Food, Bills & Subscriptions"
        />
        <StatCard
          title="Total Investments"
          value={hideBalance ? '••••••••' : formatCurrency(investmentBalance)}
          change="+14.8% APY"
          isPositive={true}
          icon={TrendingUp}
          color="purple"
          subtitle="Stocks, ETFs & Crypto"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance & Cashflow Growth Area Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Financial Growth & Cash Flow</h3>
              <p className="text-xs text-slate-400">Monthly Balance accumulation vs Income</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Live Analytics
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overviewChartData}>
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', color: '#FFF' }}
                  formatter={(val) => [`$${val.toLocaleString()}`, 'Balance']}
                />
                <Area type="monotone" dataKey="balance" stroke="#38BDF8" strokeWidth={3} fillOpacity={1} fill="url(#balanceGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Expense Breakdown Pie Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Expense Breakdown</h3>
          <p className="text-xs text-slate-400">Monthly category spending distribution</p>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', color: '#FFF' }}
                  formatter={(val) => [`$${val}`, 'Spent']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2">
            {categoryPieData.map((c, i) => (
              <div key={i} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-slate-300 truncate">{c.name} (${c.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Money Transfer', link: '/transfer', icon: Send, color: 'from-cyan-500 to-blue-600' },
          { label: 'Pay Bills', link: '/bills', icon: FileText, color: 'from-amber-500 to-orange-600' },
          { label: 'Manage Cards', link: '/cards', icon: CreditCard, color: 'from-purple-500 to-indigo-600' },
          { label: 'Savings Goals', link: '/savings', icon: PiggyBank, color: 'from-emerald-500 to-teal-600' }
        ].map((act, idx) => {
          const Icon = act.icon;
          return (
            <Link
              key={idx}
              to={act.link}
              className="glass-card p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex items-center space-x-3 group"
            >
              <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${act.color} text-white shadow-md group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">{act.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Recent Transactions & Side Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions Table */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Recent Transactions</h3>
            <Link to="/transactions" className="text-xs text-cyan-400 hover:underline flex items-center space-x-1">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="pb-3 font-semibold">Transaction</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
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
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${isCredit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-300'}`}>
                            {isCredit ? '+' : '-'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">{tx.description}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{tx.referenceNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-400">{tx.category || tx.type}</td>
                      <td className="py-3.5 text-slate-400">{formatDateShort(tx.date || tx.createdAt)}</td>
                      <td className={`py-3.5 text-right font-bold ${isCredit ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Savings Goals & Upcoming Bills Widgets */}
        <div className="space-y-6">
          {/* Savings Goals Preview */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Savings Goals</h3>
              <Link to="/savings" className="text-xs text-cyan-400 hover:underline">Manage</Link>
            </div>

            <div className="space-y-4">
              {savingsGoals.slice(0, 2).map((goal) => {
                const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                return (
                  <div key={goal._id} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200">{goal.name}</span>
                      <span className="text-cyan-400 font-bold">{pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 text-right">
                      ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Bills Widget */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Upcoming Bills</h3>
              <Link to="/bills" className="text-xs text-cyan-400 hover:underline">View All</Link>
            </div>

            <div className="space-y-3">
              {bills.slice(0, 2).map((bill) => (
                <div key={bill._id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-200">{bill.billerName}</p>
                    <p className="text-[10px] text-slate-400">Due {formatDateShort(bill.dueDate)}</p>
                  </div>
                  <span className="font-bold text-rose-400">{formatCurrency(bill.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Receipt Modal */}
      <ReceiptModal isOpen={!!selectedTx} onClose={() => setSelectedTx(null)} transaction={selectedTx} />
    </div>
  );
}
