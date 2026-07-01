import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../components/ui/ToastContext';
import { Plus, Pencil, Trash2, ArrowRightLeft, FileText } from 'lucide-react';
import { formatCurrency, getWalletLabel } from '../utils/format';
import { getIconComponent } from '../utils/icons';
import { isSameMonth } from '../utils/date';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import TransactionForm from '../components/forms/TransactionForm';
import type { Transaction } from '../types';
import './Transactions.css';

export default function Transactions() {
  const { transactions, categories, wallets, deleteTransaction } = useData();
  const toast = useToast();
  
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Modal and Dialog state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | undefined>();
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  // Filter transactions
  const filteredTxs = transactions
    .filter(t => isSameMonth(t.date, currentMonth, currentYear))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const openForm = (tx?: Transaction) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  const closeForm = () => {
    setEditingTx(undefined);
    setIsModalOpen(false);
  };

  const onFormSubmit = () => {
    toast.success(editingTx ? 'Transaksi berhasil diperbarui' : 'Transaksi berhasil ditambahkan');
    closeForm();
  };

  const confirmDelete = () => {
    if (txToDelete) {
      deleteTransaction(txToDelete.id);
      toast.success('Transaksi berhasil dihapus');
      setTxToDelete(null);
    }
  };

  const renderTransactionItem = (tx: Transaction) => {
    const isTransfer = tx.type === 'Transfer';
    const isAdjustment = tx.type === 'Adjustment';
    const cat = categories.find(c => c.id === tx.categoryId);
    const wallet = wallets.find(w => w.id === tx.walletId);
    const toWallet = wallets.find(w => w.id === tx.toWalletId);

    let title = tx.notes || cat?.name || '';
    if (isTransfer) title = tx.notes || 'Transfer Uang';
    if (isAdjustment) title = tx.notes || 'Penyesuaian Saldo';

    let meta = `${new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`;
    if (isTransfer && wallet && toWallet) {
      meta += ` · ${getWalletLabel(wallet)} → ${getWalletLabel(toWallet)}`;
    } else if (wallet) {
      meta += ` · ${getWalletLabel(wallet)}`;
    }

    return (
      <div key={tx.id} className="tx-list-item group">
        <div className="tx-left">
          <div className={`tx-icon ${isTransfer || isAdjustment ? 'transfer' : ''}`}>
            {isTransfer || isAdjustment 
              ? <ArrowRightLeft size={20} /> 
              : getIconComponent(cat?.icon || 'receipt', { size: 20 })}
          </div>
          <div className="tx-details">
            <div className="tx-title">{title}</div>
            <div className="tx-meta">{meta}</div>
          </div>
        </div>
        <div className="tx-right">
          <div className={`tx-amount tabular-nums ${tx.type === 'In' ? 'in' : tx.type === 'Out' ? 'out' : 'neutral'}`}>
            {tx.type === 'In' ? '+' : tx.type === 'Out' ? '-' : ''}{formatCurrency(Math.abs(tx.amount))}
          </div>
          <div className="tx-actions">
            {!isAdjustment && (
              <button className="icon-btn" onClick={() => openForm(tx)} aria-label="Edit transaksi">
                <Pencil size={18} />
              </button>
            )}
            <button className="icon-btn text-danger" onClick={() => setTxToDelete(tx)} aria-label="Hapus transaksi">
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Group transactions by date
  const groupedTxs = filteredTxs.reduce((groups, tx) => {
    const dateStr = new Date(tx.date).toLocaleDateString('id-ID', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    if (!groups[dateStr]) groups[dateStr] = [];
    groups[dateStr].push(tx);
    return groups;
  }, {} as Record<string, Transaction[]>);

  const monthName = new Date(currentYear, currentMonth - 1).toLocaleString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <div className="transactions-container fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Transaksi</h2>
          <p className="page-subtitle">Riwayat transaksi Anda</p>
        </div>
        <button className="primary-btn" onClick={() => openForm()}>
          <Plus size={18} /> Tambah Transaksi
        </button>
      </div>

      <div className="tx-controls">
        <div className="month-selector">
          <button className="secondary-btn icon-only" onClick={handlePrevMonth}>&lt;</button>
          <span className="current-month">{monthName}</span>
          <button className="secondary-btn icon-only" onClick={handleNextMonth}>&gt;</button>
        </div>
      </div>

      <div className="tx-list">
        {Object.keys(groupedTxs).length > 0 ? (
          Object.entries(groupedTxs).map(([date, txs]) => (
            <div key={date} className="tx-group">
              <div className="tx-group-header">{date}</div>
              <div className="tx-group-items">
                {txs.map(renderTransactionItem)}
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon={<FileText />}
            title="Tidak ada transaksi"
            description={`Belum ada transaksi yang tercatat pada bulan ${monthName}.`}
            actionLabel="Tambah Transaksi"
            onAction={() => openForm()}
          />
        )}
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeForm}
        title={editingTx ? 'Edit Transaksi' : 'Tambah Transaksi'}
      >
        <TransactionForm
          initialData={editingTx}
          onSubmitSuccess={onFormSubmit}
          onCancel={closeForm}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={txToDelete !== null}
        onClose={() => setTxToDelete(null)}
        onConfirm={confirmDelete}
        title="Hapus Transaksi?"
        message="Transaksi yang dihapus tidak dapat dikembalikan. Saldo dompet akan disesuaikan secara otomatis."
        variant="danger"
        confirmLabel="Hapus"
      />
    </div>
  );
}
