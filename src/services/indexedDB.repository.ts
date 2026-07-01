import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { FinanceRepository } from './types';
import type { Transaction, Wallet, Category, Budget } from '../types';
import { generateId } from '../utils/format';

interface FinanceDB extends DBSchema {
  wallets: { key: string; value: Wallet };
  categories: { key: string; value: Category };
  transactions: {
    key: string;
    value: Transaction;
    indexes: {
      'by-date': string;
      'by-wallet': string;
      'by-category': string;
    };
  };
  budgets: {
    key: string;
    value: Budget;
  };
}

const DB_NAME = 'FinanceAppDB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<FinanceDB>>;

async function migrateFromLocalStorage(db: IDBPDatabase<FinanceDB>) {
  const isMigrated = localStorage.getItem('idb_migrated');
  if (isMigrated === 'true') return;

  const storageKeys = {
    WALLETS: 'finance_wallets',
    TRANSACTIONS: 'finance_transactions',
    CATEGORIES: 'finance_categories',
    BUDGETS: 'finance_budgets'
  };

  const getLocal = (key: string) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  };

  const wallets = getLocal(storageKeys.WALLETS) as Wallet[];
  const categories = getLocal(storageKeys.CATEGORIES) as Category[];
  const transactions = getLocal(storageKeys.TRANSACTIONS) as Transaction[];
  const budgets = getLocal(storageKeys.BUDGETS) as Budget[];

  if (wallets.length || categories.length || transactions.length || budgets.length) {
    const tx = db.transaction(['wallets', 'categories', 'transactions', 'budgets'], 'readwrite');
    for (const w of wallets) await tx.objectStore('wallets').put(w);
    for (const c of categories) await tx.objectStore('categories').put(c);
    for (const t of transactions) await tx.objectStore('transactions').put(t);
    for (const b of budgets) await tx.objectStore('budgets').put(b);
    await tx.done; // Ensure all puts finish

    // Clean up local storage
    localStorage.removeItem(storageKeys.WALLETS);
    localStorage.removeItem(storageKeys.CATEGORIES);
    localStorage.removeItem(storageKeys.TRANSACTIONS);
    localStorage.removeItem(storageKeys.BUDGETS);
  }

  localStorage.setItem('idb_migrated', 'true');
}

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<FinanceDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('wallets')) {
          db.createObjectStore('wallets', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('transactions')) {
          const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
          txStore.createIndex('by-date', 'date');
          txStore.createIndex('by-wallet', 'walletId');
          txStore.createIndex('by-category', 'categoryId');
        }
        if (!db.objectStoreNames.contains('budgets')) {
          db.createObjectStore('budgets', { keyPath: 'id' });
        }
      },
    }).then(async (db) => {
      try {
        await migrateFromLocalStorage(db);
      } catch (err) {
        console.error('Migration failed:', err);
      }
      return db;
    });
  }
  return dbPromise;
}

export class IndexedDBRepository implements FinanceRepository {
  // Wallets
  async getWallets(): Promise<Wallet[]> {
    const db = await getDB();
    return db.getAll('wallets');
  }

