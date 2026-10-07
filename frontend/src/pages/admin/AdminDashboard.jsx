import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, Wallet, ArrowDownLeft, ArrowUpRight, DollarSign, CreditCard, Landmark, FileSpreadsheet } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import toast from 'react-hot-toast';
import StatCard from '../../components/StatCard';
import { CardSkeleton } from '../../components/SkeletonLoader';
import { formatCurrency } from '../../utils/formatters';
import api from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data.stats || {});
        setCharts(res.data.charts || {});
      } catch (err) {
        toast.error('Failed to load admin stats');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) return <CardSkeleton />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Finova Admin Control Center</h1>
          <p className="text-xs text-slate-400 mt-1">System metrics, transaction volumes, revenue analytics, and user governance</p>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Platform Users" value={stats.totalUsers || 0} change={`${stats.activeUsers} Active`} isPositive={true} icon={Users} color="purple" />
        <StatCard title="System Liquidity" value={formatCurrency(stats.totalBalance || 0)} change="Combined Accounts" isPositive={true} icon={Wallet} color="cyan" />
        <StatCard title="Total Deposits" value={formatCurrency(stats.totalDeposits || 0)} change="Processed Deposits" isPositive={true} icon={ArrowDownLeft} color="green" />
        <StatCard title="Monthly Revenue" value={formatCurrency(stats.monthlyRevenue || 0)} change="+18.5% MoM" isPositive={true} icon={DollarSign} color="amber" />
      </div>

      {/* Secondary KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-slate-800 text-center">
          <p className="text-[10px] uppercase text-slate-400">Suspended Users</p>
          <p className="text-xl font-bold text-rose-400 mt-1">{stats.suspendedUsers || 0}</p>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800 text-center">
          <p className="text-[10px] uppercase text-slate-400">Active Cards Issued</p>
          <p className="text-xl font-bold text-cyan-400 mt-1">{stats.activeCards || 0}</p>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800 text-center">
          <p className="text-[10px] uppercase text-slate-400">Loan Applications</p>
          <p className="text-xl font-bold text-amber-400 mt-1">{stats.loanApplications || 0}</p>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800 text-center">
          <p className="text-[10px] uppercase text-slate-400">Pending KYC</p>
          <p className="text-xl font-bold text-purple-400 mt-1">{stats.pendingKYC || 0}</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Monthly User Growth</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.userGrowth}>
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="users" stroke="#A855F7" fill="#A855F7" fillOpacity={0.2} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction Volume Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Transaction Volume ($)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.transactionVolume}>
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px' }} />
                <Bar dataKey="volume" fill="#38BDF8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
