import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, Eye, EyeOff, Plus, Receipt } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { wallets, transactions, categories } = useData();
  const [showBalance, setShowBalance] = useState(true);

  // Calculates
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthTxs = transactions.filter(tx => {
    const d = new Date(tx.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const income = currentMonthTxs.filter(t => t.type === 'In').reduce((s, t) => s + t.amount, 0);
  const expense = currentMonthTxs.filter(t => t.type === 'Out').reduce((s, t) => s + t.amount, 0);

  // Group by category for expenses
  const expensesByCategory = currentMonthTxs
    .filter(t => t.type === 'Out')
    .reduce((acc, tx) => {
      acc[tx.categoryId] = (acc[tx.categoryId] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.keys(expensesByCategory)
    .map(catId => {
      const cat = categories.find(c => c.id === catId);
      return {
        name: cat?.name || 'Unknown',
        value: expensesByCategory[catId]
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 3); // Top 3

  const COLORS = ['#114232', '#87A922', '#F59E0B', '#EF4444'];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const getIcon = (name: string) => {
    // A simple mock since we store icon strings in categories
    return <Receipt size={24} />;
  };

  return (
    <div className="dashboard-container fade-in">
      <div className="dashboard-header">
        <div>
          <h2 className="page-title">Ringkasan Uang</h2>
          <p className="page-subtitle">Kondisi keuanganmu bulan ini</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card primary">
          <div className="card-decoration"></div>
          <div className="card-label">
            <Wallet size={16} /> Total Saldo
            <button 
              onClick={() => setShowBalance(!showBalance)}
              style={{ color: 'inherit', marginLeft: 'auto' }}
              aria-label={showBalance ? "Sembunyikan Saldo" : "Tampilkan Saldo"}
            >
              {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <h3 className="card-amount tabular-nums">
            {showBalance ? formatCurrency(totalBalance) : 'Rp ••••••••'}
          </h3>
        </div>

        <div className="card">
          <div className="card-label">
            <TrendingUp size={16} color="var(--success)" /> Pemasukan
          </div>
          <h3 className="card-amount tabular-nums">{formatCurrency(income)}</h3>
        </div>

        <div className="card">
          <div className="card-label">
            <TrendingDown size={16} color="var(--danger)" /> Pengeluaran
          </div>
          <h3 className="card-amount tabular-nums">{formatCurrency(expense)}</h3>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Expense Breakdown */}
        <div>
          <div className="section-header">
            <h3 className="section-title">Top 3 Pengeluaran</h3>
          </div>
          <div className="card chart-container">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <Receipt size={32} className="empty-state-icon" />
                <p>Belum ada pengeluaran bulan ini.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="section-header">
            <h3 className="section-title">Transaksi Terakhir</h3>
            <Link to="/transactions" className="see-all-link">Lihat Semua</Link>
          </div>
          <div className="transaction-list">
            {transactions.slice(0, 5).map(tx => {
              const cat = categories.find(c => c.id === tx.categoryId);
              return (
                <div key={tx.id} className="transaction-item">
                  <div className="tx-left">
                    <div className="tx-icon">
                      {getIcon(cat?.icon || '')}
                    </div>
                    <div className="tx-details">
                      <p className="tx-title">{tx.notes || cat?.name}</p>
                      <p className="tx-date">{new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                  <div className={`tx-amount ${tx.type === 'In' ? 'in' : 'out'}`}>
                    {tx.type === 'In' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </div>
                </div>
              );
            })}
            
            {transactions.length === 0 && (
              <div className="empty-state">
                <Receipt size={32} className="empty-state-icon" />
                <p>Belum ada transaksi.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAB */}
      <Link to="/transactions" className="fab" aria-label="Tambah Transaksi">
        <Plus size={24} />
      </Link>
    </div>
  );
}
