import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthContext } from './context/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// User Protected Pages
import UserDashboard from './pages/UserDashboard';
import AccountsPage from './pages/AccountsPage';
import AccountDetailPage from './pages/AccountDetailPage';
import TransferPage from './pages/TransferPage';
import TransactionsPage from './pages/TransactionsPage';
import CardsPage from './pages/CardsPage';
import ChequePage from './pages/ChequePage';
import CashDepositPage from './pages/CashDepositPage';
import FixedDepositPage from './pages/FixedDepositPage';
import BillsPage from './pages/BillsPage';
import BudgetsPage from './pages/BudgetsPage';
import ExpensesPage from './pages/ExpensesPage';
import SavingsPage from './pages/SavingsPage';
import InvestmentsPage from './pages/InvestmentsPage';
import LoansPage from './pages/LoansPage';
import CreditScorePage from './pages/CreditScorePage';
import NotificationsPage from './pages/NotificationsPage';
import SupportPage from './pages/SupportPage';
import ProfilePage from './pages/ProfilePage';
import SecurityPage from './pages/SecurityPage';

// Admin Protected Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAccounts from './pages/admin/AdminAccounts';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminLoans from './pages/admin/AdminLoans';
import AdminSupport from './pages/admin/AdminSupport';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminSettings from './pages/admin/AdminSettings';

// Route Guards
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center text-cyan-400">Loading Finova...</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-purple-400">Loading Admin...</div>;
  return isAuthenticated && isAdmin ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0F172A',
            color: '#F8FAFC',
            border: '1px solid #1E293B',
            borderRadius: '12px',
            fontSize: '13px'
          }
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* User Authenticated Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="accounts/:id" element={<AccountDetailPage />} />
          <Route path="transfer" element={<TransferPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="cards" element={<CardsPage />} />
          <Route path="cheques" element={<ChequePage />} />
          <Route path="cash-deposit" element={<CashDepositPage />} />
          <Route path="fixed-deposits" element={<FixedDepositPage />} />
          <Route path="bills" element={<BillsPage />} />
          <Route path="budgets" element={<BudgetsPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="savings" element={<SavingsPage />} />
          <Route path="investments" element={<InvestmentsPage />} />
          <Route path="loans" element={<LoansPage />} />
          <Route path="credit-score" element={<CreditScorePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="security" element={<SecurityPage />} />
        </Route>

        {/* Admin Protected Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="accounts" element={<AdminAccounts />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="loans" element={<AdminLoans />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
