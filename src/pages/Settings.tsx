import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Settings as SettingsIcon, Plus, Pencil, Trash2, X, Wallet, Tag } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { getIconComponent, availableIcons } from '../utils/icons';
import type { CategoryType } from '../types';
import './Settings.css';

export default function Settings() {
  const { 
    wallets, categories, 
    addWallet, updateWallet, deleteWallet,
    addCategory, updateCategory, deleteCategory
  } = useData();

  const [activeTab, setActiveTab] = useState<'wallets' | 'categories'>('wallets');
  
  // Wallet Modal State
  const [isWalletModalOpen, setWalletModalOpen] = useState(false);
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
  const [walletName, setWalletName] = useState('');
  const [walletType, setWalletType] = useState<'Cash' | 'Bank' | 'E-Wallet'>('Cash');
  const [walletBalance, setWalletBalance] = useState('');

  // Category Modal State
  const [isCatModalOpen, setCatModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<CategoryType>('Out');
  const [catIcon, setCatIcon] = useState('receipt');

  // --- Wallet Handlers ---
  const openWalletModal = (w?: any) => {
    if (w) {
      setEditingWalletId(w.id);
      setWalletName(w.name);
      setWalletType(w.type);
      setWalletBalance(w.balance.toString());
    } else {
      setEditingWalletId(null);
      setWalletName('');
      setWalletType('Cash');
      setWalletBalance('');
    }
    setWalletModalOpen(true);
  };

  const handleWalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletName || !walletBalance) return;
    const data = { name: walletName, type: walletType, balance: Number(walletBalance) };
    if (editingWalletId) updateWallet(editingWalletId, data);
    else addWallet(data);
    setWalletModalOpen(false);
  };

  const handleWalletDelete = (id: string) => {
    if (wallets.length === 1) {
      alert("Anda harus memiliki setidaknya satu dompet.");
      return;
    }
    if (confirm("Hapus dompet ini? Transaksi terkait mungkin akan terpengaruh.")) {
      deleteWallet(id);
    }
  };

  // --- Category Handlers ---
  const openCatModal = (c?: any) => {
    if (c) {
      setEditingCatId(c.id);
      setCatName(c.name);
      setCatType(c.type);
      setCatIcon(c.icon);
    } else {
      setEditingCatId(null);
      setCatName('');
      setCatType('Out');
      setCatIcon('receipt');
    }
    setCatModalOpen(true);
  };

  const handleCatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;
    const data = { name: catName, type: catType, icon: catIcon };
    if (editingCatId) updateCategory(editingCatId, data);
    else addCategory(data);
    setCatModalOpen(false);
  };

  const handleCatDelete = (id: string) => {
    if (confirm("Hapus kategori ini? Transaksi terkait akan dipindahkan ke kategori 'Lain-lain'.")) {
      deleteCategory(id);
    }
  };

  return (
    <div className="settings-container fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Pengaturan</h2>
          <p className="page-subtitle">Kelola Dompet & Kategori</p>
        </div>
        <SettingsIcon className="page-header-icon" size={32} />
      </div>

      <div className="settings-tabs">
        <button 
          className={`tab-btn ${activeTab === 'wallets' ? 'active' : ''}`}
          onClick={() => setActiveTab('wallets')}
        >
          <Wallet size={18} /> Dompet
        </button>
        <button 
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <Tag size={18} /> Kategori
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'wallets' && (
          <div className="fade-in">
            <div className="section-header">
              <h3 className="section-title">Daftar Dompet</h3>
              <button className="primary-btn" onClick={() => openWalletModal()}>
                <Plus size={18} /> Tambah Dompet
              </button>
            </div>
            
            <div className="list-grid">
              {wallets.map(w => (
                <div key={w.id} className="list-card group">
                  <div className="list-card-info">
                    <div className="list-card-title">{w.name}</div>
                    <div className="list-card-subtitle">{w.type} • {formatCurrency(w.balance)}</div>
                  </div>
                  <div className="list-actions">
                    <button className="icon-btn edit-btn" onClick={() => openWalletModal(w)}><Pencil size={18}/></button>
                    <button className="icon-btn delete-btn" onClick={() => handleWalletDelete(w.id)}><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="fade-in">
            <div className="section-header">
              <h3 className="section-title">Daftar Kategori</h3>
              <button className="primary-btn" onClick={() => openCatModal()}>
                <Plus size={18} /> Tambah Kategori
              </button>
            </div>
            
            <div className="list-grid">
              {categories.map(c => {
                const isSystem = c.name.startsWith('Lain-lain');
                return (
                  <div key={c.id} className="list-card group">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="cat-icon-preview">
                        {getIconComponent(c.icon, { size: 20 })}
                      </div>
                      <div className="list-card-info">
                        <div className="list-card-title">{c.name} {isSystem && <span className="badge">Sistem</span>}</div>
                        <div className="list-card-subtitle">{c.type === 'In' ? 'Pemasukan' : 'Pengeluaran'}</div>
                      </div>
                    </div>
                    {!isSystem && (
                      <div className="list-actions">
                        <button className="icon-btn edit-btn" onClick={() => openCatModal(c)}><Pencil size={18}/></button>
                        <button className="icon-btn delete-btn" onClick={() => handleCatDelete(c.id)}><Trash2 size={18}/></button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Wallet Modal */}
      {isWalletModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content fade-in">
            <div className="modal-header">
              <h3>{editingWalletId ? 'Edit Dompet' : 'Tambah Dompet'}</h3>
              <button className="icon-btn" onClick={() => setWalletModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleWalletSubmit} className="tx-form">
              <div className="form-group">
                <label>Nama Dompet</label>
                <input type="text" required value={walletName} onChange={e => setWalletName(e.target.value)} placeholder="Misal: Dompet Utama" />
              </div>
              <div className="form-group">
                <label>Tipe</label>
                <select value={walletType} onChange={e => setWalletType(e.target.value as any)}>
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank</option>
                  <option value="E-Wallet">E-Wallet</option>
                </select>
              </div>
              <div className="form-group">
                <label>Saldo {editingWalletId ? 'Saat Ini' : 'Awal'}</label>
                <div className="amount-input-wrapper">
                  <span className="currency-symbol">Rp</span>
                  <input type="number" required value={walletBalance} onChange={e => setWalletBalance(e.target.value)} className="amount-input tabular-nums" />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setWalletModalOpen(false)}>Batal</button>
                <button type="submit" className="primary-btn">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content fade-in">
            <div className="modal-header">
              <h3>{editingCatId ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
              <button className="icon-btn" onClick={() => setCatModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleCatSubmit} className="tx-form">
              <div className="form-group">
                <label>Nama Kategori</label>
                <input type="text" required value={catName} onChange={e => setCatName(e.target.value)} placeholder="Misal: Bensin" />
              </div>
              <div className="form-group">
                <label>Jenis</label>
                <select value={catType} onChange={e => setCatType(e.target.value as any)}>
                  <option value="Out">Pengeluaran</option>
                  <option value="In">Pemasukan</option>
                </select>
              </div>
              <div className="form-group">
                <label>Ikon</label>
                <div className="icon-selector">
                  {availableIcons.map(icon => (
                    <div 
                      key={icon} 
                      className={`icon-option ${catIcon === icon ? 'selected' : ''}`}
                      onClick={() => setCatIcon(icon)}
                    >
                      {getIconComponent(icon, { size: 24 })}
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setCatModalOpen(false)}>Batal</button>
                <button type="submit" className="primary-btn">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
