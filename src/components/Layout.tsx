import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, PieChart, Target, LogOut, Wallet, Settings as SettingsIcon, AlertTriangle, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useState, useEffect } from 'react';
import './Layout.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transactions', label: 'Mutasi', icon: Receipt },
  { path: '/budgets', label: 'Anggaran', icon: Target },
  { path: '/reports', label: 'Laporan', icon: PieChart },
  { path: '/settings', label: 'Pengaturan', icon: SettingsIcon },
];

export default function Layout() {
  const { budgets, transactions, categories } = useData();
  const [toasts, setToasts] = useState<{id: string, message: string}[]>([]);

  useEffect(() => {
    // Check budgets on change
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const newToasts: {id: string, message: string}[] = [];

    budgets.filter(b => b.month === currentMonth && b.year === currentYear).forEach(budget => {
      const spent = transactions
        .filter(t => {
          const d = new Date(t.date);
          return t.categoryId === budget.categoryId && (d.getMonth() + 1) === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((s, t) => s + t.amount, 0);

      const percentage = (spent / budget.amount) * 100;
      const cat = categories.find(c => c.id === budget.categoryId);
      
      // We use sessionStorage to avoid spamming the same notification during a session
      const thresholdKey = `notified_${budget.id}`;
      const lastNotified = Number(sessionStorage.getItem(thresholdKey)) || 0;

      let currentThreshold = 0;
      if (percentage >= 100) currentThreshold = 100;
      else if (percentage >= 90) currentThreshold = 90;
      else if (percentage >= 80) currentThreshold = 80;

      if (currentThreshold > lastNotified) {
        newToasts.push({
          id: `${budget.id}-${currentThreshold}`,
          message: `Perhatian: Pengeluaran untuk "${cat?.name}" telah mencapai ${currentThreshold}% dari anggaran.`
        });
        sessionStorage.setItem(thresholdKey, currentThreshold.toString());
      }
    });

    if (newToasts.length > 0) {
      setToasts(prev => [...prev, ...newToasts]);
    }
  }, [transactions, budgets, categories]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="app-container">
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className="toast fade-in">
            <AlertTriangle size={18} className="toast-icon" />
            <span>{toast.message}</span>
            <button className="icon-btn" onClick={() => removeToast(toast.id)}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Sidebar for Desktop */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <Wallet className="logo-icon" size={32} />
            <h1 className="logo-text">M-Uang</h1>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-btn">
            <LogOut size={20} className="nav-icon" />
            <span className="nav-label">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="mobile-header">
          <Wallet className="logo-icon" size={24} />
          <h1 className="logo-text">M-Uang</h1>
        </header>
        
        <div className="content-wrapper fade-in">
          <Outlet />
        </div>
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} className="nav-icon" />
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
