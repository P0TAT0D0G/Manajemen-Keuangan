import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, PieChart, Target, LogOut, Wallet } from 'lucide-react';
import './Layout.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transactions', label: 'Mutasi', icon: Receipt },
  { path: '/budgets', label: 'Anggaran', icon: Target },
  { path: '/reports', label: 'Laporan', icon: PieChart },
];

export default function Layout() {
  return (
    <div className="app-container">
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
