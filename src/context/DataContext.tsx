import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Wallet, Category, Transaction, Budget } from '../types';
import { generateId } from '../utils/format';

const initialWallets: Wallet[] = [
  { id: '1', name: 'Dompet Tunai', type: 'Cash', balance: 1500000 },
  { id: '2', name: 'Rekening BCA', type: 'Bank', balance: 5000000 }
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
  { id: '2', walletId: '1', categoryId: '3', type: 'Out', amount: 50000, date: new Date().toISOString(), notes: 'Makan Siang' }
];

const initialBudgets: Budget[] = [
  { id: '1', categoryId: '3', amount: 2000000, month: new Date().getMonth() + 1, year: new Date().getFullYear() }
];

interface DataContextType {
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  
  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  
  // Wallets
  addWallet: (wallet: Omit<Wallet, 'id'>) => void;
  updateWallet: (id: string, wallet: Omit<Wallet, 'id'>) => void;
  deleteWallet: (id: string) => void;
  
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

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallets, setWallets] = useState<Wallet[]>(() => {
    const saved = localStorage.getItem('mk_wallets');
    return saved ? JSON.parse(saved) : initialWallets;
  });
  
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('mk_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('mk_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('mk_budgets');
    return saved ? JSON.parse(saved) : initialBudgets;
  });

  useEffect(() => { localStorage.setItem('mk_wallets', JSON.stringify(wallets)); }, [wallets]);
  useEffect(() => { localStorage.setItem('mk_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('mk_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('mk_budgets', JSON.stringify(budgets)); }, [budgets]);

  // --- Transactions ---
  const applyTxBalance = (tx: Pick<Transaction, 'type' | 'amount' | 'walletId' | 'toWalletId'>, multiplier: 1 | -1) => {
    setWallets(prev => {
      let newWallets = [...prev];
      if (tx.type === 'In') {
        newWallets = newWallets.map(w => w.id === tx.walletId ? { ...w, balance: w.balance + (tx.amount * multiplier) } : w);
      } else if (tx.type === 'Out') {
        newWallets = newWallets.map(w => w.id === tx.walletId ? { ...w, balance: w.balance - (tx.amount * multiplier) } : w);
      } else if (tx.type === 'Transfer') {
        newWallets = newWallets.map(w => {
          if (w.id === tx.walletId) return { ...w, balance: w.balance - (tx.amount * multiplier) };
          if (w.id === tx.toWalletId) return { ...w, balance: w.balance + (tx.amount * multiplier) };
          return w;
        });
      }
      return newWallets;
    });
  };

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx = { ...tx, id: generateId() };
    setTransactions(prev => [newTx, ...prev]);
    applyTxBalance(newTx, 1);
  };

  const updateTransaction = (id: string, newTxData: Omit<Transaction, 'id'>) => {
    const oldTx = transactions.find(t => t.id === id);
    if (!oldTx) return;

    // Revert old transaction balances
    applyTxBalance(oldTx, -1);
    
    // Apply new transaction balances
    applyTxBalance(newTxData, 1);

    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...newTxData } : t));
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;
    
    // Revert balance
    applyTxBalance(tx, -1);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // --- Wallets ---
  const addWallet = (wallet: Omit<Wallet, 'id'>) => setWallets(prev => [...prev, { ...wallet, id: generateId() }]);
  const updateWallet = (id: string, wallet: Omit<Wallet, 'id'>) => setWallets(prev => prev.map(w => w.id === id ? { ...w, ...wallet } : w));
  const deleteWallet = (id: string) => setWallets(prev => prev.filter(w => w.id !== id)); // Note: Should probably handle orphaned transactions in a real app

  // --- Categories ---
  const addCategory = (cat: Omit<Category, 'id'>) => setCategories(prev => [...prev, { ...cat, id: generateId() }]);
  const updateCategory = (id: string, cat: Omit<Category, 'id'>) => setCategories(prev => prev.map(c => c.id === id ? { ...c, ...cat } : c));
  const deleteCategory = (id: string) => {
    const catToDelete = categories.find(c => c.id === id);
    if (!catToDelete) return;

    const hasTxs = transactions.some(t => t.categoryId === id);
    if (hasTxs) {
      // Find fallback category
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
      
      setTransactions(prev => prev.map(t => t.categoryId === id ? { ...t, categoryId: newFallbackId } : t));
    }
    
    setCategories(prev => prev.filter(c => c.id !== id));
    setBudgets(prev => prev.filter(b => b.categoryId !== id));
  };

  // --- Budgets ---
  const addBudget = (budget: Omit<Budget, 'id'>) => setBudgets(prev => [...prev, { ...budget, id: generateId() }]);
  const updateBudget = (id: string, budget: Omit<Budget, 'id'>) => setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...budget } : b));
  const deleteBudget = (id: string) => setBudgets(prev => prev.filter(b => b.id !== id));

  return (
    <DataContext.Provider value={{ 
      wallets, categories, transactions, budgets, 
      addTransaction, updateTransaction, deleteTransaction,
      addWallet, updateWallet, deleteWallet,
      addCategory, updateCategory, deleteCategory,
      addBudget, updateBudget, deleteBudget
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
