import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Wallet,
  Receipt,
  Landmark,
  HelpCircle,
  FileSpreadsheet,
  Settings,
  LogOut,
  ArrowLeft,
  Crown
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function AdminSidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminItems = [
    { name: 'Dashboard', path: '/admin', icon: ShieldAlert },
    { name: 'Users Management', path: '/admin/users', icon: Users },
    { name: 'System Accounts', path: '/admin/accounts', icon: Wallet },
    { name: 'All Transactions', path: '/admin/transactions', icon: Receipt },
    { name: 'Loan Applications', path: '/admin/loans', icon: Landmark },
    { name: 'Support Tickets', path: '/admin/support', icon: HelpCircle },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: FileSpreadsheet },
    { name: 'System Settings', path: '/admin/settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between min-h-screen sticky top-0 shrink-0">
      <div className="p-5 space-y-6">
        {/* Admin Header Logo */}
        <div className="flex items-center space-x-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
            <Crown className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-wider text-white">FINOVA</span>
            <span className="text-[9px] uppercase tracking-widest text-purple-400 font-semibold -mt-1">ADMIN CONTROL</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {adminItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-300 border-l-4 border-purple-500 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
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

      {/* Footer controls */}
      <div className="p-5 border-t border-slate-800 space-y-3">
        <NavLink
          to="/dashboard"
          className="flex items-center space-x-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Switch to User View</span>
        </NavLink>

        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2 truncate">
            <img
              src={user?.profileImage || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80'}
              alt="Admin"
              className="w-8 h-8 rounded-full border border-purple-500/40 object-cover"
            />
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-white truncate">{user?.fullName || 'Admin'}</span>
              <span className="text-[10px] text-purple-400 font-mono">ROLE: ADMIN</span>
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
