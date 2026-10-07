import React from 'react';
import { FolderOpen } from 'lucide-react';

export default function EmptyState({ title = 'No data found', description = 'There are no records to display at this time.', icon: Icon = FolderOpen, actionText, onAction }) {
  return (
    <div className="py-12 px-6 flex flex-col items-center justify-center text-center glass-panel rounded-2xl border border-slate-800">
      <div className="w-16 h-16 rounded-2xl bg-slate-800/80 text-cyan-400 flex items-center justify-center mb-4 shadow-inner">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-400 max-w-sm">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-6 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
