import React, { useState } from 'react';
import { Settings, Save, ShieldCheck, Database, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [savingsRate, setSavingsRate] = useState('5.0');
  const [wireFee, setWireFee] = useState('5.00');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    toast.success('System settings saved successfully');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h1 className="text-2xl font-extrabold text-white">System Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Configure global banking rates, maintenance modes, and fee structures</p>
      </div>

      <form onSubmit={handleSaveSettings} className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
        <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">Financial Rates & Fees</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Savings Interest Rate (% APY)</label>
            <input
              type="number"
              step="0.1"
              value={savingsRate}
              onChange={(e) => setSavingsRate(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl glass-input text-sm font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">International Wire Fee ($)</label>
            <input
              type="number"
              step="0.01"
              value={wireFee}
              onChange={(e) => setWireFee(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl glass-input text-sm font-bold"
            />
          </div>
        </div>

        <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 pt-4">System Governance</h3>

        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div>
            <p className="text-sm font-semibold text-white">Maintenance Mode</p>
            <p className="text-xs text-slate-400">Restrict non-admin user access during scheduled upgrades</p>
          </div>
          <button
            type="button"
            onClick={() => setMaintenanceMode(!maintenanceMode)}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${maintenanceMode ? 'bg-purple-600' : 'bg-slate-700'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${maintenanceMode ? 'translate-x-6' : ''}`} />
          </button>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save System Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
