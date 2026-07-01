import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../components/ui/ToastContext';
import { Plus, Pencil, Trash2, AlertTriangle, AlertCircle, PieChart } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { getIconComponent } from '../utils/icons';
import { isSameMonth } from '../utils/date';
import { validateBudget } from '../schemas/validation';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import CurrencyInput from '../components/ui/CurrencyInput';
import type { Budget } from '../types';
import './Budgets.css';

export default function Budgets() {
  const { budgets, categories, transactions, addBudget, updateBudget, deleteBudget } = useData();
  const toast = useToast();

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);

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

  const expenseCategories = categories.filter(c => c.type === 'Out');
  
  const openForm = (budget?: Budget) => {
    if (budget) {
      setEditingBudget(budget);
      setCategoryId(budget.categoryId);
      setAmount(budget.amount.toString());
    } else {
      setEditingBudget(null);
      setCategoryId('');
      setAmount('');
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const closeForm = () => {
    setIsModalOpen(false);
    setEditingBudget(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = validateBudget({ categoryId, amount: Number(amount) });
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    if (editingBudget) {
      updateBudget(editingBudget.id, { categoryId, amount: Number(amount), month: currentMonth, year: currentYear });
      toast.success('Anggaran berhasil diperbarui');
    } else {
      const existing = budgets.find(b => b.categoryId === categoryId && b.month === currentMonth && b.year === currentYear);
      if (existing) {
        setErrors({ categoryId: 'Kategori ini sudah memiliki anggaran pada bulan ini.' });
        return;
      }
      addBudget({ categoryId, amount: Number(amount), month: currentMonth, year: currentYear });
      toast.success('Anggaran berhasil ditambahkan');
    }
    closeForm();
  };

  const getSpentAmount = (catId: string) => {
    return transactions
      .filter(t => t.type === 'Out' && t.categoryId === catId && isSameMonth(t.date, currentMonth, currentYear))
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const filteredBudgets = budgets.filter(b => b.month === currentMonth && b.year === currentYear);

  return (
    <div className="budgets-container fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Anggaran</h2>
          <p className="page-subtitle">Kontrol pengeluaran Anda</p>
        </div>
        <button className="primary-btn" onClick={() => openForm()}>
          <Plus size={18} /> Buat Anggaran
        </button>
      </div>

      <div className="budget-controls" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="month-selector">
          <button className="secondary-btn icon-only" onClick={handlePrevMonth}>&lt;</button>
          <span className="current-month">
            {new Date(currentYear, currentMonth - 1).toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
          </span>
          <button className="secondary-btn icon-only" onClick={handleNextMonth}>&gt;</button>
        </div>
      </div>

      <div className="budget-grid">
        {filteredBudgets.length > 0 ? (
          filteredBudgets.map(budget => {
            const cat = categories.find(c => c.id === budget.categoryId);
            const spent = getSpentAmount(budget.categoryId);
            const remaining = budget.amount - spent;
            const percentage = Math.min((spent / budget.amount) * 100, 100);
            
            let statusColor = 'var(--success)';
            let statusIcon = null;
            if (percentage >= 100) {
              statusColor = 'var(--danger)';
              statusIcon = <AlertTriangle size={16} />;
            } else if (percentage >= 80) {
              statusColor = 'var(--warning)';
              statusIcon = <AlertCircle size={16} />;
            }

            return (
              <div key={budget.id} className="budget-card group">
                <div className="budget-header">
                  <div className="budget-cat">
                    <div className="budget-icon">
                      {getIconComponent(cat?.icon || 'tag', { size: 20 })}
                    </div>
                    <div className="budget-cat-name">{cat?.name || 'Kategori Dihapus'}</div>
                  </div>
                  <div className="budget-actions">
                    <button className="icon-btn" onClick={() => openForm(budget)} aria-label="Edit">
                      <Pencil size={18} />
                    </button>
                    <button className="icon-btn text-danger" onClick={() => setBudgetToDelete(budget)} aria-label="Hapus">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="budget-amounts">
                  <div>
                    <div className="budget-label">Terpakai</div>
                    <div className="budget-spent tabular-nums">{formatCurrency(spent)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="budget-label">Dari Total</div>
                    <div className="budget-total tabular-nums">{formatCurrency(budget.amount)}</div>
                  </div>
                </div>

                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${percentage}%`, backgroundColor: statusColor }}
                  ></div>
                </div>

                <div className="budget-footer" style={{ color: statusColor }}>
                  {statusIcon}
                  {percentage >= 100 
                    ? `Melebihi anggaran ${formatCurrency(Math.abs(remaining))}`
                    : `Sisa ${formatCurrency(remaining)}`
                  }
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ gridColumn: '1 / -1' }}>
            <EmptyState
              icon={<PieChart />}
              title="Belum ada anggaran"
              description="Atur batas pengeluaran untuk setiap kategori agar keuangan Anda lebih terkendali."
              actionLabel="Buat Anggaran Pertama"
              onAction={() => openForm()}
            />
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeForm} title={editingBudget ? 'Edit Anggaran' : 'Buat Anggaran'}>
        <form onSubmit={handleSubmit} className="tx-form">
          <div className="form-group">
            <label htmlFor="budget-category">Kategori Pengeluaran</label>
            <select 
              id="budget-category" 
              value={categoryId} 
              onChange={e => setCategoryId(e.target.value)}
              disabled={!!editingBudget}
            >
              <option value="">Pilih Kategori...</option>
              {expenseCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <span className="field-error">{errors.categoryId}</span>}
          </div>

          <CurrencyInput
            id="budget-amount"
            label="Batas Anggaran per Bulan"
            value={amount}
            onChange={setAmount}
            error={errors.amount}
            autoFocus
            required
          />

          <div className="modal-form-actions">
            <button type="button" className="secondary-btn" onClick={closeForm}>Batal</button>
            <button type="submit" className="primary-btn">Simpan</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={budgetToDelete !== null}
        onClose={() => setBudgetToDelete(null)}
        onConfirm={() => {
          if (budgetToDelete) {
            deleteBudget(budgetToDelete.id);
            toast.success('Anggaran berhasil dihapus');
            setBudgetToDelete(null);
          }
        }}
        title="Hapus Anggaran?"
        message="Batas anggaran untuk kategori ini akan dihapus. Riwayat transaksi tidak akan terpengaruh."
        variant="danger"
        confirmLabel="Hapus"
      />
    </div>
  );
}
