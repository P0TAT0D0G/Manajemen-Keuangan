import { describe, it, expect } from 'vitest';
import { computeWalletBalance, calculateAdjustment } from '../balance';
import type { Wallet, Transaction } from '../../types';

describe('balance service', () => {
  const wallet: Wallet = { id: 'w1', name: 'Dompet', type: 'Cash', openingBalance: 1000 };

  it('computes balance with no transactions', () => {
    expect(computeWalletBalance(wallet, [])).toBe(1000);
  });

  it('adds In transactions to balance', () => {
    const txs: Transaction[] = [
      { id: '1', walletId: 'w1', categoryId: 'c1', type: 'In', amount: 500, date: '', notes: '' }
    ];
    expect(computeWalletBalance(wallet, txs)).toBe(1500);
  });

  it('subtracts Out transactions from balance', () => {
    const txs: Transaction[] = [
      { id: '1', walletId: 'w1', categoryId: 'c1', type: 'Out', amount: 300, date: '', notes: '' }
    ];
    expect(computeWalletBalance(wallet, txs)).toBe(700);
  });

  it('handles Transfer transactions correctly', () => {
    const wallet2: Wallet = { id: 'w2', name: 'Bank', type: 'Bank', openingBalance: 500 };
    const txs: Transaction[] = [
      { id: '1', walletId: 'w1', toWalletId: 'w2', categoryId: '', type: 'Transfer', amount: 200, date: '', notes: '' }
    ];
    // w1 sent money, balance decreases
    expect(computeWalletBalance(wallet, txs)).toBe(800);
    // w2 received money, balance increases
    expect(computeWalletBalance(wallet2, txs)).toBe(700);
  });

  it('handles Adjustment transactions correctly', () => {
    // positive adjustment
    const txs1: Transaction[] = [
      { id: '1', walletId: 'w1', categoryId: 'adj', type: 'Adjustment', amount: 500, date: '', notes: '' }
    ];
    expect(computeWalletBalance(wallet, txs1)).toBe(1500);

    // negative adjustment
    const txs2: Transaction[] = [
      { id: '2', walletId: 'w1', categoryId: 'adj', type: 'Adjustment', amount: -200, date: '', notes: '' }
    ];
    expect(computeWalletBalance(wallet, txs2)).toBe(800);
  });

  it('ignores transactions for other wallets', () => {
    const txs: Transaction[] = [
      { id: '1', walletId: 'w3', categoryId: 'c1', type: 'In', amount: 500, date: '', notes: '' }
    ];
    expect(computeWalletBalance(wallet, txs)).toBe(1000);
  });

  describe('calculateAdjustment', () => {
    it('returns positive difference if desired balance is higher', () => {
      expect(calculateAdjustment(wallet, [], 1500)).toBe(500);
    });

    it('returns negative difference if desired balance is lower', () => {
      expect(calculateAdjustment(wallet, [], 800)).toBe(-200);
    });

    it('returns 0 if desired balance equals current balance', () => {
      expect(calculateAdjustment(wallet, [], 1000)).toBe(0);
    });
  });
});
