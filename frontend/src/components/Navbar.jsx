import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Sun, Moon, Menu, X, ArrowRight, UserCheck } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const { isAuthenticated, user } = useContext(AuthContext);

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-2xl tracking-wider text-white">FINOVA</span>
            <span className="text-[9px] uppercase tracking-widest text-cyan-400 font-semibold -mt-1">Digital Banking Platform</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
          <a href="#banking" className="hover:text-cyan-400 transition-colors">Banking</a>
          <a href="#finance" className="hover:text-cyan-400 transition-colors">Finance</a>
          <a href="#security" className="hover:text-cyan-400 transition-colors">Security</a>
        </nav>

        {/* Right CTA / Auth Controls */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/50"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <Link
                to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2"
              >
                <span>Go to Banking Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" />
                <span>Client Login</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-800 text-slate-300"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-slate-800 px-6 py-4 space-y-4">
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-slate-300 hover:text-cyan-400 font-medium">Features</a>
          <a href="#banking" onClick={() => setMobileMenuOpen(false)} className="block text-slate-300 hover:text-cyan-400 font-medium">Banking</a>
          <div className="pt-4 border-t border-slate-800 flex flex-col space-y-3">
            {isAuthenticated ? (
              <Link
                to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center rounded-xl bg-cyan-500 text-slate-950 font-bold"
              >
                Go to Banking Portal
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center rounded-xl bg-cyan-500 text-slate-950 font-bold"
              >
                Client Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
