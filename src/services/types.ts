import type { Transaction, Wallet, Category, Budget } from '../types';

export interface FinanceRepository {
  // Wallets
  getWallets(): Promise<Wallet[]>;
  createWallet(input: Omit<Wallet, 'id'>): Promise<Wallet>;
  updateWallet(id: string, input: Partial<Omit<Wallet, 'id'>>): Promise<Wallet>;
  archiveWallet(id: string): Promise<Wallet>;
  restoreWallet(id: string): Promise<Wallet>;
  saveWallets(wallets: Wallet[]): Promise<void>; // For bulk save/initialization
  
  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(input: Omit<Category, 'id'>): Promise<Category>;
  updateCategory(id: string, input: Partial<Omit<Category, 'id'>>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  saveCategories(categories: Category[]): Promise<void>;
  
  // Transactions
  getTransactions(): Promise<Transaction[]>;
  createTransaction(input: Omit<Transaction, 'id'>): Promise<Transaction>;
  updateTransaction(id: string, input: Partial<Omit<Transaction, 'id'>>): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;
  saveTransactions(transactions: Transaction[]): Promise<void>;
  
  // Budgets
  getBudgets(): Promise<Budget[]>;
  createBudget(input: Omit<Budget, 'id'>): Promise<Budget>;
  updateBudget(id: string, input: Partial<Omit<Budget, 'id'>>): Promise<Budget>;
  deleteBudget(id: string): Promise<void>;
  saveBudgets(budgets: Budget[]): Promise<void>;
  
  // Utility
  clearAll(): Promise<void>;
}
