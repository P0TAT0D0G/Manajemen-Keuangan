import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { validateTransaction } from '../../schemas/validation';
import CurrencyInput from '../ui/CurrencyInput';
import type { TransactionType } from '../../types';
import './TransactionForm.css';

interface TransactionFormProps {
  initialData?: {
    id?: string;
    type: TransactionType;
    amount: number;
    categoryId: string;
    walletId: string;
    toWalletId?: string;
    date: string;
    notes: string;
  };
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

export default function TransactionForm({ initialData, onSubmitSuccess, onCancel }: TransactionFormProps) {
  const { categories, wallets, addTransaction, updateTransaction } = useData();

  const [type, setType] = useState<TransactionType>(initialData?.type || 'Out');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [walletId, setWalletId] = useState(initialData?.walletId || '');
  const [toWalletId, setToWalletId] = useState(initialData?.toWalletId || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeWallets = wallets.filter(w => !w.isArchived);

  // Set defaults when lists load or type changes
  useEffect(() => {
    if (!initialData && activeWallets.length > 0 && !walletId) {
      setWalletId(activeWallets[0].id);
    }
  }, [activeWallets, walletId, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = validateTransaction({
      type,
      amount: Number(amount),
      walletId,
      toWalletId: type === 'Transfer' ? toWalletId : undefined,
      categoryId: type !== 'Transfer' ? categoryId : undefined,
      date
    });

    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    const txData = {
      type,
      amount: Number(amount),
      categoryId: type === 'Transfer' ? '' : categoryId,
      walletId,
      toWalletId: type === 'Transfer' ? toWalletId : undefined,
      date,
      notes
    };

    if (initialData?.id) {
      updateTransaction(initialData.id, txData);
    } else {
      addTransaction(txData);
    }
    
    onSubmitSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="tx-form">
      <div className="tx-type-selector" role="radiogroup" aria-label="Jenis Transaksi">
        <button
          type="button"
          role="radio"
          aria-checked={type === 'Out'}
          className={`type-btn ${type === 'Out' ? 'active out' : ''}`}
          onClick={() => setType('Out')}
        >
          Pengeluaran
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={type === 'In'}
          className={`type-btn ${type === 'In' ? 'active in' : ''}`}
          onClick={() => setType('In')}
        >
          Pemasukan
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={type === 'Transfer'}
          className={`type-btn ${type === 'Transfer' ? 'active transfer' : ''}`}
          onClick={() => setType('Transfer')}
        >
          Transfer
        </button>
      </div>

      <CurrencyInput
        id="tx-amount"
        label="Nominal"
        value={amount}
        onChange={setAmount}
        error={errors.amount}
        autoFocus
        required
      />

      <div className="form-group">
        <label htmlFor="tx-wallet">{type === 'Transfer' ? 'Dari Dompet' : 'Dompet'}</label>
        <select id="tx-wallet" value={walletId} onChange={e => setWalletId(e.target.value)}>
          <option value="">Pilih Dompet...</option>
          {activeWallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        {errors.walletId && <span className="field-error">{errors.walletId}</span>}
      </div>

      {type === 'Transfer' && (
        <div className="form-group fade-in">
          <label htmlFor="tx-towallet">Ke Dompet</label>
          <select id="tx-towallet" value={toWalletId} onChange={e => setToWalletId(e.target.value)}>
            <option value="">Pilih Dompet Tujuan...</option>
            {activeWallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          {errors.toWalletId && <span className="field-error">{errors.toWalletId}</span>}
        </div>
      )}

      {type !== 'Transfer' && (
        <div className="form-group fade-in">
          <label htmlFor="tx-category">Kategori</label>
          <select id="tx-category" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            <option value="">Pilih Kategori...</option>
            {categories.filter(c => c.type === type).map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.categoryId && <span className="field-error">{errors.categoryId}</span>}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="tx-date">Tanggal</label>
        <input 
          id="tx-date" 
          type="date" 
          value={date} 
          onChange={e => setDate(e.target.value)}
          required
        />
        {errors.date && <span className="field-error">{errors.date}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="tx-notes">Catatan (Opsional)</label>
        <input 
          id="tx-notes" 
          type="text" 
          value={notes} 
          onChange={e => setNotes(e.target.value)}
          placeholder="Misal: Beli makan siang"
        />
      </div>

      <div className="modal-form-actions">
        <button type="button" className="secondary-btn" onClick={onCancel}>Batal</button>
        <button type="submit" className="primary-btn">Simpan</button>
      </div>
    </form>
  );
}
