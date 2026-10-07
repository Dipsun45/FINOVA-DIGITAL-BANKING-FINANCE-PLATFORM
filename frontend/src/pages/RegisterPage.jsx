import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock, UserCheck } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="glass-panel p-8 rounded-2xl border border-amber-500/40 text-center space-y-6 bg-slate-900/90 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Self-Registration Disabled</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Public self-service user registration has been removed by bank security policy.
              Bank Accounts and Fixed User IDs & Passwords are created and issued directly by Bank Administrator.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left font-mono text-xs space-y-2 text-slate-300">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <UserCheck className="w-4 h-4" />
              <span>How to Access Your Account:</span>
            </div>
            <p>1. Contact Bank Admin for User ID & Password</p>
            <p>2. Log in using your assigned User ID (e.g. USR1001)</p>
          </div>

          <div className="pt-2">
            <Link
              to="/login"
              className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login Page</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
