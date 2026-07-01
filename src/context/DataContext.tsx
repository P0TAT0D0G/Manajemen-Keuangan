import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Wallet, Category, Transaction, Budget } from '../types';
import { computeWalletBalance, calculateAdjustment } from '../services/balance';
import { repository } from '../services/indexedDB.repository';
import { Loader2 } from 'lucide-react'; // We can use Lucide for loading

// ---------------------------------------------------------------------------
// Seed Data
// ---------------------------------------------------------------------------

const initialCategories: Category[] = [
  { id: '1', name: 'Makanan & Minuman', type: 'Out', icon: 'coffee' },
  { id: '2', name: 'Transportasi', type: 'Out', icon: 'bus' },
  { id: '3', name: 'Tagihan', type: 'Out', icon: 'file-text' },
  { id: '4', name: 'Hiburan', type: 'Out', icon: 'film' },
  { id: '5', name: 'Gaji', type: 'In', icon: 'briefcase' },
  { id: '6', name: 'Lain-lain', type: 'Out', icon: 'help-circle' },
];

// ---------------------------------------------------------------------------
// Context type
// ---------------------------------------------------------------------------

interface DataContextType {
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];

  isLoading: boolean;

  // Computed balance
  getWalletBalance: (walletId: string) => number;

  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, tx: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Wallets
  addWallet: (wallet: Omit<Wallet, 'id'>) => Promise<void>;
  updateWallet: (id: string, wallet: Omit<Wallet, 'id'>) => Promise<void>;
  archiveWallet: (id: string) => Promise<void>;
  restoreWallet: (id: string) => Promise<void>;
  adjustWalletBalance: (walletId: string, desiredBalance: number) => Promise<void>;

  // Categories
  addCategory: (cat: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, cat: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Budgets
  addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (id: string, budget: Omit<Budget, 'id'>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  // Backup & Restore
  exportData: () => Promise<string>;
  importData: (jsonData: string, mode: 'merge' | 'replace') => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [w, t, b, c] = await Promise.all([
        repository.getWallets(),
        repository.getTransactions(),
        repository.getBudgets(),
        repository.getCategories()
      ]);

      if (c.length === 0) {
        await repository.saveCategories(initialCategories);
        setCategories(initialCategories);
      } else {
        setCategories(c);
      }

      setWallets(w);
      setTransactions(t);
      setBudgets(b);
    } catch (error) {
      console.error('Failed to init data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    const newTx = await repository.createTransaction(tx);
    setTransactions(prev => [newTx, ...prev]);
  };

  const updateTransaction = async (id: string, newTxData: Omit<Transaction, 'id'>) => {
    const updated = await repository.updateTransaction(id, newTxData);
    setTransactions(prev => prev.map(t => (t.id === id ? updated : t)));
  };

  const deleteTransaction = async (id: string) => {
    await repository.deleteTransaction(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // ---------------------------------------------------------------------------
  // Wallets
  // ---------------------------------------------------------------------------

  const addWallet = async (wallet: Omit<Wallet, 'id'>) => {
    const newWallet = await repository.createWallet(wallet);
    setWallets(prev => [...prev, newWallet]);
  };

  const updateWallet = async (id: string, wallet: Omit<Wallet, 'id'>) => {
    const updated = await repository.updateWallet(id, wallet);
    setWallets(prev => prev.map(w => (w.id === id ? updated : w)));
  };

  const archiveWallet = async (id: string) => {
    const archived = await repository.archiveWallet(id);
    setWallets(prev => prev.map(w => (w.id === id ? archived : w)));
  };

  const restoreWallet = async (id: string) => {
    const restored = await repository.restoreWallet(id);
    setWallets(prev => prev.map(w => (w.id === id ? restored : w)));
  };

  const adjustWalletBalance = async (walletId: string, desiredBalance: number) => {
    const wallet = wallets.find(w => w.id === walletId);
    if (!wallet) return;

    const adjustment = calculateAdjustment(wallet, transactions, desiredBalance);
    if (adjustment === 0) return;

    const newTx = await repository.createTransaction({
      walletId,
      categoryId: 'adjustment',
      type: 'Adjustment',
      amount: adjustment,
      date: new Date().toISOString(),
      notes: 'Penyesuaian saldo manual',
    });

    setTransactions(prev => [newTx, ...prev]);
  };

  // ---------------------------------------------------------------------------
  // Categories
  // ---------------------------------------------------------------------------

  const addCategory = async (cat: Omit<Category, 'id'>) => {
    const newCat = await repository.createCategory(cat);
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = async (id: string, cat: Omit<Category, 'id'>) => {
    const updated = await repository.updateCategory(id, cat);
    setCategories(prev => prev.map(c => (c.id === id ? updated : c)));
  };

  const deleteCategory = async (id: string) => {
    const catToDelete = categories.find(c => c.id === id);
    if (!catToDelete) return;

    const hasTxs = transactions.some(t => t.categoryId === id);
    if (hasTxs) {
      const fallbackName = `Lain-lain (${catToDelete.type})`;
      let fallback = categories.find(c => c.name === fallbackName && c.type === catToDelete.type);

      let newFallbackId = '';
      if (!fallback) {
        const newFallback = await repository.createCategory({
          name: fallbackName,
          type: catToDelete.type,
          icon: 'help-circle'
        });
        setCategories(prev => [...prev, newFallback]);
        newFallbackId = newFallback.id;
      } else {
        newFallbackId = fallback.id;
      }

      // Update all transactions that used this category
      const txsToUpdate = transactions.filter(t => t.categoryId === id);
      for (const t of txsToUpdate) {
        await repository.updateTransaction(t.id, { categoryId: newFallbackId });
      }
      
      setTransactions(prev => prev.map(t => (t.categoryId === id ? { ...t, categoryId: newFallbackId } : t)));
    }

    await repository.deleteCategory(id);
    
    // Also delete associated budgets
    const budgetsToDelete = budgets.filter(b => b.categoryId === id);
    for (const b of budgetsToDelete) {
      await repository.deleteBudget(b.id);
    }

    setCategories(prev => prev.filter(c => c.id !== id));
    setBudgets(prev => prev.filter(b => b.categoryId !== id));
  };

  // ---------------------------------------------------------------------------
  // Budgets
  // ---------------------------------------------------------------------------

  const addBudget = async (budget: Omit<Budget, 'id'>) => {
    const newBudget = await repository.createBudget(budget);
    setBudgets(prev => [...prev, newBudget]);
  };

  const updateBudget = async (id: string, budget: Omit<Budget, 'id'>) => {
    const updated = await repository.updateBudget(id, budget);
    setBudgets(prev => prev.map(b => (b.id === id ? updated : b)));
  };

  const deleteBudget = async (id: string) => {
    await repository.deleteBudget(id);
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  // ---------------------------------------------------------------------------
  // Backup & Restore
  // ---------------------------------------------------------------------------

  const exportData = useCallback(async () => {
    return await repository.exportData();
  }, []);

  const importData = useCallback(async (jsonData: string, mode: 'merge' | 'replace') => {
    await repository.importData(jsonData, mode);
    await fetchData(); // Reload all state from DB after import
  }, [fetchData]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  
  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)' }}>
        <Loader2 className="spinner" size={48} color="var(--primary)" />
      </div>
    );
  }

  return (
    <DataContext.Provider
      value={{
        wallets,
        categories,
        transactions,
        budgets,
        isLoading,
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
        exportData,
        importData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

// eslint-disable-next-line react/only-export-components
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
