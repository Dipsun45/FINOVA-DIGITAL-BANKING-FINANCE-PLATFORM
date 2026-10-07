import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Wallet, CreditCard, Lock, TrendingUp, Zap, CheckCircle2, Globe, Users, Award, UserCheck } from 'lucide-react';
import Hero3DCanvas from '../components/Hero3DCanvas';

export default function LandingPage() {
  return (
    <div className="space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative pt-12 md:pt-20 overflow-hidden">
        {/* Subtle background glow blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 text-center lg:text-left z-10"
          >
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wide">
              <Zap className="w-3.5 h-3.5" />
              <span>Next-Gen Digital Banking & Finance Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-none">
              Your Money. Your Future. <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
                Your Finova.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              A smarter digital banking experience with Cheque clearance, Cash deposit slips, High-Yield Fixed Deposits, and Virtual ATM Machine cash withdrawals.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-base shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center space-x-3 group"
              >
                <UserCheck className="w-5 h-5" />
                <span>Client Portal Login</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel text-slate-300 hover:text-white hover:border-slate-600 font-semibold text-base transition-all text-center"
              >
                Explore Features
              </a>
            </div>

            {/* Feature highlights bullets */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-left">
              <div>
                <p className="text-2xl font-extrabold text-white">20 Users</p>
                <p className="text-xs text-slate-400">Fixed Accounts</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white">8.0% p.a.</p>
                <p className="text-xs text-slate-400">Fixed Deposit Rate</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white">24/7 ATM</p>
                <p className="text-xs text-slate-400">Virtual Machine</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: 3D Interactive Card Canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <Hero3DCanvas />
          </motion.div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">Engineered for Banking Excellence</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white">Comprehensive Banking Suite</p>
          <p className="text-sm text-slate-400">
            From Cheques, Cash Deposit Slips, and Fixed Deposits to ATM Cash Withdrawals with 4-Digit PINs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Wallet,
              title: 'Cheque & Cash Deposit Slips',
              desc: 'Submit cheques for deposit or cash withdrawal clearance, and file cash deposit slips with note denomination counters.',
              color: 'from-cyan-500 to-blue-600'
            },
            {
              icon: Lock,
              title: 'High-Yield Fixed Deposits',
              desc: 'Open Fixed Deposits with customizable tenure, nominee details, guaranteed up to 8.0% interest rates and maturity certificates.',
              color: 'from-amber-500 to-yellow-600'
            },
            {
              icon: CreditCard,
              title: 'ATM Cards & Cash Simulator',
              desc: 'Issue debit/credit ATM cards with custom 4-digit PINs, daily withdrawal limits, and realistic Virtual ATM Machine cash dispenser.',
              color: 'from-emerald-500 to-teal-600'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="glass-card p-8 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all hover:-translate-y-1 group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-10 md:p-16 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 text-center space-y-6 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Experience Modern Digital Banking
          </h2>
          <p className="text-cyan-100 max-w-xl mx-auto text-base">
            Log in with fixed User IDs or Email to explore all digital banking features today.
          </p>
          <div className="pt-4 flex justify-center">
            <Link
              to="/login"
              className="px-8 py-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-base shadow-xl transition-all flex items-center space-x-2"
            >
              <span>Access Client Portal</span>
              <ArrowRight className="w-5 h-5 text-cyan-400" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
