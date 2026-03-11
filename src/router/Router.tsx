import { useState, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import Accounts from '../pages/Accounts/Accounts';
import Transfers from '../pages/Transfers/Transfers';
import Payments from '../pages/Payments/Payments';
import Transactions from '../pages/Transactions/Transactions';
import Profile from '../pages/Profile/Profile';
import Security from '../pages/Security/Security';
import Support from '../pages/Support/Support';

function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAuthPage = location.pathname === '/auth';

  useEffect(() => {
    const handler = () => setSidebarOpen(true);
    document.addEventListener('toggle-sidebar', handler);
    return () => document.removeEventListener('toggle-sidebar', handler);
  }, []);

  if (isAuthPage || !user) {
    return (
      <Routes>
        <Route path="/auth" element={<Login />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-content" style={{
        flex: 1,
        marginLeft: 'var(--sidebar-width)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        transition: 'margin-left var(--transition-normal)',
      }}>
        <Navbar />
        <main style={{ flex: 1, overflow: 'auto' }}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/transfers" element={<Transfers />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/security" element={<Security />} />
            <Route path="/support" element={<Support />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function Router() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
