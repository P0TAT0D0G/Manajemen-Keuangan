import type { Transaction, Wallet, Category, Budget } from '../types';

export interface StorageRepository {
  // Wallets
  getWallets(): Wallet[];
  saveWallets(wallets: Wallet[]): void;
  
  // Categories
  getCategories(): Category[];
  saveCategories(categories: Category[]): void;
  
  // Transactions
  getTransactions(): Transaction[];
  saveTransactions(transactions: Transaction[]): void;
  
  // Budgets
  getBudgets(): Budget[];
  saveBudgets(budgets: Budget[]): void;
  
  // Utility
  clearAll(): void;
}
