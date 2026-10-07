import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, change, isPositive = true, icon: Icon, color = 'cyan', subtitle }) {
  const colorMap = {
    cyan: 'from-cyan-500/20 to-blue-600/10 text-cyan-400 border-cyan-500/30',
    purple: 'from-purple-500/20 to-indigo-600/10 text-purple-400 border-purple-500/30',
    green: 'from-emerald-500/20 to-teal-600/10 text-emerald-400 border-emerald-500/30',
    amber: 'from-amber-500/20 to-yellow-600/10 text-amber-400 border-amber-500/30',
    rose: 'from-rose-500/20 to-pink-600/10 text-rose-400 border-rose-500/30'
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colorMap[color] || colorMap.cyan} border`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{value}</h3>
        {change && (
          <div
            className={`flex items-center space-x-1 text-xs font-bold px-2 py-0.5 rounded-full ${
              isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{change}</span>
          </div>
        )}
      </div>

      {subtitle && <p className="mt-2 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
}
