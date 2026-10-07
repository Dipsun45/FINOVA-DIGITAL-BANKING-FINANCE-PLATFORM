import React from 'react';
import { ShieldCheck, Lock, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-900">
          {/* Brand & Disclaimer */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-2xl tracking-wider text-white">FINOVA</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
              Smart Banking. Smarter Financial Future. Next-generation personal financial management, real-time analytics, and virtual banking experience.
            </p>
            <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-xs text-cyan-300 flex items-start space-x-2">
              <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Educational & Demo Disclaimer:</strong> FINOVA is a demonstration digital banking platform created for educational purposes. It is not a real financial institution.
              </span>
            </div>
          </div>

          {/* Column 1: Product */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Digital Checking</a></li>
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">High-Yield Savings</a></li>
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Virtual Cards</a></li>
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Investment Portfolio</a></li>
            </ul>
          </div>

          {/* Column 2: Company */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#about" className="hover:text-cyan-400 transition-colors">About Us</a></li>
              <li><a href="#security" className="hover:text-cyan-400 transition-colors">Security Center</a></li>
              <li><a href="#contact" className="hover:text-cyan-400 transition-colors">Careers</a></li>
              <li><a href="#contact" className="hover:text-cyan-400 transition-colors">Press & News</a></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#help" className="hover:text-cyan-400 transition-colors">Help Center</a></li>
              <li><a href="#help" className="hover:text-cyan-400 transition-colors">API Documentation</a></li>
              <li><a href="#privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-cyan-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 FINOVA Platform Inc. Demo Financial Platform. All rights reserved.</p>
          <div className="flex items-center space-x-6 mt-4 sm:mt-0">
            <span className="flex items-center space-x-1">
              <Globe className="w-3.5 h-3.5" />
              <span>English (US)</span>
            </span>
            <span>USD ($)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
