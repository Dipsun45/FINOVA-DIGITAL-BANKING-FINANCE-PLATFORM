import React, { useContext } from 'react';
import { Gauge, CheckCircle2, ShieldAlert, Award, Clock, Activity } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function CreditScorePage() {
  const { user } = useContext(AuthContext);
  const score = user?.creditScore || 785;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Credit Score Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Simulated credit rating and financial health analysis</p>
        </div>
      </div>

      {/* Simulated Notice */}
      <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-300 flex items-center space-x-2">
        <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0" />
        <span>
          <strong>Simulated Score Notice:</strong> Your credit rating displayed here is a demonstration benchmark for educational financial tracking.
        </span>
      </div>

      {/* Main Score Radial Gauge */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-4 max-w-lg mx-auto glow-cyan">
        <div className="w-40 h-40 rounded-full border-8 border-cyan-500/30 border-t-cyan-400 flex flex-col items-center justify-center mx-auto shadow-2xl">
          <span className="text-4xl font-black text-white tracking-tight">{score}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">OUT OF 900</span>
        </div>
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 font-extrabold text-sm border border-emerald-500/30">
          <Award className="w-4 h-4" />
          <span>EXCELLENT RATING</span>
        </div>
        <p className="text-xs text-slate-400">
          Your financial behavior qualifies for top-tier low-interest loan disbursements and credit limit boosts.
        </p>
      </div>

      {/* Breakdown Factor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: 'Payment History (35%)', desc: '100% On-time bill payments recorded', status: 'Excellent', color: 'text-emerald-400' },
          { title: 'Credit Utilization (30%)', desc: 'Using 14% of $25,000 available limit', status: 'Good', color: 'text-cyan-400' },
          { title: 'Age of Credit (15%)', desc: 'Average account age: 4.2 years', status: 'Optimal', color: 'text-emerald-400' },
          { title: 'Credit Inquiries (10%)', desc: '0 hard inquiries in the last 12 months', status: 'Perfect', color: 'text-purple-400' }
        ].map((f, idx) => (
          <div key={idx} className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">{f.title}</h4>
              <p className="text-xs text-slate-400">{f.desc}</p>
            </div>
            <span className={`text-xs font-extrabold px-3 py-1 rounded-full bg-slate-900 border border-slate-700 ${f.color}`}>
              {f.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
