export type TransactionType = 'In' | 'Out' | 'Transfer' | 'Adjustment';
export type CategoryType = 'In' | 'Out';

export interface Wallet {
  id: string;
  name: string;
  type: string;
  openingBalance: number;
  isArchived?: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: 'In' | 'Out';
  icon: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  toWalletId?: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO string
  notes: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  month: number; // 1-12
  year: number;
}
