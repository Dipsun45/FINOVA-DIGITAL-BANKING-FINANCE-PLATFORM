import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Lock,
  Calculator,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  Percent,
  X,
  AlertTriangle
} from 'lucide-react';

export default function FixedDepositPage() {
  const { user } = useContext(AuthContext);
  const [accounts, setAccounts] = useState([]);
  const [fixedDeposits, setFixedDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFdModal, setSelectedFdModal] = useState(null);

  // Form & Calculator state
  const [principalAmount, setPrincipalAmount] = useState('5000');
  const [tenureMonths, setTenureMonths] = useState('12');
  const [payoutFrequency, setPayoutFrequency] = useState('On Maturity');
  const [accountId, setAccountId] = useState('');
  const [nomineeName, setNomineeName] = useState('');
  const [nomineeRelation, setNomineeRelation] = useState('Spouse');
  const [nomineeAge, setNomineeAge] = useState('30');
  const [autoRenewal, setAutoRenewal] = useState(false);

  // Dynamic Interest Rate Calculation
  const getRate = (m) => {
    const months = parseInt(m) || 12;
    if (months <= 6) return 6.0;
    if (months <= 12) return 7.0;
    if (months <= 36) return 7.5;
    return 8.0;
  };

  const interestRate = getRate(tenureMonths);
  const principal = parseFloat(principalAmount) || 0;
  const tenure = parseInt(tenureMonths) || 12;
  const estimatedInterest = principal * (interestRate / 100) * (tenure / 12);
  const estimatedMaturity = principal + estimatedInterest;

  const fetchData = async () => {
    try {
      const [accRes, fdRes] = await Promise.all([
        api.get('/accounts'),
        api.get('/fixed-deposits')
      ]);

      if (accRes.data.success) {
        setAccounts(accRes.data.accounts || []);
        if (accRes.data.accounts?.length > 0) {
          setAccountId(accRes.data.accounts[0]._id);
        }
      }

      if (fdRes.data.success) {
        setFixedDeposits(fdRes.data.fixedDeposits || []);
      }
    } catch (err) {
      console.error('Error fetching FD data:', err);
      toast.error('Failed to load fixed deposits data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleCreateFd = async (e) => {
    e.preventDefault();
    if (!accountId) {
      toast.error('Please select a funding account');
      return;
    }
    if (principal < 100) {
      toast.error('Minimum Fixed Deposit amount is $100');
      return;
    }
    if (!nomineeName) {
      toast.error('Please enter Nominee full name');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/fixed-deposits', {
        accountId,
        principalAmount: principal,
        tenureMonths: tenure,
        payoutFrequency,
        nomineeName,
        nomineeRelation,
        nomineeAge: parseInt(nomineeAge) || 30,
        autoRenewal
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setPrincipalAmount('5000');
        setNomineeName('');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to open Fixed Deposit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdrawFd = async (fdId) => {
    if (!window.confirm('Are you sure you want to prematurely break/withdraw this Fixed Deposit? (1% premature interest penalty applies)')) {
      return;
    }

    try {
      const res = await api.put(`/fixed-deposits/${fdId}/withdraw`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to withdraw FD');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-cyan-400">Loading Fixed Deposits...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Lock className="w-7 h-7 text-amber-400" />
          <span>High-Yield Fixed Deposits (FD)</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Lock in guaranteed returns with interest rates up to 8.0% p.a. and flexible tenure.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form & Calculator Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/90">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Calculator className="w-5 h-5 text-amber-400" />
              <span>Open New Fixed Deposit</span>
            </h3>

            <form onSubmit={handleCreateFd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Funding Source Account</label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
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
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Principal Deposit Amount ($)</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={principalAmount}
                    onChange={(e) => setPrincipalAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Tenure (Months)</label>
                  <select
                    value={tenureMonths}
                    onChange={(e) => setTenureMonths(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="6">6 Months (6.0% p.a.)</option>
                    <option value="12">12 Months / 1 Year (7.0% p.a.)</option>
                    <option value="24">24 Months / 2 Years (7.5% p.a.)</option>
                    <option value="36">36 Months / 3 Years (7.5% p.a.)</option>
                    <option value="60">60 Months / 5 Years (8.0% p.a.)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Payout Frequency</label>
                  <select
                    value={payoutFrequency}
                    onChange={(e) => setPayoutFrequency(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="On Maturity">On Maturity</option>
                    <option value="Monthly">Monthly Interest Payout</option>
                    <option value="Quarterly">Quarterly Interest Payout</option>
                  </select>
                </div>
              </div>

              {/* Nominee Details Section */}
              <div className="border-t border-slate-800 pt-4 mt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Nominee Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Nominee Full Name"
                      value={nomineeName}
                      onChange={(e) => setNomineeName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <select
                      value={nomineeRelation}
                      onChange={(e) => setNomineeRelation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Spouse">Spouse</option>
                      <option value="Child">Child</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                    </select>
                  </div>

                  <div>
                    <input
                      type="number"
                      placeholder="Nominee Age"
                      value={nomineeAge}
                      onChange={(e) => setNomineeAge(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="autoRenewal"
                  checked={autoRenewal}
                  onChange={(e) => setAutoRenewal(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="autoRenewal" className="text-xs text-slate-300">
                  Auto-renew principal & interest on maturity
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 transition-all shadow-lg shadow-amber-500/20 mt-4"
              >
                {submitting ? 'Opening Fixed Deposit...' : 'Confirm & Open Fixed Deposit'}
              </button>
            </form>
          </div>
        </div>

        {/* Live Yield Summary Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Fixed Deposit Maturity Yield Summary</span>
            </h3>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-4 font-mono">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Guaranteed Rate p.a.:</span>
                <span className="text-amber-400 font-extrabold text-base">{interestRate}%</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Principal Deposit:</span>
                <span className="text-white font-bold">${principal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Tenure Duration:</span>
                <span className="text-white font-bold">{tenure} Months</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-800 pt-3">
                <span className="text-slate-400">Total Interest Earned:</span>
                <span className="text-emerald-400 font-bold">
                  +${estimatedInterest.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-slate-800 pt-3">
                <span className="text-slate-300 font-sans font-bold">Maturity Value:</span>
                <span className="text-amber-400 font-extrabold text-lg">
                  ${estimatedMaturity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Fixed Deposits List */}
      <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span>My Active & Past Fixed Deposits</span>
        </h3>

        {fixedDeposits.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No fixed deposits opened yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fixedDeposits.map((fd) => (
              <div
                key={fd._id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 hover:border-amber-500/40 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono text-amber-400 font-bold">{fd.fdNumber}</span>
                    <h4 className="text-base font-bold text-white">${fd.principalAmount?.toLocaleString()} Deposit</h4>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      fd.status === 'Active'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {fd.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-500 block text-[10px]">INTEREST RATE</span>
                    <span className="text-emerald-400 font-bold">{fd.interestRate}% p.a.</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">MATURITY AMOUNT</span>
                    <span className="text-amber-400 font-bold">${fd.maturityAmount?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">TENURE</span>
                    <span className="text-slate-200">{fd.tenureMonths} Months</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">MATURITY DATE</span>
                    <span className="text-slate-200">{new Date(fd.maturityDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setSelectedFdModal(fd)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                  >
                    View FD Certificate
                  </button>

                  {fd.status === 'Active' && (
                    <button
                      onClick={() => handleWithdrawFd(fd._id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold"
                    >
                      Withdraw / Break FD
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FD Certificate Modal */}
      {selectedFdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card max-w-lg w-full rounded-2xl border border-amber-500/40 p-6 space-y-6 bg-slate-900">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Fixed Deposit Advice Certificate</span>
              </h3>
              <button onClick={() => setSelectedFdModal(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Certificate No:</span>
                <span className="text-amber-400 font-bold">{selectedFdModal.fdNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account Holder:</span>
                <span className="text-white font-bold">{user?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Principal Deposit:</span>
                <span className="text-white font-bold">${selectedFdModal.principalAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Interest Rate:</span>
                <span className="text-emerald-400 font-bold">{selectedFdModal.interestRate}% p.a.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Maturity Value:</span>
                <span className="text-amber-400 font-bold">${selectedFdModal.maturityAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nominee Name:</span>
                <span className="text-white">{selectedFdModal.nomineeName} ({selectedFdModal.nomineeRelation})</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
