import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';
import NotFound from './pages/NotFound';

function ProtectedRoute() {
  const isOnboarded = localStorage.getItem('onboarding_complete') === 'true';
  
  if (!isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <Layout />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
