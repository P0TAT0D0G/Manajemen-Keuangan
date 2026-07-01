import type { StorageRepository } from './types';
import type { Transaction, Wallet, Category, Budget } from '../types';

const STORAGE_KEYS = {
  WALLETS: 'finance_wallets',
  TRANSACTIONS: 'finance_transactions',
  CATEGORIES: 'finance_categories',
  BUDGETS: 'finance_budgets'
};

export class LocalStorageRepository implements StorageRepository {
  getWallets(): Wallet[] {
    const data = localStorage.getItem(STORAGE_KEYS.WALLETS);
    return data ? JSON.parse(data) : [];
  }

  saveWallets(wallets: Wallet[]): void {
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(wallets));
  }

  getCategories(): Category[] {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : [];
  }

  saveCategories(categories: Category[]): void {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }

  getTransactions(): Transaction[] {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  }

  saveTransactions(transactions: Transaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }

  getBudgets(): Budget[] {
    const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return data ? JSON.parse(data) : [];
  }

  saveBudgets(budgets: Budget[]): void {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }

  clearAll(): void {
    localStorage.removeItem(STORAGE_KEYS.WALLETS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem('onboarding_complete');
  }
}

export const repository = new LocalStorageRepository();
