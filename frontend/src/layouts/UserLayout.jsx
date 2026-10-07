import React, { useState, useContext } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import GlobalSearchModal from '../components/GlobalSearchModal';
import { Bell, Search, Sun, Moon, Menu, X, ShieldAlert } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

export default function UserLayout() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="min-h-screen flex bg-[#0B0F17] text-slate-100 font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar onOpenSearch={() => setIsSearchOpen(true)} />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative z-10 w-64 bg-slate-900 h-full">
            <Sidebar onOpenSearch={() => setIsSearchOpen(true)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 h-16 glass-panel border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center space-x-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20">
                FINOVA DEMO SYSTEM
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Global Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-cyan-400 transition-colors flex items-center space-x-2 text-xs"
            >
              <Search className="w-4 h-4" />
              <span className="hidden md:inline">Quick Search (Ctrl+K)</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications */}
            <Link
              to="/notifications"
              className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-cyan-400 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
            </Link>

            {/* Admin Quick Switch Badge */}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/40 text-xs font-semibold hover:bg-purple-600/30 flex items-center space-x-1"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </Link>
            )}
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          <Outlet />
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
