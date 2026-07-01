import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { TransactionType, Transaction } from '../types';
import { Plus, X, Pencil, Trash2, ArrowRightLeft } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { getIconComponent } from '../utils/icons';
import './Transactions.css';

export default function Transactions() {
  const { transactions, categories, wallets, addTransaction, updateTransaction, deleteTransaction } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [txType, setTxType] = useState<TransactionType>('Out');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [walletId, setWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const openModal = (tx?: Transaction) => {
    if (tx) {
      setEditingId(tx.id);
      setTxType(tx.type);
      setAmount(tx.amount.toString());
      setCategoryId(tx.categoryId || '');
      setWalletId(tx.walletId);
      setToWalletId(tx.toWalletId || '');
      setDate(new Date(tx.date).toISOString().split('T')[0]);
      setNotes(tx.notes);
    } else {
      setEditingId(null);
      setTxType('Out');
      setAmount('');
      setCategoryId('');
      setWalletId('');
      setToWalletId('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !walletId) return;
    if (txType !== 'Transfer' && !categoryId) return;
    if (txType === 'Transfer' && !toWalletId) return;
    if (txType === 'Transfer' && walletId === toWalletId) {
      alert("Dompet asal dan tujuan tidak boleh sama");
      return;
    }

    const txData: Omit<Transaction, 'id'> = {
      type: txType,
      amount: Number(amount),
      categoryId: txType === 'Transfer' ? 'transfer' : categoryId,
      walletId,
      toWalletId: txType === 'Transfer' ? toWalletId : undefined,
      date: new Date(date).toISOString(),
      notes
    };

    if (editingId) {
      updateTransaction(editingId, txData);
    } else {
      addTransaction(txData);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      deleteTransaction(id);
    }
  };

  return (
    <div className="transactions-container fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Mutasi</h2>
          <p className="page-subtitle">Daftar transaksi Anda</p>
        </div>
        <button className="primary-btn" onClick={() => openModal()}>
          <Plus size={20} /> Tambah
        </button>
      </div>

      <div className="transactions-list-full">
        {transactions.map(tx => {
          const cat = categories.find(c => c.id === tx.categoryId);
          const wallet = wallets.find(w => w.id === tx.walletId);
          const toWallet = wallets.find(w => w.id === tx.toWalletId);
          
          const isTransfer = tx.type === 'Transfer';

          return (
            <div key={tx.id} className="tx-card group">
              <div className="tx-card-content">
                <div className="tx-card-left">
                  <div className={`tx-card-icon ${isTransfer ? 'transfer' : ''}`}>
                    {isTransfer ? <ArrowRightLeft size={20} /> : getIconComponent(cat?.icon || 'receipt', { size: 20 })}
                  </div>
                  <div>
                    <h4 className="tx-card-title">
                      {tx.notes || (isTransfer ? 'Transfer Uang' : cat?.name)}
                    </h4>
                    <div className="tx-card-meta">
                      <span>{new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="dot-separator">•</span>
                      <span>
                        {isTransfer ? `${wallet?.name} → ${toWallet?.name}` : wallet?.name}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="tx-card-right">
                  <div className={`tx-card-amount ${tx.type === 'In' ? 'in' : tx.type === 'Out' ? 'out' : 'neutral'} tabular-nums`}>
                    {tx.type === 'In' ? '+' : tx.type === 'Out' ? '-' : ''}{formatCurrency(tx.amount)}
                  </div>
                  
                  {/* Actions (visible on hover) */}
                  <div className="tx-actions">
                    <button className="icon-btn edit-btn" onClick={() => openModal(tx)} aria-label="Edit">
                      <Pencil size={18} />
                    </button>
                    <button className="icon-btn delete-btn" onClick={() => handleDelete(tx.id)} aria-label="Hapus">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {transactions.length === 0 && (
          <div className="empty-state">
            {getIconComponent('receipt', { size: 48, className: 'empty-state-icon' })}
            <p>Belum ada transaksi yang dicatat.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content fade-in">
            <div className="modal-header">
              <h3>{editingId ? 'Edit Transaksi' : 'Tambah Transaksi'}</h3>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)} aria-label="Tutup">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="tx-form">
              <div className="form-group type-selector">
                {(['Out', 'In', 'Transfer'] as TransactionType[]).map(type => (
                  <button
                    key={type}
                    type="button"
                    className={`type-btn ${txType === type ? 'active' : ''}`}
                    onClick={() => setTxType(type)}
                  >
                    {type === 'Out' ? 'Pengeluaran' : type === 'In' ? 'Pemasukan' : 'Transfer'}
                  </button>
                ))}
              </div>

              <div className="form-group">
                <label htmlFor="amount">Nominal</label>
                <div className="amount-input-wrapper">
                  <span className="currency-symbol">Rp</span>
                  <input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    required
                    min="1"
                    className="amount-input tabular-nums"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="wallet">{txType === 'Transfer' ? 'Dari Dompet' : 'Dompet'}</label>
                  <select 
                    id="wallet" 
                    value={walletId} 
                    onChange={(e) => setWalletId(e.target.value)}
                    required
                  >
                    <option value="">Pilih Dompet</option>
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({formatCurrency(w.balance)})</option>
                    ))}
                  </select>
                </div>
                
                {txType === 'Transfer' ? (
                  <div className="form-group">
                    <label htmlFor="toWallet">Ke Dompet</label>
                    <select 
                      id="toWallet" 
                      value={toWalletId} 
                      onChange={(e) => setToWalletId(e.target.value)}
                      required
                    >
                      <option value="">Pilih Dompet Tujuan</option>
                      {wallets.filter(w => w.id !== walletId).map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="form-group">
                    <label htmlFor="category">Kategori</label>
                    <select 
                      id="category" 
                      value={categoryId} 
                      onChange={(e) => setCategoryId(e.target.value)}
                      required
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.filter(c => c.type === (txType === 'In' ? 'In' : 'Out') && !c.name.startsWith('Lain-lain')).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                      {/* Show Lain-lain at the bottom */}
                      {categories.filter(c => c.type === (txType === 'In' ? 'In' : 'Out') && c.name.startsWith('Lain-lain')).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Tanggal</label>
                  <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Catatan (Opsional)</label>
                <input
                  id="notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={txType === 'Transfer' ? 'Contoh: Pindah dana' : 'Contoh: Makan siang'}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="primary-btn">
                  {editingId ? 'Simpan Perubahan' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
