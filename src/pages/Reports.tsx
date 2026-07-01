import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import type { ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { Download, Filter, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { isInDateRange, getMonthStart, getToday } from '../utils/date';
import { getIconComponent } from '../utils/icons';
import './Reports.css';

export default function Reports() {
  const { transactions, categories, wallets } = useData();

  // Filter state
  const [startDate, setStartDate] = useState(getMonthStart());
  const [endDate, setEndDate] = useState(getToday());
  const [filterWalletId, setFilterWalletId] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const activeWallets = wallets.filter(w => !w.isArchived);

  // Filtered transactions
  const filteredTx = useMemo(() => {
    return transactions.filter(t => {
      if (!isInDateRange(t.date, startDate, endDate)) return false;
      if (filterWalletId && t.walletId !== filterWalletId) return false;
      if (filterCategoryId && t.categoryId !== filterCategoryId) return false;
      if (filterType && t.type !== filterType) return false;
      return true;
    });
  }, [transactions, startDate, endDate, filterWalletId, filterCategoryId, filterType]);

  // Summary
  const totalIncome = filteredTx.filter(t => t.type === 'In').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filteredTx.filter(t => t.type === 'Out').reduce((s, t) => s + t.amount, 0);
  const netCashFlow = totalIncome - totalExpense;

  // Chart data: group by month within date range
  const chartData = useMemo(() => {
    const months = new Map<string, { Pemasukan: number; Pengeluaran: number }>();
    
    for (const tx of filteredTx) {
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      
      if (!months.has(key)) {
        months.set(key, { Pemasukan: 0, Pengeluaran: 0 });
      }
      const m = months.get(key)!;
      if (tx.type === 'In') m.Pemasukan += tx.amount;
      if (tx.type === 'Out') m.Pengeluaran += tx.amount;
    }

    return Array.from(months.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, vals]) => {
        const [y, m] = key.split('-');
        const d = new Date(Number(y), Number(m) - 1);
        return {
          name: d.toLocaleString('id-ID', { month: 'short', year: '2-digit' }),
          ...vals
        };
      });
  }, [filteredTx]);

  const tooltipFormatter = (value: ValueType | undefined) => {
    return formatCurrency(Number(value || 0));
  };

  const handleExport = () => {
    if (filteredTx.length === 0) return;

    const headers = ['Tanggal', 'Jenis', 'Nominal', 'Dompet', 'Ke Dompet', 'Kategori', 'Catatan'];
    
    const rows = filteredTx.map(tx => {
      const cat = categories.find(c => c.id === tx.categoryId);
      const wallet = wallets.find(w => w.id === tx.walletId);
      const toWallet = wallets.find(w => w.id === tx.toWalletId);
      
      return [
        new Date(tx.date).toLocaleDateString('id-ID'),
        tx.type,
        tx.amount,
        `"${wallet?.name || ''}"`,
        `"${toWallet?.name || ''}"`,
        `"${cat?.name || ''}"`,
        `"${(tx.notes || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `laporan_${startDate}_${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setStartDate(getMonthStart());
    setEndDate(getToday());
    setFilterWalletId('');
    setFilterCategoryId('');
    setFilterType('');
  };

  return (
    <div className="reports-container fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Laporan</h2>
          <p className="page-subtitle">Analisis keuangan Anda</p>
        </div>
        <div className="page-header-actions">
          <button
            className="secondary-btn"
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Toggle filter"
          >
            <Filter size={18} /> Filter
          </button>
          <button
            className="secondary-btn"
            onClick={handleExport}
            disabled={filteredTx.length === 0}
            aria-label="Export CSV"
          >
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="filter-bar fade-in">
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="startDate">Dari</label>
              <input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="filter-group">
              <label htmlFor="endDate">Sampai</label>
              <input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <div className="filter-group">
              <label htmlFor="filterWallet">Dompet</label>
              <select id="filterWallet" value={filterWalletId} onChange={e => setFilterWalletId(e.target.value)}>
                <option value="">Semua Dompet</option>
                {activeWallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="filterCategory">Kategori</label>
              <select id="filterCategory" value={filterCategoryId} onChange={e => setFilterCategoryId(e.target.value)}>
                <option value="">Semua Kategori</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="filterType">Jenis</label>
              <select id="filterType" value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="">Semua</option>
                <option value="In">Pemasukan</option>
                <option value="Out">Pengeluaran</option>
                <option value="Transfer">Transfer</option>
              </select>
            </div>
          </div>
          <button className="reset-btn" onClick={resetFilters}>Reset Filter</button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card income">
          <div className="summary-card-icon"><TrendingUp size={20} /></div>
          <div>
            <div className="summary-card-label">Total Pemasukan</div>
            <div className="summary-card-value tabular-nums">{formatCurrency(totalIncome)}</div>
          </div>
        </div>
        <div className="summary-card expense">
          <div className="summary-card-icon"><TrendingDown size={20} /></div>
          <div>
            <div className="summary-card-label">Total Pengeluaran</div>
            <div className="summary-card-value tabular-nums">{formatCurrency(totalExpense)}</div>
          </div>
        </div>
        <div className="summary-card net">
          <div className="summary-card-icon"><Activity size={20} /></div>
          <div>
            <div className="summary-card-label">Arus Kas Bersih</div>
            <div className={`summary-card-value tabular-nums ${netCashFlow >= 0 ? 'positive' : 'negative'}`}>
              {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow)}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="report-card" aria-label="Grafik arus kas">
          <h3 className="section-title" style={{ marginBottom: '24px' }}>Grafik Arus Kas</h3>
          <div className="chart-container-large">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(value) => value >= 1000000 ? `${value / 1000000}M` : value >= 1000 ? `${value / 1000}k` : `${value}`}
                />
                <Tooltip 
                  formatter={tooltipFormatter}
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="Pemasukan" fill="var(--success)" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="Pengeluaran" fill="var(--danger)" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* SR summary */}
          <div className="sr-only">
            Ringkasan: Pemasukan {formatCurrency(totalIncome)}, Pengeluaran {formatCurrency(totalExpense)}, Arus kas bersih {formatCurrency(netCashFlow)}
          </div>
        </div>
      )}

      {/* Transaction List */}
      <div className="report-card">
        <h3 className="section-title" style={{ marginBottom: '16px' }}>
          Daftar Transaksi ({filteredTx.length})
        </h3>
        {filteredTx.length > 0 ? (
          <div className="report-tx-list">
            {filteredTx.map(tx => {
              const cat = categories.find(c => c.id === tx.categoryId);
              const wallet = wallets.find(w => w.id === tx.walletId);
              const isTransfer = tx.type === 'Transfer';

              return (
                <div key={tx.id} className="report-tx-item">
                  <div className="report-tx-left">
                    <div className={`report-tx-icon ${isTransfer ? 'transfer' : ''}`}>
                      {getIconComponent(cat?.icon || 'receipt', { size: 18 })}
                    </div>
                    <div className="report-tx-info">
                      <div className="report-tx-name">{tx.notes || cat?.name || 'Transfer'}</div>
                      <div className="report-tx-meta">
                        {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {wallet && ` · ${wallet.name}`}
                      </div>
                    </div>
                  </div>
                  <div className={`report-tx-amount tabular-nums ${tx.type === 'In' ? 'in' : tx.type === 'Out' ? 'out' : 'neutral'}`}>
                    {tx.type === 'In' ? '+' : tx.type === 'Out' ? '-' : ''}{formatCurrency(tx.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-chart">
            Tidak ada transaksi yang cocok dengan filter.
          </div>
        )}
      </div>
    </div>
  );
}
