import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Banknote,
  Calculator,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  Building2,
  DollarSign,
  User,
  X
} from 'lucide-react';

export default function CashDepositPage() {
  const { user } = useContext(AuthContext);
  const [accounts, setAccounts] = useState([]);
  const [slips, setSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSlipModal, setSelectedSlipModal] = useState(null);

  // Cash Denominations
  const [denominations, setDenominations] = useState({
    d2000: 0, // $100 / ₹2000
    d500: 0,  // $50 / ₹500
    d200: 0,  // $20 / ₹200
    d100: 0,  // $10 / ₹100
    d50: 0,   // $5 / ₹50
    d20: 0,   // $2 / ₹20
    d10: 0    // $1 / ₹10
  });

  const [formData, setFormData] = useState({
    accountId: '',
    depositorName: '',
    depositorPhone: '',
    branchCode: 'FN-MAIN-001',
    remark: 'Cash Deposit into Account'
  });

  const fetchData = async () => {
    try {
      const [accRes, slipRes] = await Promise.all([
        api.get('/accounts'),
        api.get('/cash-deposits')
      ]);

      if (accRes.data.success) {
        setAccounts(accRes.data.accounts || []);
        if (accRes.data.accounts?.length > 0) {
          setFormData((prev) => ({
            ...prev,
            accountId: accRes.data.accounts[0]._id,
            depositorName: user?.fullName || '',
            depositorPhone: user?.phone || ''
          }));
        }
      }

      if (slipRes.data.success) {
        setSlips(slipRes.data.slips || []);
      }
    } catch (err) {
      console.error('Error fetching cash deposit data:', err);
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Calculate Grand Total
  const calculatedTotal =
    (parseInt(denominations.d2000) || 0) * 2000 +
    (parseInt(denominations.d500) || 0) * 500 +
    (parseInt(denominations.d200) || 0) * 200 +
    (parseInt(denominations.d100) || 0) * 100 +
    (parseInt(denominations.d50) || 0) * 50 +
    (parseInt(denominations.d20) || 0) * 20 +
    (parseInt(denominations.d10) || 0) * 10;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.accountId) {
      toast.error('Please select an account');
      return;
    }
    if (calculatedTotal <= 0) {
      toast.error('Please enter cash denomination counts');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/cash-deposits', {
        ...formData,
        denominations,
        totalAmount: calculatedTotal
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setSelectedSlipModal(res.data.slip);
        setDenominations({ d2000: 0, d500: 0, d200: 0, d100: 0, d50: 0, d20: 0, d10: 0 });
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cash deposit failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-cyan-400">Loading Cash Deposit Services...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Banknote className="w-7 h-7 text-emerald-400" />
          <span>Cash Deposit Slip & Account Credit</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Fill the denomination cash deposit slip to submit cash directly into your bank account.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Slip Form Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/90">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Calculator className="w-5 h-5 text-emerald-400" />
              <span>Cash Denomination Calculator & Slip Details</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Account Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Deposit Account</label>
                  <select
                    value={formData.accountId}
                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  >
                    {accounts.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.accountType} ({acc.accountNumber}) - ${acc.balance?.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Depositor Name</label>
                  <input
                    type="text"
                    value={formData.depositorName}
                    onChange={(e) => setFormData({ ...formData, depositorName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Denominations Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800 uppercase">
                    <tr>
                      <th className="py-2.5 px-4">Denomination</th>
                      <th className="py-2.5 px-4 text-center">Count / Notes</th>
                      <th className="py-2.5 px-4 text-right">Subtotal ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-mono text-slate-200">
                    {[
                      { key: 'd2000', label: '$100 Notes', val: 2000 },
                      { key: 'd500', label: '$50 Notes', val: 500 },
                      { key: 'd200', label: '$20 Notes', val: 200 },
                      { key: 'd100', label: '$10 Notes', val: 100 },
                      { key: 'd50', label: '$5 Notes', val: 50 },
                      { key: 'd20', label: '$2 Notes', val: 20 },
                      { key: 'd10', label: '$1 Notes', val: 10 }
                    ].map((row) => (
                      <tr key={row.key} className="hover:bg-slate-900/50">
                        <td className="py-2 px-4 font-semibold text-white">{row.label}</td>
                        <td className="py-2 px-4 text-center">
                          <input
                            type="number"
                            min="0"
                            value={denominations[row.key] || ''}
                            onChange={(e) =>
                              setDenominations({ ...denominations, [row.key]: parseInt(e.target.value) || 0 })
                            }
                            className="w-20 text-center bg-slate-900 border border-slate-700 rounded-lg py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                            placeholder="0"
                          />
                        </td>
                        <td className="py-2 px-4 text-right font-bold text-emerald-400">
                          ${((denominations[row.key] || 0) * row.val).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-900 font-bold border-t border-slate-800">
                    <tr>
                      <td colSpan="2" className="py-3 px-4 text-white uppercase text-xs">
                        Grand Total Cash Deposit Amount:
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-base text-emerald-400">
                        ${calculatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || calculatedTotal <= 0}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {submitting ? 'Processing Cash Deposit...' : 'Submit Cash & Deposit to Account'}
              </button>
            </form>
          </div>
        </div>

        {/* Deposit Slip Summary Preview Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Deposit Slip Voucher Summary</span>
            </h3>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Depositor:</span>
                <span className="text-white font-bold">{formData.depositorName || user?.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Branch Code:</span>
                <span className="text-white">{formData.branchCode}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Cash Currency:</span>
                <span className="text-cyan-400 font-bold">USD ($)</span>
              </div>
              <div className="flex justify-between pt-2 text-sm">
                <span className="text-slate-400">Cash Amount:</span>
                <span className="text-emerald-400 font-bold">
                  ${calculatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Deposit Slips History */}
      <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-400" />
          <span>Recent Cash Deposit Slips</span>
        </h3>

        {slips.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No cash deposit slips filed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Slip Number</th>
                  <th className="py-3 px-4">Depositor</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Voucher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm font-mono">
                {slips.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-900/50">
                    <td className="py-3 px-4 font-bold text-white">{s.slipNumber}</td>
                    <td className="py-3 px-4 text-slate-300 font-sans">{s.depositorName}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">
                      ${s.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400 font-sans">
                      {new Date(s.createdAt || s.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => setSelectedSlipModal(s)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
                      >
                        View Voucher
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cash Slip Voucher Modal */}
      {selectedSlipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card max-w-lg w-full rounded-2xl border border-slate-700 p-6 space-y-6 bg-slate-900">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-400" />
                <span>Official Cash Deposit Slip Receipt</span>
              </h3>
              <button
                onClick={() => setSelectedSlipModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Slip Number:</span>
                <span className="text-emerald-400 font-bold">{selectedSlipModal.slipNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Depositor Name:</span>
                <span className="text-white font-bold">{selectedSlipModal.depositorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Branch Code:</span>
                <span className="text-white">{selectedSlipModal.branchCode}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 text-sm">
                <span className="text-slate-400">Total Deposited Cash:</span>
                <span className="text-emerald-400 font-bold">
                  ${selectedSlipModal.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Credit Status:</span>
                <span className="text-emerald-400 font-bold uppercase">{selectedSlipModal.status}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Deposit Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
