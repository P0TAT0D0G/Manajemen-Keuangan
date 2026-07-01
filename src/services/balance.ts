import type { Transaction, Wallet } from '../types';

/**
 * Compute the current balance of a wallet from its opening balance
 * and all related transactions. This is the single source of truth
 * for wallet balance — never store a mutable "balance" field.
 */
export function computeWalletBalance(
  wallet: Wallet,
  transactions: Transaction[]
): number {
  let balance = wallet.openingBalance;

  for (const tx of transactions) {
    if (tx.type === 'In' || tx.type === 'Adjustment') {
      if (tx.walletId === wallet.id) {
        balance += tx.amount;
      }
    } else if (tx.type === 'Out') {
      if (tx.walletId === wallet.id) {
        balance -= tx.amount;
      }
    } else if (tx.type === 'Transfer') {
      if (tx.walletId === wallet.id) {
        balance -= tx.amount;
      }
      if (tx.toWalletId === wallet.id) {
        balance += tx.amount;
      }
    }
  }

  return balance;
}

/**
 * Compute the total balance across all active (non-archived) wallets.
 */
export function computeTotalBalance(
  wallets: Wallet[],
  transactions: Transaction[]
): number {
  return wallets
    .filter(w => !w.isArchived)
    .reduce((sum, w) => sum + computeWalletBalance(w, transactions), 0);
}

/**
 * Calculate the adjustment amount needed to set a wallet to a desired balance.
 * Returns positive for adding money, negative for removing.
 */
export function calculateAdjustment(
  wallet: Wallet,
  transactions: Transaction[],
  desiredBalance: number
): number {
  const currentBalance = computeWalletBalance(wallet, transactions);
  return desiredBalance - currentBalance;
}
