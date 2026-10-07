import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/formatters';
import api from '../../services/api';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/admin/audit-logs');
        setLogs(res.data.logs || []);
      } catch (err) {
        toast.error('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h1 className="text-2xl font-extrabold text-white">System Audit Log</h1>
        <p className="text-xs text-slate-400 mt-1">Immutable record of administrative actions, user state changes, and security events</p>
      </div>

      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4 font-semibold">Timestamp</th>
              <th className="p-4 font-semibold">Actor</th>
              <th className="p-4 font-semibold">Action</th>
              <th className="p-4 font-semibold">Target</th>
              <th className="p-4 font-semibold">IP Address</th>
              <th className="p-4 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {logs.map((log) => (
              <tr key={log._id} className="hover:bg-slate-800/40">
                <td className="p-4 text-slate-400 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                <td className="p-4 font-bold text-white">{log.actorName}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                    {log.action}
                  </span>
                </td>
                <td className="p-4 font-mono text-cyan-400">{log.target || 'N/A'}</td>
                <td className="p-4 font-mono text-slate-400">{log.ip}</td>
                <td className="p-4 text-slate-300">{log.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
