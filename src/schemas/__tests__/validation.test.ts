import { describe, it, expect } from 'vitest';
import { validateTransaction, validateWallet } from '../validation';

describe('validation schemas', () => {
  describe('validateTransaction', () => {
    it('validates a correct In transaction', () => {
      const result = validateTransaction({
        type: 'In',
        amount: 50000,
        walletId: 'w1',
        categoryId: 'c1',
        date: '2024-03-15'
      });
      expect(result.valid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('requires amount to be greater than 0', () => {
      const result = validateTransaction({ type: 'In', amount: 0, walletId: 'w1', categoryId: 'c1', date: '2024-03-15' });
      expect(result.valid).toBe(false);
      expect(result.errors.amount).toBeDefined();
    });

    it('requires wallet destination for Transfer', () => {
      const result = validateTransaction({ type: 'Transfer', amount: 50000, walletId: 'w1', date: '2024-03-15' });
      expect(result.valid).toBe(false);
      expect(result.errors.toWalletId).toBeDefined();
    });

    it('prevents Transfer to the same wallet', () => {
      const result = validateTransaction({ type: 'Transfer', amount: 50000, walletId: 'w1', toWalletId: 'w1', date: '2024-03-15' });
      expect(result.valid).toBe(false);
      expect(result.errors.toWalletId).toBeDefined();
    });
  });

  describe('validateWallet', () => {
    it('validates a correct wallet', () => {
      const result = validateWallet({ name: 'Dompet', openingBalance: 1000 });
      expect(result.valid).toBe(true);
    });

    it('requires name', () => {
      const result = validateWallet({ name: '   ', openingBalance: 1000 });
      expect(result.valid).toBe(false);
      expect(result.errors.name).toBeDefined();
    });
  });
});
