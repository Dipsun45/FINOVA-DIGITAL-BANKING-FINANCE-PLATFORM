import React, { useState, useEffect } from 'react';
import { Landmark, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency, formatDateShort } from '../../utils/formatters';
import api from '../../services/api';

export default function AdminLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = async () => {
    try {
      const res = await api.get('/loans');
      setLoans(res.data.loans || []);
    } catch (err) {
      toast.error('Failed to load loan applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleUpdateStatus = async (loanId, status) => {
    try {
      await api.put(`/admin/loans/${loanId}`, { status });
      toast.success(`Loan application ${status.toLowerCase()}!`);
      fetchLoans();
    } catch (err) {
      toast.error('Failed to update loan status');
    }
  };

  return (
    <div className="space-y-8">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h1 className="text-2xl font-extrabold text-white">Loan Application Governance</h1>
        <p className="text-xs text-slate-400 mt-1">Review pending credit requests and approve disbursements</p>
      </div>

      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4 font-semibold">Loan Type</th>
              <th className="p-4 font-semibold">Amount</th>
              <th className="p-4 font-semibold">Monthly EMI</th>
              <th className="p-4 font-semibold">Duration</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 text-right">Review Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loans.map((loan) => (
              <tr key={loan._id} className="hover:bg-slate-800/40">
                <td className="p-4 font-bold text-white">{loan.loanType}</td>
                <td className="p-4 text-slate-200 font-bold">{formatCurrency(loan.amount)}</td>
                <td className="p-4 text-cyan-400 font-bold">{formatCurrency(loan.monthlyEMI)}</td>
                <td className="p-4 text-slate-400">{loan.durationMonths} Months</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${loan.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : loan.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
                    {loan.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  {loan.status === 'Pending' ? (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(loan._id, 'Approved')}
                        className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(loan._id, 'Rejected')}
                        className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="text-slate-500 text-[10px]">Reviewed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
