import React from 'react';
import { useData } from '../context/DataContext';
import { Target, AlertTriangle } from 'lucide-react';
import './Budgets.css';

export default function Budgets() {
  const { budgets, transactions, categories } = useData();

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="budgets-container fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Anggaran</h2>
          <p className="page-subtitle">Bulan {new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      <div className="budgets-list">
        {budgets.filter(b => b.month === currentMonth && b.year === currentYear).map(budget => {
          const category = categories.find(c => c.id === budget.categoryId);
          const spent = transactions
            .filter(t => t.categoryId === budget.categoryId && new Date(t.date).getMonth() + 1 === currentMonth)
            .reduce((s, t) => s + t.amount, 0);
          
          const percentage = Math.min((spent / budget.amount) * 100, 100);
          let progressClass = 'good';
          if (percentage > 75) progressClass = 'warning';
          if (percentage >= 100) progressClass = 'danger';

          return (
            <div key={budget.id} className="budget-card">
              <div className="budget-header">
                <div className="budget-title-area">
                  <div className="budget-icon">
                    <Target size={20} />
                  </div>
                  <h3 className="budget-title">{category?.name}</h3>
                </div>
                {percentage >= 100 && (
                  <span className="budget-alert">
                    <AlertTriangle size={16} /> Melebihi Batas
                  </span>
                )}
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
    </div>
  );
}
