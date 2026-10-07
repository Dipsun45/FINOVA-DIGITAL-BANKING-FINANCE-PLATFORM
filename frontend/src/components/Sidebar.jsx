import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  Send,
  Receipt,
  CreditCard,
  FileCheck,
  Banknote,
  Lock,
  FileText,
  PieChart,
  DollarSign,
  PiggyBank,
  TrendingUp,
  Landmark,
  Gauge,
  HelpCircle,
  Bell,
  Settings,
  ShieldAlert,
  LogOut,
  ShieldCheck,
  Search
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function Sidebar({ onOpenSearch }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Accounts', path: '/accounts', icon: Wallet },
    { name: 'Transfer', path: '/transfer', icon: Send },
    { name: 'Transactions', path: '/transactions', icon: Receipt },
    { name: 'ATM Cards', path: '/cards', icon: CreditCard },
    { name: 'Cheque Clearance', path: '/cheques', icon: FileCheck },
    { name: 'Cash Deposit Slip', path: '/cash-deposit', icon: Banknote },
    { name: 'Fixed Deposits (FD)', path: '/fixed-deposits', icon: Lock },
    { name: 'Bills', path: '/bills', icon: FileText },
    { name: 'Budgets', path: '/budgets', icon: PieChart },
    { name: 'Expenses', path: '/expenses', icon: DollarSign },
    { name: 'Savings', path: '/savings', icon: PiggyBank },
    { name: 'Investments', path: '/investments', icon: TrendingUp },
    { name: 'Loans', path: '/loans', icon: Landmark },
    { name: 'Credit Score', path: '/credit-score', icon: Gauge },
    { name: 'Support', path: '/support', icon: HelpCircle }
  ];

  const secondaryItems = [
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Full Profile Details', path: '/profile', icon: Settings },
    { name: 'Security Center', path: '/security', icon: ShieldAlert }
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800 flex flex-col justify-between min-h-screen sticky top-0 shrink-0">
      <div className="p-5 flex flex-col space-y-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-wider text-white">FINOVA</span>
            <span className="text-[9px] uppercase tracking-widest text-cyan-400 font-semibold -mt-1">Banking Suite</span>
          </div>
        </div>

        {/* Global Search Button */}
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 text-xs transition-colors"
          >
            <span className="flex items-center space-x-2">
              <Search className="w-3.5 h-3.5" />
              <span>Search...</span>
            </span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">Ctrl+K</kbd>
          </button>
        )}

        {/* Primary Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-400 border-l-4 border-cyan-400 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Secondary Navigation & User Footer */}
      <div className="p-5 border-t border-slate-800 space-y-4">
        <div className="space-y-1">
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive ? 'text-cyan-400 font-semibold bg-slate-800/40' : 'text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Card */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <img
              src={user?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
              alt={user?.fullName || 'User'}
              className="w-8 h-8 rounded-full object-cover border border-cyan-500/40"
            />
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-white truncate">{user?.fullName || 'User'}</span>
              <span className="text-[10px] text-cyan-400 font-mono truncate">{user?.userId || user?.email}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
