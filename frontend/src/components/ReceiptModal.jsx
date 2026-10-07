import React from 'react';
import { X, CheckCircle, Download, Printer, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function ReceiptModal({ isOpen, onClose, transaction }) {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg glass-panel border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-950 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg text-white tracking-wider">FINOVA RECEIPT</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status & Amount */}
        <div className="text-center py-4 space-y-2 bg-slate-900/60 rounded-xl border border-slate-800">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
            <CheckCircle className="w-6 h-6" />
          </div>
          <p className="text-xs uppercase tracking-widest text-emerald-400 font-bold">TRANSACTION SUCCESSFUL</p>
          <h2 className="text-3xl font-extrabold text-white">{formatCurrency(transaction.amount)}</h2>
          <p className="text-xs text-slate-400">{transaction.description}</p>
        </div>

        {/* Breakdown Details */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400">Reference Number</span>
            <span className="font-mono text-cyan-400 font-semibold">{transaction.referenceNumber}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400">Transaction Type</span>
            <span className="font-medium text-white">{transaction.type}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400">Date & Time</span>
            <span className="text-slate-200">{formatDate(transaction.date || transaction.createdAt)}</span>
          </div>
          {transaction.recipientName && (
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Recipient</span>
              <span className="text-slate-200 font-medium">{transaction.recipientName}</span>
            </div>
          )}
          {transaction.senderName && (
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Sender</span>
              <span className="text-slate-200 font-medium">{transaction.senderName}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400">Category</span>
            <span className="text-slate-200">{transaction.category || 'General'}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center space-x-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
