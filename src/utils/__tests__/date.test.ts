import { describe, it, expect } from 'vitest';
import { isSameMonth, isInDateRange } from '../date';

describe('date utils', () => {
  describe('isSameMonth', () => {
    it('returns true if date matches month and year', () => {
      expect(isSameMonth('2024-03-15T10:00:00Z', 3, 2024)).toBe(true);
    });

    it('returns false if month differs', () => {
      expect(isSameMonth('2024-04-15T10:00:00Z', 3, 2024)).toBe(false);
    });

    it('returns false if year differs', () => {
      expect(isSameMonth('2023-03-15T10:00:00Z', 3, 2024)).toBe(false);
    });
  });

  describe('isInDateRange', () => {
    it('returns true if date is within range', () => {
      expect(isInDateRange('2024-03-15T10:00:00Z', '2024-03-01', '2024-03-31')).toBe(true);
    });

    it('returns true if date is exactly start or end date', () => {
      expect(isInDateRange('2024-03-01T00:00:00Z', '2024-03-01', '2024-03-31')).toBe(true);
      expect(isInDateRange('2024-03-31T23:59:59Z', '2024-03-01', '2024-03-31')).toBe(true);
    });

    it('returns false if date is outside range', () => {
      expect(isInDateRange('2024-02-28T10:00:00Z', '2024-03-01', '2024-03-31')).toBe(false);
      expect(isInDateRange('2024-04-01T10:00:00Z', '2024-03-01', '2024-03-31')).toBe(false);
    });
  });
});
