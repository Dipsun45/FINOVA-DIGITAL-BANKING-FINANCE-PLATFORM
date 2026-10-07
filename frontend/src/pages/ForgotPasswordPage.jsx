import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    toast.success('Password reset link sent to your email!');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-cyan-500/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Reset Password</h2>
          <p className="text-xs text-slate-400">Enter your registered email to receive reset instructions</p>
        </div>

        {submitted ? (
          <div className="glass-panel p-8 rounded-2xl border border-emerald-500/30 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Check Your Inbox</h3>
            <p className="text-xs text-slate-300">
              We have sent a secure password reset link to <strong className="text-cyan-400">{email}</strong>.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-block px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
              >
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2"
            >
              <span>Send Reset Instructions</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-xs text-slate-400">
              Remember your password?{' '}
              <Link to="/login" className="text-cyan-400 font-semibold hover:underline">
                Back to Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
