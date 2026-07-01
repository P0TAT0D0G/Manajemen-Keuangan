import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Wallet, Category, Transaction, Budget } from '../types';
import { generateId } from '../utils/format';
import { computeWalletBalance, calculateAdjustment } from '../services/balance';

// ---------------------------------------------------------------------------
// Initial seed data
// ---------------------------------------------------------------------------

const initialWallets: Wallet[] = [
  { id: '1', name: 'Dompet Tunai', type: 'Cash', openingBalance: 1500000 },
  { id: '2', name: 'Rekening BCA', type: 'Bank', openingBalance: 5000000 },
];

const initialCategories: Category[] = [
  { id: '1', name: 'Gaji', type: 'In', icon: 'briefcase' },
  { id: '2', name: 'Freelance', type: 'In', icon: 'monitor' },
  { id: '3', name: 'Makan & Minum', type: 'Out', icon: 'coffee' },
  { id: '4', name: 'Transportasi', type: 'Out', icon: 'bus' },
  { id: '5', name: 'Hiburan', type: 'Out', icon: 'film' },
  { id: '6', name: 'Lain-lain (In)', type: 'In', icon: 'help-circle' },
  { id: '7', name: 'Lain-lain (Out)', type: 'Out', icon: 'help-circle' },
];

const initialTransactions: Transaction[] = [
  { id: '1', walletId: '2', categoryId: '1', type: 'In', amount: 5000000, date: new Date().toISOString(), notes: 'Gaji Bulan Ini' },
  { id: '2', walletId: '1', categoryId: '3', type: 'Out', amount: 50000, date: new Date().toISOString(), notes: 'Makan Siang' },
];

const initialBudgets: Budget[] = [
  { id: '1', categoryId: '3', amount: 2000000, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
];

// ---------------------------------------------------------------------------
// Context type
// ---------------------------------------------------------------------------

interface DataContextType {
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];

  // Computed balance
  getWalletBalance: (walletId: string) => number;

  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;

  // Wallets
  addWallet: (wallet: Omit<Wallet, 'id'>) => void;
  updateWallet: (id: string, wallet: Omit<Wallet, 'id'>) => void;
  archiveWallet: (id: string) => void;
  restoreWallet: (id: string) => void;
  adjustWalletBalance: (walletId: string, desiredBalance: number) => void;

  // Categories
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, cat: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;

  // Budgets
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, budget: Omit<Budget, 'id'>) => void;
  deleteBudget: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

import { repository } from '../services/localStorage.repository';

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallets, setWallets] = useState<Wallet[]>(() => {
    const saved = repository.getWallets();
    return saved.length ? saved : initialWallets;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = repository.getCategories();
    return saved.length ? saved : initialCategories;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = repository.getTransactions();
    return saved.length ? saved : initialTransactions;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = repository.getBudgets();
    return saved.length ? saved : initialBudgets;
  });

  // Persist to repository
  useEffect(() => { repository.saveWallets(wallets); }, [wallets]);
  useEffect(() => { repository.saveCategories(categories); }, [categories]);
  useEffect(() => { repository.saveTransactions(transactions); }, [transactions]);
  useEffect(() => { repository.saveBudgets(budgets); }, [budgets]);

  // ---------------------------------------------------------------------------
  // Computed balance — single source of truth
  // ---------------------------------------------------------------------------

  const getWalletBalance = useCallback(
    (walletId: string): number => {
      const wallet = wallets.find(w => w.id === walletId);
      if (!wallet) return 0;
      return computeWalletBalance(wallet, transactions);
    },
    [wallets, transactions]
  );

  // ---------------------------------------------------------------------------
  // Transactions
  // ---------------------------------------------------------------------------

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...tx, id: generateId() };
    setTransactions(prev => [newTx, ...prev]);
  };

  const updateTransaction = (id: string, newTxData: Omit<Transaction, 'id'>) => {
    setTransactions(prev => prev.map(t => (t.id === id ? { ...t, ...newTxData } : t)));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // ---------------------------------------------------------------------------
  // Wallets
  // ---------------------------------------------------------------------------

  const addWallet = (wallet: Omit<Wallet, 'id'>) => {
    setWallets(prev => [...prev, { ...wallet, id: generateId() }]);
  };

  const updateWallet = (id: string, wallet: Omit<Wallet, 'id'>) => {
    setWallets(prev => prev.map(w => (w.id === id ? { ...w, ...wallet } : w)));
  };

  const archiveWallet = (id: string) => {
    setWallets(prev => prev.map(w => (w.id === id ? { ...w, isArchived: true } : w)));
  };

  const restoreWallet = (id: string) => {
    setWallets(prev => prev.map(w => (w.id === id ? { ...w, isArchived: false } : w)));
  };

  const adjustWalletBalance = (walletId: string, desiredBalance: number) => {
    const wallet = wallets.find(w => w.id === walletId);
    if (!wallet) return;

    const adjustment = calculateAdjustment(wallet, transactions, desiredBalance);
    if (adjustment === 0) return;

    const adjustmentTx: Transaction = {
      id: generateId(),
      walletId,
      categoryId: 'adjustment',
      type: 'Adjustment',
      amount: adjustment, // signed: positive adds, negative subtracts
      date: new Date().toISOString(),
      notes: 'Penyesuaian saldo manual',
    };

    setTransactions(prev => [adjustmentTx, ...prev]);
  };

  // ---------------------------------------------------------------------------
  // Categories
  // ---------------------------------------------------------------------------

  const addCategory = (cat: Omit<Category, 'id'>) => {
    setCategories(prev => [...prev, { ...cat, id: generateId() }]);
  };

  const updateCategory = (id: string, cat: Omit<Category, 'id'>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...cat } : c)));
  };

  const deleteCategory = (id: string) => {
    const catToDelete = categories.find(c => c.id === id);
    if (!catToDelete) return;

    const hasTxs = transactions.some(t => t.categoryId === id);
    if (hasTxs) {
      // Find or create a fallback category
      const fallbackName = `Lain-lain (${catToDelete.type})`;
      let fallback = categories.find(c => c.name === fallbackName && c.type === catToDelete.type);

      let newFallbackId = '';
      if (!fallback) {
        newFallbackId = generateId();
        const newFallback: Category = { id: newFallbackId, name: fallbackName, type: catToDelete.type, icon: 'help-circle' };
        setCategories(prev => [...prev, newFallback]);
      } else {
        newFallbackId = fallback.id;
      }

      setTransactions(prev => prev.map(t => (t.categoryId === id ? { ...t, categoryId: newFallbackId } : t)));
    }

    setCategories(prev => prev.filter(c => c.id !== id));
    setBudgets(prev => prev.filter(b => b.categoryId !== id));
  };

  // ---------------------------------------------------------------------------
  // Budgets
  // ---------------------------------------------------------------------------

  const addBudget = (budget: Omit<Budget, 'id'>) => {
    setBudgets(prev => [...prev, { ...budget, id: generateId() }]);
  };

  const updateBudget = (id: string, budget: Omit<Budget, 'id'>) => {
    setBudgets(prev => prev.map(b => (b.id === id ? { ...b, ...budget } : b)));
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <DataContext.Provider
      value={{
        wallets,
        categories,
        transactions,
        budgets,
        getWalletBalance,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addWallet,
        updateWallet,
        archiveWallet,
        restoreWallet,
        adjustWalletBalance,
        addCategory,
        updateCategory,
        deleteCategory,
        addBudget,
        updateBudget,
        deleteBudget,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