  async saveWallets(wallets: Wallet[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('wallets', 'readwrite');
    await tx.objectStore('wallets').clear();
    for (const w of wallets) await tx.objectStore('wallets').put(w);
    await tx.done;
  }

  async createWallet(input: Omit<Wallet, 'id'>): Promise<Wallet> {
    const db = await getDB();
    const newWallet = { ...input, id: generateId() };
    await db.put('wallets', newWallet);
    return newWallet;
  }

  async updateWallet(id: string, input: Partial<Omit<Wallet, 'id'>>): Promise<Wallet> {
    const db = await getDB();
    const existing = await db.get('wallets', id);
    if (!existing) throw new Error('Wallet not found');
    const updated = { ...existing, ...input };
    await db.put('wallets', updated);
    return updated;
  }

  async archiveWallet(id: string): Promise<Wallet> {
    return this.updateWallet(id, { isArchived: true });
  }

  async restoreWallet(id: string): Promise<Wallet> {
    return this.updateWallet(id, { isArchived: false });
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const db = await getDB();
    return db.getAll('categories');
  }

  async saveCategories(categories: Category[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('categories', 'readwrite');
    await tx.objectStore('categories').clear();
    for (const c of categories) await tx.objectStore('categories').put(c);
    await tx.done;
  }

  async createCategory(input: Omit<Category, 'id'>): Promise<Category> {
    const db = await getDB();
    const newCategory = { ...input, id: generateId() };
    await db.put('categories', newCategory);
    return newCategory;
  }

  async updateCategory(id: string, input: Partial<Omit<Category, 'id'>>): Promise<Category> {
    const db = await getDB();
    const existing = await db.get('categories', id);
    if (!existing) throw new Error('Category not found');
    const updated = { ...existing, ...input };
    await db.put('categories', updated);
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('categories', id);
  }

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    const db = await getDB();
    const txs = await db.getAllFromIndex('transactions', 'by-date');
    // Sort descending by date (newest first)
    return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async saveTransactions(transactions: Transaction[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('transactions', 'readwrite');
    await tx.objectStore('transactions').clear();
    for (const t of transactions) await tx.objectStore('transactions').put(t);
    await tx.done;
  }

  async createTransaction(input: Omit<Transaction, 'id'>): Promise<Transaction> {
    const db = await getDB();
    const newTx = { ...input, id: generateId() };
    await db.put('transactions', newTx);
    return newTx;
  }

  async updateTransaction(id: string, input: Partial<Omit<Transaction, 'id'>>): Promise<Transaction> {
    const db = await getDB();
    const existing = await db.get('transactions', id);
    if (!existing) throw new Error('Transaction not found');
    const updated = { ...existing, ...input };
    await db.put('transactions', updated);
    return updated;
  }

  async deleteTransaction(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('transactions', id);
  }

  // Budgets
  async getBudgets(): Promise<Budget[]> {
    const db = await getDB();
    return db.getAll('budgets');
  }

  async saveBudgets(budgets: Budget[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('budgets', 'readwrite');
    await tx.objectStore('budgets').clear();
    for (const b of budgets) await tx.objectStore('budgets').put(b);
    await tx.done;
  }

  async createBudget(input: Omit<Budget, 'id'>): Promise<Budget> {
    const db = await getDB();
    const newBudget = { ...input, id: generateId() };
    await db.put('budgets', newBudget);
    return newBudget;
  }

  async updateBudget(id: string, input: Partial<Omit<Budget, 'id'>>): Promise<Budget> {
    const db = await getDB();
    const existing = await db.get('budgets', id);
    if (!existing) throw new Error('Budget not found');
    const updated = { ...existing, ...input };
    await db.put('budgets', updated);
    return updated;
  }

  async deleteBudget(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('budgets', id);
  }

  // Utility
  async clearAll(): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(['wallets', 'categories', 'transactions', 'budgets'], 'readwrite');
    await tx.objectStore('wallets').clear();
    await tx.objectStore('categories').clear();
    await tx.objectStore('transactions').clear();
    await tx.objectStore('budgets').clear();
    await tx.done;
    localStorage.removeItem('onboarding_complete');
  }

  async exportData(): Promise<string> {
    const db = await getDB();
    const wallets = await db.getAll('wallets');
    const categories = await db.getAll('categories');
    const transactions = await db.getAll('transactions');
    const budgets = await db.getAll('budgets');

    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      wallets,
      categories,
      transactions,
      budgets,
      settings: {}
    };

    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string, mode: 'merge' | 'replace'): Promise<void> {
    const data = JSON.parse(jsonData);
    
    // Basic validation
    if (!data.version || !Array.isArray(data.wallets) || !Array.isArray(data.categories) || !Array.isArray(data.transactions) || !Array.isArray(data.budgets)) {
      throw new Error('Format file backup tidak valid');
    }

    const db = await getDB();
    const tx = db.transaction(['wallets', 'categories', 'transactions', 'budgets'], 'readwrite');
    
    if (mode === 'replace') {
      await tx.objectStore('wallets').clear();
      await tx.objectStore('categories').clear();
      await tx.objectStore('transactions').clear();
      await tx.objectStore('budgets').clear();
    }

    for (const w of data.wallets) await tx.objectStore('wallets').put(w);
    for (const c of data.categories) await tx.objectStore('categories').put(c);
    for (const t of data.transactions) await tx.objectStore('transactions').put(t);
    for (const b of data.budgets) await tx.objectStore('budgets').put(b);
    
    await tx.done;
    
    if (mode === 'replace') {
      localStorage.removeItem('onboarding_complete'); // Let it re-evaluate or use settings if any
    }
  }
}

export const repository = new IndexedDBRepository();
