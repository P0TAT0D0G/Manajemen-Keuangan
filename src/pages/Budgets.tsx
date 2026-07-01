import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { Budget } from '../types';
import { Target, AlertTriangle, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { getIconComponent } from '../utils/icons';
import './Budgets.css';

export default function Budgets() {
  const { budgets, transactions, categories, addBudget, updateBudget, deleteBudget } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const openModal = (b?: Budget) => {
    if (b) {
      setEditingId(b.id);
      setCategoryId(b.categoryId);
      setAmount(b.amount.toString());
    } else {
      setEditingId(null);
      setCategoryId('');
      setAmount('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !amount) return;

    const budgetData = {
      categoryId,
      amount: Number(amount),
      month: currentMonth,
      year: currentYear
    };

    if (editingId) {
      updateBudget(editingId, budgetData);
    } else {
      addBudget(budgetData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus anggaran ini?")) {
      deleteBudget(id);
    }
  };

  return (
    <div className="budgets-container fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Anggaran</h2>
          <p className="page-subtitle">Bulan {new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</p>
        </div>
        <button className="primary-btn" onClick={() => openModal()}>
          <Plus size={20} /> Atur Anggaran
        </button>
      </div>

      <div className="budgets-list">
        {budgets.filter(b => b.month === currentMonth && b.year === currentYear).map(budget => {
          const category = categories.find(c => c.id === budget.categoryId);
          
          // Fix: Check both month and year for spent calculation
          const spent = transactions
            .filter(t => {
              const d = new Date(t.date);
              return t.categoryId === budget.categoryId && (d.getMonth() + 1) === currentMonth && d.getFullYear() === currentYear;
            })
            .reduce((s, t) => s + t.amount, 0);
          
          const percentage = Math.min((spent / budget.amount) * 100, 100);
          let progressClass = 'good';
          if (percentage > 75) progressClass = 'warning';
          if (percentage >= 100) progressClass = 'danger';

          return (
            <div key={budget.id} className="budget-card group">
              <div className="budget-header">
                <div className="budget-title-area">
                  <div className="budget-icon">
                    {getIconComponent(category?.icon || 'target', { size: 20 })}
                  </div>
                  <h3 className="budget-title">{category?.name}</h3>
                </div>
                
                <div className="budget-header-actions">
                  {percentage >= 100 && (
                    <span className="budget-alert">
                      <AlertTriangle size={16} /> Melebihi Batas
                    </span>
                  )}
                  <div className="budget-actions">
                    <button className="icon-btn edit-btn" onClick={() => openModal(budget)}><Pencil size={18}/></button>
                    <button className="icon-btn delete-btn" onClick={() => handleDelete(budget.id)}><Trash2 size={18}/></button>
                  </div>
                </div>
              </div>
              
              <div className="budget-amounts tabular-nums">
                <span className="spent">{formatCurrency(spent)}</span>
                <span className="total">/ {formatCurrency(budget.amount)}</span>
              </div>
              
              <div className="progress-bar-bg">
                <div 
                  className={`progress-bar-fill ${progressClass}`} 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}

        {budgets.length === 0 && (
          <div className="empty-state">
            <Target size={48} className="empty-state-icon" />
            <p>Belum ada anggaran yang diatur.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content fade-in">
            <div className="modal-header">
              <h3>{editingId ? 'Edit Anggaran' : 'Atur Anggaran'}</h3>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="tx-form">
              <div className="form-group">
                <label htmlFor="category">Kategori</label>
                <select 
                  id="category" 
                  value={categoryId} 
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {categories.filter(c => c.type === 'Out').map(c => (
                    <option key={c.id} value={c.id} disabled={!editingId && budgets.some(b => b.categoryId === c.id && b.month === currentMonth && b.year === currentYear)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="amount">Batas Anggaran</label>
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

              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="primary-btn">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
