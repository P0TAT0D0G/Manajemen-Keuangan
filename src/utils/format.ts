export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val);
};

export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 11);
};

export const getWalletLabel = (wallet?: { name: string; isArchived?: boolean }): string => {
  if (!wallet) return 'Dompet tidak ditemukan';
  return wallet.isArchived ? `${wallet.name} (Diarsipkan)` : wallet.name;
};
