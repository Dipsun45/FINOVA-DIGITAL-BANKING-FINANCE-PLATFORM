import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { ShieldCheck, Lock } from 'lucide-react';

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 tracking-wide">
              ADMIN CONTROL CENTER
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Lock className="w-4 h-4 text-purple-400" />
            <span>Secure Admin Session Active</span>
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
