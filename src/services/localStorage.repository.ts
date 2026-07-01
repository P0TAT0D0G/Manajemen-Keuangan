import type { FinanceRepository } from './types';
import type { Transaction, Wallet, Category, Budget } from '../types';
import { generateId } from '../utils/format';

const STORAGE_KEYS = {
  WALLETS: 'finance_wallets',
  TRANSACTIONS: 'finance_transactions',
  CATEGORIES: 'finance_categories',
  BUDGETS: 'finance_budgets'
};

// Helper to simulate network delay
const delay = (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms));

export class LocalStorageRepository implements FinanceRepository {
  // Wallets
  async getWallets(): Promise<Wallet[]> {
    await delay();
    const data = localStorage.getItem(STORAGE_KEYS.WALLETS);
    return data ? JSON.parse(data) : [];
  }

  async saveWallets(wallets: Wallet[]): Promise<void> {
    await delay();
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(wallets));
  }

  async createWallet(input: Omit<Wallet, 'id'>): Promise<Wallet> {
    const wallets = await this.getWallets();
    const newWallet = { ...input, id: generateId() };
    wallets.push(newWallet);
    await this.saveWallets(wallets);
    return newWallet;
  }

  async updateWallet(id: string, input: Partial<Omit<Wallet, 'id'>>): Promise<Wallet> {
    const wallets = await this.getWallets();
    const index = wallets.findIndex(w => w.id === id);
    if (index === -1) throw new Error('Wallet not found');
    const updated = { ...wallets[index], ...input };
    wallets[index] = updated;
    await this.saveWallets(wallets);
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
    await delay();
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : [];
  }

  async saveCategories(categories: Category[]): Promise<void> {
    await delay();
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }

  async createCategory(input: Omit<Category, 'id'>): Promise<Category> {
    const categories = await this.getCategories();
    const newCategory = { ...input, id: generateId() };
    categories.push(newCategory);
    await this.saveCategories(categories);
    return newCategory;
  }

  async updateCategory(id: string, input: Partial<Omit<Category, 'id'>>): Promise<Category> {
    const categories = await this.getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Category not found');
    const updated = { ...categories[index], ...input };
    categories[index] = updated;
    await this.saveCategories(categories);
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    const categories = await this.getCategories();
    await this.saveCategories(categories.filter(c => c.id !== id));
  }

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    await delay();
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  }

  async saveTransactions(transactions: Transaction[]): Promise<void> {
    await delay();
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }

  async createTransaction(input: Omit<Transaction, 'id'>): Promise<Transaction> {
    const transactions = await this.getTransactions();
    const newTx = { ...input, id: generateId() };
    transactions.unshift(newTx); // Add to beginning
    await this.saveTransactions(transactions);
    return newTx;
  }

  async updateTransaction(id: string, input: Partial<Omit<Transaction, 'id'>>): Promise<Transaction> {
    const transactions = await this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Transaction not found');
    const updated = { ...transactions[index], ...input };
    transactions[index] = updated;
    await this.saveTransactions(transactions);
    return updated;
  }

  async deleteTransaction(id: string): Promise<void> {
    const transactions = await this.getTransactions();
    await this.saveTransactions(transactions.filter(t => t.id !== id));
  }

  // Budgets
  async getBudgets(): Promise<Budget[]> {
    await delay();
    const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return data ? JSON.parse(data) : [];
  }

  async saveBudgets(budgets: Budget[]): Promise<void> {
    await delay();
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }

  async createBudget(input: Omit<Budget, 'id'>): Promise<Budget> {
    const budgets = await this.getBudgets();
    const newBudget = { ...input, id: generateId() };
    budgets.push(newBudget);
    await this.saveBudgets(budgets);
    return newBudget;
  }

  async updateBudget(id: string, input: Partial<Omit<Budget, 'id'>>): Promise<Budget> {
    const budgets = await this.getBudgets();
    const index = budgets.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Budget not found');
    const updated = { ...budgets[index], ...input };
    budgets[index] = updated;
    await this.saveBudgets(budgets);
    return updated;
  }

  async deleteBudget(id: string): Promise<void> {
    const budgets = await this.getBudgets();
    await this.saveBudgets(budgets.filter(b => b.id !== id));
  }

  // Utility
  async clearAll(): Promise<void> {
    await delay();
    localStorage.removeItem(STORAGE_KEYS.WALLETS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem('onboarding_complete');
  }
}

export const repository = new LocalStorageRepository();
