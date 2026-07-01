import { useState } from 'react';
import { useData } from '../context/DataContext';
import { Settings as SettingsIcon, Plus, Pencil, Archive, ArchiveRestore, Wallet, Tag } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { getIconComponent, availableIcons } from '../utils/icons';
import type { CategoryType } from '../types';
import { validateWallet, validateCategory } from '../schemas/validation';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import CurrencyInput from '../components/ui/CurrencyInput';
import { useToast } from '../components/ui/ToastContext';
import './Settings.css';

export default function Settings() {
  const { 
    wallets, categories,
    addWallet, updateWallet, archiveWallet, restoreWallet, adjustWalletBalance,
    addCategory, updateCategory, deleteCategory,
    getWalletBalance
  } = useData();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'wallets' | 'categories'>('wallets');
  
  // Wallet Modal State
  const [isWalletModalOpen, setWalletModalOpen] = useState(false);
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
  const [walletName, setWalletName] = useState('');
  const [walletType, setWalletType] = useState<'Cash' | 'Bank' | 'E-Wallet'>('Cash');
  const [walletBalance, setWalletBalance] = useState('');
  const [walletErrors, setWalletErrors] = useState<Record<string, string>>({});

  // Category Modal State
  const [isCatModalOpen, setCatModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<CategoryType>('Out');
  const [catIcon, setCatIcon] = useState('receipt');
  const [catErrors, setCatErrors] = useState<Record<string, string>>({});

  // Confirm dialog state
  const [confirmAction, setConfirmAction] = useState<{ type: 'archive' | 'deleteCat'; id: string; name: string } | null>(null);

  const activeWallets = wallets.filter(w => !w.isArchived);
  const archivedWallets = wallets.filter(w => w.isArchived);

  // --- Wallet Handlers ---
  const openWalletModal = (w?: typeof wallets[0]) => {
    if (w) {
      setEditingWalletId(w.id);
      setWalletName(w.name);
      setWalletType(w.type as 'Cash' | 'Bank' | 'E-Wallet');
      setWalletBalance(getWalletBalance(w.id).toString());
    } else {
      setEditingWalletId(null);
      setWalletName('');
      setWalletType('Cash');
      setWalletBalance('');
    }
    setWalletErrors({});
    setWalletModalOpen(true);
  };

  const handleWalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = validateWallet({
      name: walletName,
      openingBalance: Number(walletBalance)
    });
    if (!result.valid) {
      setWalletErrors(result.errors);
      return;
    }

    if (editingWalletId) {
      const wallet = wallets.find(w => w.id === editingWalletId);
      if (!wallet) return;
      
      updateWallet(editingWalletId, {
        name: walletName,
        type: walletType,
        openingBalance: wallet.openingBalance
      });
      
      const currentBalance = getWalletBalance(editingWalletId);
      const desiredBalance = Number(walletBalance);
      if (desiredBalance !== currentBalance) {
        adjustWalletBalance(editingWalletId, desiredBalance);
      }
      toast.success('Dompet berhasil diperbarui');
    } else {
      addWallet({
        name: walletName,
        type: walletType,
        openingBalance: Number(walletBalance)
      });
      toast.success('Dompet berhasil ditambahkan');
    }
    setWalletModalOpen(false);
  };

  const handleArchiveWallet = (id: string, name: string) => {
    setConfirmAction({ type: 'archive', id, name });
  };

  const handleRestoreWallet = (id: string) => {
    restoreWallet(id);
    toast.success('Dompet berhasil dipulihkan');
  };

  // --- Category Handlers ---
  const openCatModal = (c?: typeof categories[0]) => {
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
    setCatErrors({});
    setCatModalOpen(true);
  };

  const handleCatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateCategory({ name: catName, type: catType });
    if (!result.valid) {
      setCatErrors(result.errors);
      return;
    }
    
    const data = { name: catName, type: catType, icon: catIcon };
    if (editingCatId) {
      updateCategory(editingCatId, data);
      toast.success('Kategori berhasil diperbarui');
    } else {
      addCategory(data);
      toast.success('Kategori berhasil ditambahkan');
    }
    setCatModalOpen(false);
  };

  const handleCatDelete = (id: string, name: string) => {
    setConfirmAction({ type: 'deleteCat', id, name });
  };

  const executeConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'archive') {
      archiveWallet(confirmAction.id);
      toast.success('Dompet diarsipkan');
    } else if (confirmAction.type === 'deleteCat') {
      deleteCategory(confirmAction.id);
      toast.success('Kategori dihapus');
    }
    setConfirmAction(null);
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

      <div className="settings-tabs" role="tablist">
        <button 
          role="tab"
          aria-selected={activeTab === 'wallets'}
          className={`tab-btn ${activeTab === 'wallets' ? 'active' : ''}`}
          onClick={() => setActiveTab('wallets')}
        >
          <Wallet size={18} /> Dompet
        </button>
        <button 
          role="tab"
          aria-selected={activeTab === 'categories'}
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <Tag size={18} /> Kategori
        </button>
      </div>

      <div className="settings-content" role="tabpanel">
        {activeTab === 'wallets' && (
          <div className="fade-in">
            <div className="section-header">
              <h3 className="section-title">Dompet Aktif</h3>
              <button className="primary-btn" onClick={() => openWalletModal()}>
                <Plus size={18} /> Tambah Dompet
              </button>
            </div>
            
            <div className="list-grid">
              {activeWallets.map(w => (
                <div key={w.id} className="list-card group">
                  <div className="list-card-info">
                    <div className="list-card-title">{w.name}</div>
                    <div className="list-card-subtitle">{w.type} • {formatCurrency(getWalletBalance(w.id))}</div>
                  </div>
                  <div className="list-actions">
                    <button className="icon-btn edit-btn" onClick={() => openWalletModal(w)} aria-label={`Edit ${w.name}`}>
                      <Pencil size={18}/>
                    </button>
                    <button className="icon-btn archive-btn" onClick={() => handleArchiveWallet(w.id, w.name)} aria-label={`Arsipkan ${w.name}`}>
                      <Archive size={18}/>
                    </button>
                  </div>
                </div>
              ))}
              {activeWallets.length === 0 && (
                <div className="empty-inline">Belum ada dompet aktif.</div>
              )}
            </div>

            {archivedWallets.length > 0 && (
              <>
                <h3 className="section-title" style={{ marginTop: '32px', color: 'var(--text-secondary)' }}>
                  Diarsipkan ({archivedWallets.length})
                </h3>
                <div className="list-grid">
                  {archivedWallets.map(w => (
                    <div key={w.id} className="list-card archived group">
                      <div className="list-card-info">
                        <div className="list-card-title">{w.name} <span className="badge">Diarsipkan</span></div>
                        <div className="list-card-subtitle">{w.type} • {formatCurrency(getWalletBalance(w.id))}</div>
                      </div>
                      <div className="list-actions">
                        <button className="icon-btn restore-btn" onClick={() => handleRestoreWallet(w.id)} aria-label={`Pulihkan ${w.name}`}>
                          <ArchiveRestore size={18}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
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
                        <button className="icon-btn edit-btn" onClick={() => openCatModal(c)} aria-label={`Edit ${c.name}`}>
                          <Pencil size={18}/>
                        </button>
                        <button className="icon-btn delete-btn" onClick={() => handleCatDelete(c.id, c.name)} aria-label={`Hapus ${c.name}`}>
                          <Archive size={18}/>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        onConfirm={executeConfirm}
        title={confirmAction?.type === 'archive' ? 'Arsipkan Dompet?' : 'Hapus Kategori?'}
        message={confirmAction?.type === 'archive' 
          ? `Dompet "${confirmAction?.name}" akan diarsipkan. Riwayat transaksi tetap tersimpan, namun dompet tidak bisa dipilih untuk transaksi baru.`
          : `Kategori "${confirmAction?.name}" akan dihapus. Transaksi terkait akan dipindahkan ke kategori "Lain-lain".`
        }
        variant="danger"
        confirmLabel={confirmAction?.type === 'archive' ? 'Arsipkan' : 'Hapus'}
      />

      {/* Wallet Modal */}
      <Modal isOpen={isWalletModalOpen} onClose={() => setWalletModalOpen(false)} title={editingWalletId ? 'Edit Dompet' : 'Tambah Dompet'}>
        <form onSubmit={handleWalletSubmit} className="tx-form">
          <div className="form-group">
            <label htmlFor="wallet-name">Nama Dompet</label>
            <input id="wallet-name" type="text" required value={walletName} onChange={e => setWalletName(e.target.value)} placeholder="Misal: Dompet Utama" />
            {walletErrors.name && <span className="field-error">{walletErrors.name}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="wallet-type">Tipe</label>
            <select id="wallet-type" value={walletType} onChange={e => setWalletType(e.target.value as 'Cash' | 'Bank' | 'E-Wallet')}>
              <option value="Cash">Cash</option>
              <option value="Bank">Bank</option>
              <option value="E-Wallet">E-Wallet</option>
            </select>
          </div>
          <CurrencyInput
            id="wallet-balance"
            label={editingWalletId ? 'Saldo Saat Ini' : 'Saldo Awal'}
            value={walletBalance}
            onChange={setWalletBalance}
            error={walletErrors.openingBalance}
            autoFocus
            required
          />
          {editingWalletId && (
            <span className="field-hint" style={{ marginTop: '-4px', display: 'block' }}>Mengubah saldo akan membuat transaksi penyesuaian otomatis.</span>
          )}
          <div className="modal-form-actions">
            <button type="button" className="secondary-btn" onClick={() => setWalletModalOpen(false)}>Batal</button>
            <button type="submit" className="primary-btn">Simpan</button>
          </div>
        </form>
      </Modal>

      {/* Category Modal */}
      <Modal isOpen={isCatModalOpen} onClose={() => setCatModalOpen(false)} title={editingCatId ? 'Edit Kategori' : 'Tambah Kategori'}>
        <form onSubmit={handleCatSubmit} className="tx-form">
          <div className="form-group">
            <label htmlFor="cat-name">Nama Kategori</label>
            <input id="cat-name" type="text" required value={catName} onChange={e => setCatName(e.target.value)} placeholder="Misal: Bensin" />
            {catErrors.name && <span className="field-error">{catErrors.name}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="cat-type">Jenis</label>
            <select id="cat-type" value={catType} onChange={e => setCatType(e.target.value as CategoryType)}>
              <option value="Out">Pengeluaran</option>
              <option value="In">Pemasukan</option>
            </select>
          </div>
          <div className="form-group">
            <label>Ikon</label>
            <div className="icon-selector" role="radiogroup" aria-label="Pilih ikon">
              {availableIcons.map(icon => (
                <div 
                  key={icon} 
                  role="radio"
                  aria-checked={catIcon === icon}
                  aria-label={icon}
                  tabIndex={0}
                  className={`icon-option ${catIcon === icon ? 'selected' : ''}`}
                  onClick={() => setCatIcon(icon)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCatIcon(icon); } }}
                >
                  {getIconComponent(icon, { size: 24 })}
                </div>
              ))}
            </div>
          </div>
          <div className="modal-form-actions">
            <button type="button" className="secondary-btn" onClick={() => setCatModalOpen(false)}>Batal</button>
            <button type="submit" className="primary-btn">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
