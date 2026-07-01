import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Wallet, Category, Transaction, Budget } from '../types';

// Mock Initial Data
const initialWallets: Wallet[] = [
  { id: '1', name: 'Dompet Tunai', type: 'Cash', balance: 1500000 },
  { id: '2', name: 'Rekening BCA', type: 'Bank', balance: 5000000 }
];

const initialCategories: Category[] = [
  { id: '1', name: 'Gaji', type: 'In', icon: 'briefcase' },
  { id: '2', name: 'Freelance', type: 'In', icon: 'monitor' },
  { id: '3', name: 'Makan & Minum', type: 'Out', icon: 'coffee' },
  { id: '4', name: 'Transportasi', type: 'Out', icon: 'bus' },
  { id: '5', name: 'Hiburan', type: 'Out', icon: 'film' }
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
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  addWallet: (wallet: Omit<Wallet, 'id'>) => void;
  // Will add more methods as needed
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

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx = { ...tx, id: Math.random().toString(36).substr(2, 9) };
    setTransactions(prev => [newTx, ...prev]);
    
    // Update wallet balance
    if (tx.type === 'In') {
      setWallets(prev => prev.map(w => w.id === tx.walletId ? { ...w, balance: w.balance + tx.amount } : w));
    } else if (tx.type === 'Out') {
      setWallets(prev => prev.map(w => w.id === tx.walletId ? { ...w, balance: w.balance - tx.amount } : w));
    }
  };

  const addWallet = (wallet: Omit<Wallet, 'id'>) => {
    setWallets(prev => [...prev, { ...wallet, id: Math.random().toString(36).substr(2, 9) }]);
  };

  return (
    <DataContext.Provider value={{ wallets, categories, transactions, budgets, addTransaction, addWallet }}>
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
