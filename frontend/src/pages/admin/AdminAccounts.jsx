import React, { useState, useEffect } from 'react';
import { Wallet, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency, formatDateShort } from '../../utils/formatters';
import api from '../../services/api';

export default function AdminAccounts() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/admin/users');
        setUsers(res.data.users || []);
      } catch (err) {
        toast.error('Failed to load system accounts');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h1 className="text-2xl font-extrabold text-white">System Accounts Management</h1>
        <p className="text-xs text-slate-400 mt-1">Audit all active bank accounts across checking, savings, and investment accounts</p>
      </div>

      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4 font-semibold">Account Holder</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-slate-800/40">
                <td className="p-4 font-bold text-white">{u.fullName}</td>
                <td className="p-4 text-slate-300 font-mono">{u.email}</td>
                <td className="p-4 text-purple-400 font-bold uppercase">{u.role}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {u.status}
                  </span>
                </td>
                <td className="p-4 text-slate-400">{formatDateShort(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
