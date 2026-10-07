import React from 'react';

export function CardSkeleton() {
  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-4 w-24 bg-slate-800 rounded" />
        <div className="h-8 w-8 bg-slate-800 rounded-xl" />
      </div>
      <div className="h-8 w-36 bg-slate-800 rounded" />
      <div className="h-3 w-48 bg-slate-800/60 rounded" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="glass-panel rounded-2xl border border-slate-800 p-4 space-y-3 animate-pulse">
      <div className="h-6 w-full bg-slate-800 rounded mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/50">
          <div className="h-4 w-1/3 bg-slate-800/70 rounded" />
          <div className="h-4 w-1/4 bg-slate-800/70 rounded" />
          <div className="h-4 w-1/6 bg-slate-800/70 rounded" />
        </div>
      ))}
    </div>
  );
}
