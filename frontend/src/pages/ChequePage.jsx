import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  FileCheck,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Building2,
  DollarSign,
  User,
  ShieldAlert,
  Printer,
  X
} from 'lucide-react';

export default function ChequePage() {
  const { user } = useContext(AuthContext);
  const [accounts, setAccounts] = useState([]);
  const [cheques, setCheques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('Deposit'); // 'Deposit' or 'Withdrawal'
  const [selectedChequeModal, setSelectedChequeModal] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    accountId: '',
    chequeNumber: '',
    bankName: 'Finova Digital Bank',
    payeeName: '',
    drawerName: '',
    amount: '',
    chequeImage: ''
  });

  const fetchData = async () => {
    try {
      const [accRes, chqRes] = await Promise.all([
        api.get('/accounts'),
        api.get('/cheques')
      ]);

      if (accRes.data.success) {
        setAccounts(accRes.data.accounts || []);
        if (accRes.data.accounts?.length > 0) {
          setFormData((prev) => ({ ...prev, accountId: accRes.data.accounts[0]._id, payeeName: user?.fullName || '' }));
        }
      }

      if (chqRes.data.success) {
        setCheques(chqRes.data.cheques || []);
      }
    } catch (err) {
      console.error('Error fetching cheque data:', err);
      toast.error('Failed to load accounts and cheque history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.accountId || !formData.chequeNumber || !formData.amount) {
      toast.error('Please fill in all required cheque details');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/cheques', {
        ...formData,
        chequeType: activeTab,
        payeeName: formData.payeeName || user?.fullName || 'Valued Client',
        drawerName: formData.drawerName || user?.fullName || 'Finova Account Holder'
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setFormData({
          accountId: accounts[0]?._id || '',
          chequeNumber: '',
          bankName: 'Finova Digital Bank',
          payeeName: user?.fullName || '',
          drawerName: user?.fullName || '',
          amount: '',
          chequeImage: ''
        });
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit cheque');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-cyan-400">Loading Cheque Services...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileCheck className="w-7 h-7 text-cyan-400" />
            <span>Cheque Services & Cash Withdrawal</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Submit cheques for deposit clearance or request cash withdrawal via bank cheque.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800">
            {/* Tab Selector */}
            <div className="flex p-1 bg-slate-900/80 rounded-xl border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('Deposit')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'Deposit'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Submit Cheque Deposit</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('Withdrawal')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'Withdrawal'
                    ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Cheque Cash Withdrawal</span>
              </button>
            </div>

            {/* Interactive Cheque Slip Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Select Account</label>
                  <select
                    value={formData.accountId}
                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
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
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">6-Digit Cheque Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 849201"
                    value={formData.chequeNumber}
                    onChange={(e) => setFormData({ ...formData, chequeNumber: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Drawn Bank Name</label>
                  <input
                    type="text"
                    placeholder="Bank Name"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Cheque Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                    {activeTab === 'Deposit' ? 'Payee Name (Receiver)' : 'Payee Name (Cash Beneficiary)'}
                  </label>
                  <input
                    type="text"
                    placeholder="FullName"
                    value={formData.payeeName}
                    onChange={(e) => setFormData({ ...formData, payeeName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Drawer Name (Account Owner)</label>
                  <input
                    type="text"
                    placeholder="Account Owner"
                    value={formData.drawerName}
                    onChange={(e) => setFormData({ ...formData, drawerName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg mt-4 ${
                  activeTab === 'Deposit'
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20'
                }`}
              >
                {submitting ? 'Processing Submission...' : `Submit Cheque for ${activeTab}`}
              </button>
            </form>
          </div>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-amber-900/10 via-slate-900 to-slate-950 relative overflow-hidden">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Digital Cheque Preview</span>
            </h3>

            {/* Cheque Graphic */}
            <div className="bg-slate-900/90 border-2 border-dashed border-amber-500/40 rounded-xl p-5 space-y-4 shadow-xl">
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div>
                  <p className="text-xs font-extrabold text-white uppercase">{formData.bankName || 'FINOVA DIGITAL BANK'}</p>
                  <p className="text-[10px] text-slate-400">FINANCIAL CLEARING HOUSE</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">CHEQUE NO.</p>
                  <p className="text-xs font-mono font-bold text-amber-400">#{formData.chequeNumber || '000000'}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">PAY TO THE ORDER OF:</span>
                  <span className="font-semibold text-white">{formData.payeeName || 'Valued Payee'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">THE SUM OF:</span>
                  <span className="font-mono font-bold text-cyan-400">
                    ${parseFloat(formData.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">PURPOSE:</span>
                  <span className="text-slate-200">Cheque {activeTab} Clearance</span>
                </div>
              </div>

              <div className="pt-3 flex justify-between items-end">
                <div className="text-[10px] text-slate-500 font-mono">
                  ⑈{formData.chequeNumber || '000000'}⑈ 019283409⑈ 100293⑈
                </div>
                <div className="text-right">
                  <div className="h-6 font-serif italic text-cyan-300 text-xs border-b border-slate-700 px-2">
                    {formData.drawerName || user?.fullName}
                  </div>
                  <span className="text-[9px] text-slate-400">AUTHORIZED SIGNATURE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cheque History */}
      <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          <span>Cheque Submissions & Clearing History</span>
        </h3>

        {cheques.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No cheque records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Ref / Cheque #</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Payee / Bank</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {cheques.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-white">
                      #{c.chequeNumber}
                      <span className="block text-[10px] text-slate-500">{c.referenceNumber}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          c.chequeType === 'Deposit'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        }`}
                      >
                        {c.chequeType === 'Deposit' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {c.chequeType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      <div>{c.payeeName}</div>
                      <div className="text-xs text-slate-400">{c.bankName}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-white font-mono">
                      ${c.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          c.status === 'Approved' || c.status === 'Cleared'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : c.status === 'Rejected'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                        }`}
                      >
                        {c.status === 'Approved' || c.status === 'Cleared' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : c.status === 'Rejected' ? (
                          <XCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400">
                      {new Date(c.createdAt || c.issueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedChequeModal(c)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors"
                      >
                        View Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable Receipt Modal */}
      {selectedChequeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card max-w-lg w-full rounded-2xl border border-slate-700 p-6 space-y-6 bg-slate-900">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-cyan-400" />
                <span>Cheque Clearance Voucher</span>
              </h3>
              <button
                onClick={() => setSelectedChequeModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Voucher Ref:</span>
                <span className="text-cyan-400 font-bold">{selectedChequeModal.referenceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cheque Number:</span>
                <span className="text-white font-bold">#{selectedChequeModal.chequeNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction Type:</span>
                <span className="text-white">Cheque {selectedChequeModal.chequeType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bank Name:</span>
                <span className="text-white">{selectedChequeModal.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payee Name:</span>
                <span className="text-white">{selectedChequeModal.payeeName}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 text-sm">
                <span className="text-slate-400">Total Amount:</span>
                <span className="text-emerald-400 font-bold">
                  ${selectedChequeModal.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Clearing Status:</span>
                <span className="text-amber-400 font-bold uppercase">{selectedChequeModal.status}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
