import React from 'react';
import { useData } from '../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Download } from 'lucide-react';
import './Reports.css';

export default function Reports() {
  const { transactions } = useData();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  // Generate last 6 months data
  const data = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    
    const monthTx = transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate.getMonth() === d.getMonth() && txDate.getFullYear() === d.getFullYear();
    });

    const income = monthTx.filter(t => t.type === 'In').reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter(t => t.type === 'Out').reduce((s, t) => s + t.amount, 0);

    data.push({
      name: d.toLocaleString('id-ID', { month: 'short' }),
      Pemasukan: income,
      Pengeluaran: expense
    });
  }

  const handleExport = () => {
    alert("Exporting CSV... (Mock)");
  };

  return (
    <div className="reports-container fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Laporan</h2>
          <p className="page-subtitle">Arus kas 6 bulan terakhir</p>
        </div>
        <button className="secondary-btn" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download size={18} /> Export
        </button>
      </div>

      <div className="report-card">
        <h3 className="section-title" style={{ marginBottom: '24px' }}>Grafik Arus Kas</h3>
        <div className="chart-container-large">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tickFormatter={(value) => value >= 1000000 ? `${value / 1000000}M` : `${value / 1000}k`}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
              />
              <Legend iconType="circle" />
              <Bar dataKey="Pemasukan" fill="var(--success)" radius={[4, 4, 0, 0]} barSize={24} />
              <Bar dataKey="Pengeluaran" fill="var(--danger)" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
