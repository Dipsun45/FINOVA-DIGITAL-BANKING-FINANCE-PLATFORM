import React, { useState, useContext } from 'react';
import { ShieldAlert, KeyRound, Lock, Smartphone, Laptop, CheckCircle2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function SecurityPage() {
  const { user, updateUser } = useContext(AuthContext);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    try {
      const res = await api.put('/auth/toggle-2fa');
      if (res.data.success) {
        updateUser({ ...user, isTwoFactorEnabled: res.data.isTwoFactorEnabled });
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to toggle 2FA');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Security Center</h1>
          <p className="text-xs text-slate-400 mt-1">Configure multi-factor authentication, active sessions, and password security</p>
        </div>
      </div>

      {/* 2FA Toggle Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Two-Factor Authentication (2FA)</h3>
            <p className="text-xs text-slate-400">Add an extra layer of security to your Finova account via authenticator app</p>
          </div>
        </div>
        <button
          onClick={handleToggle2FA}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            user?.isTwoFactorEnabled
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md'
          }`}
        >
          {user?.isTwoFactorEnabled ? '2FA Enabled' : 'Enable 2FA'}
        </button>
      </div>

      {/* Change Password Form */}
      <form onSubmit={handlePasswordChange} className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-5">
        <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">Change Account Password</h3>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-3 rounded-xl glass-input text-sm"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-3 rounded-xl glass-input text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-3 rounded-xl glass-input text-sm"
              required
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>

      {/* Active Device Sessions */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">Active Login Sessions</h3>

        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              <Laptop className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="font-semibold text-white">Chrome on Windows 11 (Current Session)</p>
                <p className="text-[10px] text-slate-400">San Francisco, CA • IP: 127.0.0.1</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
