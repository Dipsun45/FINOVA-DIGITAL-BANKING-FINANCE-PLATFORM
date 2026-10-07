import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, ShieldAlert, DollarSign, CreditCard, PieChart } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/formatters';
import api from '../services/api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/all/read');
      toast.success('All notifications marked as read');
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to update notifications');
    }
  };

  const getIcon = (type) => {
    if (type === 'security') return <ShieldAlert className="w-5 h-5 text-rose-400" />;
    if (type === 'transaction') return <DollarSign className="w-5 h-5 text-emerald-400" />;
    if (type === 'card') return <CreditCard className="w-5 h-5 text-cyan-400" />;
    if (type === 'budget') return <PieChart className="w-5 h-5 text-amber-400" />;
    return <Bell className="w-5 h-5 text-purple-400" />;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Notification Center</h1>
            <p className="text-xs text-slate-400 mt-0.5">Real-time alerts for security events, transfers, and budgets</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
          >
            Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="glass-panel rounded-2xl border border-slate-800 divide-y divide-slate-800/60 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No notifications found.</div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-4 flex items-start space-x-4 transition-colors ${notif.isRead ? 'opacity-70' : 'bg-slate-800/30'}`}
            >
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{notif.title}</h4>
                  <span className="text-[10px] text-slate-400">{formatDate(notif.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{notif.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
