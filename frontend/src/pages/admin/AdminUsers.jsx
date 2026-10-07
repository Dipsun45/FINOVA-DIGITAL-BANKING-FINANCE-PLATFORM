import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, ShieldAlert, CheckCircle2, XCircle, Edit, Database, RefreshCw, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDateShort } from '../../utils/formatters';
import api from '../../services/api';
import { TableSkeleton } from '../../components/SkeletonLoader';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form state for Create User
  const [userId, setUserId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [accountType, setAccountType] = useState('Checking Account');
  const [initialBalance, setInitialBalance] = useState('5000');
  const [nationalId, setNationalId] = useState('');
  const [address, setAddress] = useState('');

  // Form state for Edit User
  const [editFormData, setEditFormData] = useState({
    userId: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    status: 'Active',
    kycStatus: 'Verified',
    nationalId: '',
    address: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: { search, role: roleFilter, status: statusFilter, page, limit: 50 }
      });
      setUsers(res.data.users || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter, page]);

  const handleSeedUsers = async () => {
    if (!window.confirm('Do you want to seed/reset 20 complete mock user accounts into the system?')) return;
    setSeeding(true);
    try {
      const res = await api.post('/admin/seed-users');
      if (res.data.success) {
        toast.success(res.data.message);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to seed 20 users');
    } finally {
      setSeeding(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/users', {
        userId,
        fullName,
        email,
        phone,
        password,
        role,
        accountType,
        initialBalance,
        nationalId,
        address
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setCreateModalOpen(false);
        setUserId('');
        setFullName('');
        setEmail('');
        setPassword('');
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleOpenEditModal = (u) => {
    setSelectedUser(u);
    setEditFormData({
      userId: u.userId || '',
      fullName: u.fullName || '',
      email: u.email || '',
      phone: u.phone || '',
      password: '', // blank unless changing
      role: u.role || 'user',
      status: u.status || 'Active',
      kycStatus: u.kycStatus || 'Verified',
      nationalId: u.nationalId || '',
      address: u.address || ''
    });
    setEditModalOpen(true);
  };

  const handleUpdateUserSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const res = await api.put(`/admin/users/${selectedUser._id}`, editFormData);
      if (res.data.success) {
        toast.success(res.data.message);
        setEditModalOpen(false);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user details');
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    try {
      await api.put(`/admin/users/${user._id}`, { status: newStatus });
      toast.success(`User ${user.fullName} status set to ${newStatus}`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/90">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-purple-400" />
            <span>Admin User Management & 20-User Database</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create users with Fixed User ID & Password, manage profile details, and seed mock users.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSeedUsers}
            disabled={seeding}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center space-x-2"
          >
            <Database className="w-4 h-4" />
            <span>{seeding ? 'Seeding 20 Users...' : 'Seed 20 User Accounts'}</span>
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Fixed User ID</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/80">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search User ID, Name, Email, Phone..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
          />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white">
          <option value="All">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white">
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4 font-semibold">User ID</th>
                  <th className="p-4 font-semibold">Full Name / Email</th>
                  <th className="p-4 font-semibold">Phone</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">KYC</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/50">
                    <td className="p-4 font-mono font-bold text-cyan-400">
                      {u.userId || 'USR1000'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img src={u.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                        <div>
                          <p className="font-bold text-white">{u.fullName}</p>
                          <p className="text-[10px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300 font-mono">{u.phone}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-300'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300 font-semibold">{u.kycStatus || 'Verified'}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(u)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                      >
                        Edit / Reset Password
                      </button>

                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${u.status === 'Active' ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'}`}
                      >
                        {u.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg glass-panel border border-slate-700 rounded-2xl p-6 space-y-4 bg-slate-900">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-400" />
              <span>Create User with Fixed User ID & Password</span>
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Fixed User ID</label>
                  <input
                    type="text"
                    placeholder="e.g. USR1021"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono font-bold text-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Fixed Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-2 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Initial Bal ($)</label>
                  <input
                    type="number"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                >
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Reset Password User Modal */}
      {editModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg glass-panel border border-slate-700 rounded-2xl p-6 space-y-4 bg-slate-900">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Edit className="w-5 h-5 text-cyan-400" />
              <span>Edit User ID & Reset Password</span>
            </h3>

            <form onSubmit={handleUpdateUserSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Fixed User ID</label>
                  <input
                    type="text"
                    value={editFormData.userId}
                    onChange={(e) => setEditFormData({ ...editFormData, userId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono font-bold text-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Reset Password (Optional)</label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep unchanged"
                    value={editFormData.password}
                    onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editFormData.fullName}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Role</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="w-full px-2 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-2 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">KYC Status</label>
                  <select
                    value={editFormData.kycStatus}
                    onChange={(e) => setEditFormData({ ...editFormData, kycStatus: e.target.value })}
                    className="w-full px-2 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs"
                  >
                    <option value="Verified">Verified</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Save User Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
