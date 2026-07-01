import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { TransactionType } from '../types';
import { Plus, X, Receipt } from 'lucide-react';
import './Transactions.css';

export default function Transactions() {
  const { transactions, categories, wallets, addTransaction } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [txType, setTxType] = useState<TransactionType>('Out');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [walletId, setWalletId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId || !walletId) return;

    addTransaction({
      type: txType,
      amount: Number(amount),
      categoryId,
      walletId,
      date: new Date(date).toISOString(),
      notes
    });

    setIsModalOpen(false);
    setAmount('');
    setNotes('');
  };

  const getIcon = (iconName: string) => <Receipt size={20} />;

  return (
    <div className="transactions-container fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Mutasi</h2>
          <p className="page-subtitle">Daftar transaksi Anda</p>
        </div>
        <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Tambah
        </button>
      </div>

      <div className="transactions-list-full">
        {transactions.map(tx => {
          const cat = categories.find(c => c.id === tx.categoryId);
          const wallet = wallets.find(w => w.id === tx.walletId);
          return (
            <div key={tx.id} className="tx-card">
              <div className="tx-card-left">
                <div className="tx-card-icon">
                  {getIcon(cat?.icon || '')}
                </div>
                <div>
                  <h4 className="tx-card-title">{tx.notes || cat?.name}</h4>
                  <div className="tx-card-meta">
                    <span>{new Date(tx.date).toLocaleDateString('id-ID')}</span>
                    <span className="dot-separator">•</span>
                    <span>{wallet?.name}</span>
                  </div>
                </div>
              </div>
              <div className={`tx-card-amount ${tx.type === 'In' ? 'in' : 'out'} tabular-nums`}>
                {tx.type === 'In' ? '+' : '-'}{formatCurrency(tx.amount)}
              </div>
            </div>
          );
        })}

        {transactions.length === 0 && (
          <div className="empty-state">
            <Receipt size={48} className="empty-state-icon" />
            <p>Belum ada transaksi yang dicatat.</p>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content fade-in">
            <div className="modal-header">
              <h3>Tambah Transaksi</h3>
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
                  <label htmlFor="category">Kategori</label>
                  <select 
                    id="category" 
                    value={categoryId} 
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.filter(c => c.type === (txType === 'In' ? 'In' : 'Out')).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="wallet">Dompet</label>
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
                <label htmlFor="notes">Catatan</label>
                <input
                  id="notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Makan siang bareng klien"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="primary-btn">
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
