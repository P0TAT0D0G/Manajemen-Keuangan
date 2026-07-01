import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Eye, EyeOff, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '../utils/format';
import { getIconComponent } from '../utils/icons';
import './Dashboard.css';

const COLORS = ['#114232', '#87A922', '#F7F6BB', '#e0e0e0'];

export default function Dashboard() {
  const { wallets, transactions, categories } = useData();
  const [showBalance, setShowBalance] = useState(true);

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  
  // Calculate this month's summary
  const currentMonth = new Date().getMonth();
  const thisMonthTxs = transactions.filter(t => new Date(t.date).getMonth() === currentMonth);
  
  const income = thisMonthTxs.filter(t => t.type === 'In').reduce((s, t) => s + t.amount, 0);
  const expense = thisMonthTxs.filter(t => t.type === 'Out').reduce((s, t) => s + t.amount, 0);

  // Calculate expenses by category for donut chart
  const expensesByCategory = thisMonthTxs
    .filter(t => t.type === 'Out')
    .reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const donutData = Object.entries(expensesByCategory)
    .map(([catId, amount]) => ({
      name: categories.find(c => c.id === catId)?.name || 'Unknown',
      value: amount
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4); // Top 4 expenses

  return (
    <div className="dashboard-container fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Beranda</h2>
          <p className="page-subtitle">Ringkasan keuangan Anda</p>
        </div>
      </div>

      <div className="balance-card">
        <div className="balance-header">
          <span className="balance-label">Total Saldo</span>
          <button className="icon-btn-light" onClick={() => setShowBalance(!showBalance)}>
            {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <div className="balance-amount tabular-nums">
          {showBalance ? formatCurrency(totalBalance) : 'Rp ••••••••'}
        </div>
        
        <div className="balance-stats">
          <div className="stat-item">
            <div className="stat-icon-wrapper in"><TrendingUp size={16} /></div>
            <div>
              <div className="stat-label">Pemasukan</div>
              <div className="stat-value tabular-nums">{showBalance ? formatCurrency(income) : '•••'}</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon-wrapper out"><TrendingDown size={16} /></div>
            <div>
              <div className="stat-label">Pengeluaran</div>
              <div className="stat-value tabular-nums">{showBalance ? formatCurrency(expense) : '•••'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3 className="section-title">Pengeluaran Bulan Ini</h3>
          {donutData.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-legend">
                {donutData.map((entry, index) => (
                  <div key={entry.name} className="legend-item">
                    <span className="legend-dot" style={{ background: COLORS[index % COLORS.length] }}></span>
                    <span className="legend-name">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-chart">Belum ada pengeluaran.</div>
          )}
        </div>

        <div className="dashboard-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="section-title">Transaksi Terakhir</h3>
          </div>
          <div className="recent-tx-list">
            {transactions.slice(0, 5).map(tx => {
              const cat = categories.find(c => c.id === tx.categoryId);
              const isTransfer = tx.type === 'Transfer';
              
              return (
                <div key={tx.id} className="recent-tx-item">
                  <div className="recent-tx-left">
                    <div className={`recent-tx-icon ${isTransfer ? 'transfer' : ''}`}>
                      {isTransfer ? <ArrowRightLeft size={18} /> : getIconComponent(cat?.icon || 'receipt', { size: 18 })}
                    </div>
                    <div>
                      <div className="recent-tx-name">{tx.notes || (isTransfer ? 'Transfer Uang' : cat?.name)}</div>
                      <div className="recent-tx-date">{new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                    </div>
                  </div>
                  <div className={`recent-tx-amount tabular-nums ${tx.type === 'In' ? 'in' : tx.type === 'Out' ? 'out' : 'neutral'}`}>
                    {tx.type === 'In' ? '+' : tx.type === 'Out' ? '-' : ''}{formatCurrency(tx.amount)}
                  </div>
                </div>
              );
            })}
            {transactions.length === 0 && (
              <div className="empty-chart" style={{ height: 'auto', padding: '24px 0' }}>Belum ada transaksi.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
