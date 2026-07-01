import { useState } from 'react';
import { useData } from '../context/DataContext';
import { Eye, EyeOff, TrendingUp, TrendingDown, ArrowRightLeft, Plus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { formatCurrency, getWalletLabel } from '../utils/format';
import { getIconComponent } from '../utils/icons';
import { isSameMonth } from '../utils/date';
import Modal from '../components/ui/Modal';
import TransactionForm from '../components/forms/TransactionForm';
import { useToast } from '../components/ui/ToastContext';
import './Dashboard.css';

const COLORS = ['#114232', '#87A922', '#F7F6BB', '#e0e0e0'];

export default function Dashboard() {
  const { wallets, transactions, categories, getWalletBalance } = useData();
  const toast = useToast();
  const [showBalance, setShowBalance] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeWallets = wallets.filter(w => !w.isArchived);
  const totalBalance = activeWallets.reduce((sum, w) => sum + getWalletBalance(w.id), 0);
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const thisMonthTxs = transactions.filter(t => isSameMonth(t.date, currentMonth, currentYear));
  
  const income = thisMonthTxs.filter(t => t.type === 'In').reduce((s, t) => s + t.amount, 0);
  const expense = thisMonthTxs.filter(t => t.type === 'Out').reduce((s, t) => s + t.amount, 0);

  const expensesByCategory = thisMonthTxs
    .filter(t => t.type === 'Out')
    .reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const donutData = Object.entries(expensesByCategory)
    .map(([catId, amount]) => ({
      name: categories.find(c => c.id === catId)?.name || 'Lainnya',
      value: amount
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);

  const tooltipFormatter = (value: ValueType | undefined) => {
    return formatCurrency(Number(value || 0));
  };

  const handleFormSubmit = () => {
    toast.success('Transaksi berhasil ditambahkan');
    setIsModalOpen(false);
  };

  return (
    <div className="dashboard-container fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Beranda</h2>
          <p className="page-subtitle">Ringkasan keuangan Anda</p>
        </div>
        <button className="primary-btn dashboard-add-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Tambah Transaksi
        </button>
      </div>

      <div className="balance-card">
        <div className="balance-header">
          <span className="balance-label">Total Saldo</span>
          <button
            className="icon-btn-light"
            onClick={() => setShowBalance(!showBalance)}
            aria-label={showBalance ? 'Sembunyikan saldo' : 'Tampilkan saldo'}
          >
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
            <div className="chart-wrapper" aria-label="Grafik donat pengeluaran bulan ini">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={220}>
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
                      {donutData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={tooltipFormatter}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-legend">
                {donutData.map((entry, index) => (
                  <div key={entry.name} className="legend-item">
                    <span className="legend-dot" style={{ background: COLORS[index % COLORS.length] }}></span>
                    <span className="legend-name">{entry.name}</span>
                    <span className="legend-value tabular-nums">{formatCurrency(entry.value)}</span>
                  </div>
                ))}
              </div>
              {/* Screen reader summary */}
              <div className="sr-only">
                Pengeluaran bulan ini: {donutData.map(d => `${d.name} ${formatCurrency(d.value)}`).join(', ')}
              </div>
            </div>
          ) : (
            <div className="empty-chart">Belum ada pengeluaran bulan ini.</div>
          )}
        </div>

        <div className="dashboard-card">
          <h3 className="section-title" style={{ marginBottom: '16px' }}>Transaksi Terakhir</h3>
          <div className="recent-tx-list">
            {transactions.slice(0, 5).map(tx => {
              const cat = categories.find(c => c.id === tx.categoryId);
              const isTransfer = tx.type === 'Transfer';
              const isAdjustment = tx.type === 'Adjustment';
              const wallet = wallets.find(w => w.id === tx.walletId);
              const toWallet = wallets.find(w => w.id === tx.toWalletId);
              
              let label = tx.notes || cat?.name || '';
              if (isTransfer) label = tx.notes || 'Transfer Uang';
              if (isAdjustment) label = tx.notes || 'Penyesuaian Saldo';
              
              return (
                <div key={tx.id} className="recent-tx-item">
                  <div className="recent-tx-left">
                    <div className={`recent-tx-icon ${isTransfer || isAdjustment ? 'transfer' : ''}`}>
                      {isTransfer ? <ArrowRightLeft size={18} /> : getIconComponent(cat?.icon || 'receipt', { size: 18 })}
                    </div>
                    <div>
                      <div className="recent-tx-name">{label}</div>
                      <div className="recent-tx-date">
                        {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        {isTransfer && wallet && toWallet && ` · ${getWalletLabel(wallet)} → ${getWalletLabel(toWallet)}`}
                      </div>
                    </div>
                  </div>
                  <div className={`recent-tx-amount tabular-nums ${tx.type === 'In' ? 'in' : tx.type === 'Out' ? 'out' : 'neutral'}`}>
                    {tx.type === 'In' ? '+' : tx.type === 'Out' ? '-' : ''}{formatCurrency(Math.abs(tx.amount))}
                  </div>
                </div>
              );
            })}
            {transactions.length === 0 && (
              <div className="empty-chart" style={{ height: 'auto', padding: '24px 0' }}>
                Belum ada transaksi. Catat transaksi pertama Anda!
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Transaksi">
        <TransactionForm onSubmitSuccess={handleFormSubmit} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
