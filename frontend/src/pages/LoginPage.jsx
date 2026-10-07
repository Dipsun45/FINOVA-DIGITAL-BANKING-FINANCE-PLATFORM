import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Lock, UserCheck, ShieldAlert, ArrowRight, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(''); // Email or User ID
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error('Please enter User ID or Email and Password');
      return;
    }

    setLoading(true);
    try {
      const res = await login(identifier, password);
      toast.success(`Welcome back to FINOVA, ${res.user?.fullName}!`);
      if (res.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFillUser = (userId, email, pass = 'password123') => {
    setIdentifier(userId || email);
    setPassword(pass);
    toast.success(`Pre-filled credentials for ${userId}`);
  };

  const handleFillAdmin = () => {
    setIdentifier('admin@gmail.com');
    setPassword('admin');
    toast.success('Pre-filled Bank Administrator credentials');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-cyan-500/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Sign In to FINOVA</h2>
          <p className="text-xs text-slate-400">Access your accounts with Fixed User ID or Email</p>
        </div>

        {/* Demo Quick Fill Shortcuts */}
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/30 space-y-3 bg-slate-900/90">
          <div className="flex justify-between items-center">
            <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Quick Account Login Shortcuts</p>
            <span className="text-[10px] text-slate-400">20 Users Available</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillUser('USR1001', 'demo@finova.com')}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors border border-slate-700"
            >
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>USR1001 (Dipsun)</span>
            </button>

            <button
              type="button"
              onClick={() => handleFillUser('USR1002', 'alex.morgan@finova.com')}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors border border-slate-700"
            >
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>USR1002 (Alex)</span>
            </button>

            <button
              type="button"
              onClick={() => handleFillUser('USR1003', 'sarah.jenkins@finova.com')}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors border border-slate-700"
            >
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>USR1003 (Sarah)</span>
            </button>

            <button
              type="button"
              onClick={handleFillAdmin}
              className="px-3 py-2 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-200 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors border border-purple-500/40"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Login</span>
            </button>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-5 bg-slate-900/90">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">User ID or Email Address</label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. USR1001 or demo@finova.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white font-medium focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white font-medium focus:outline-none focus:border-cyan-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-900"
              />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-cyan-400 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Authenticating...' : 'Log In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
