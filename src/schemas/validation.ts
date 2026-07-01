/**
 * Validation functions for all entity types.
 * Returns { valid, errors } where errors is a field→message map.
 */

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateTransaction(data: {
  type?: string;
  amount?: number;
  walletId?: string;
  toWalletId?: string;
  categoryId?: string;
  date?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.amount || data.amount <= 0) {
    errors.amount = 'Nominal harus lebih dari 0.';
  }
  if (!data.walletId) {
    errors.walletId = 'Dompet wajib dipilih.';
  }
  if (data.type === 'Transfer') {
    if (!data.toWalletId) {
      errors.toWalletId = 'Dompet tujuan wajib dipilih.';
    }
    if (data.walletId && data.toWalletId && data.walletId === data.toWalletId) {
      errors.toWalletId = 'Dompet asal dan tujuan tidak boleh sama.';
    }
  } else if (data.type !== 'Adjustment') {
    if (!data.categoryId) {
      errors.categoryId = 'Kategori wajib dipilih.';
    }
  }
  if (!data.date) {
    errors.date = 'Tanggal wajib diisi.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateWallet(data: {
  name?: string;
  openingBalance?: number;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim() === '') {
    errors.name = 'Nama dompet tidak boleh kosong.';
  }
  if (data.openingBalance === undefined || data.openingBalance === null || isNaN(data.openingBalance)) {
    errors.openingBalance = 'Saldo awal harus berupa angka valid.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateCategory(data: {
  name?: string;
  type?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim() === '') {
    errors.name = 'Nama kategori tidak boleh kosong.';
  }
  if (!data.type || !['In', 'Out'].includes(data.type)) {
    errors.type = 'Jenis kategori harus dipilih.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateBudget(data: {
  categoryId?: string;
  amount?: number;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.categoryId) {
    errors.categoryId = 'Kategori wajib dipilih.';
  }
  if (!data.amount || data.amount <= 0) {
    errors.amount = 'Anggaran harus lebih dari 0.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
