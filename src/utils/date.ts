/**
 * Date utilities for consistent month/year filtering across the app.
 */

/**
 * Check if a date string falls within a specific month and year.
 */
export function isSameMonth(dateStr: string, month: number, year: number): boolean {
  const d = new Date(dateStr);
  return (d.getMonth() + 1) === month && d.getFullYear() === year;
}

/**
 * Check if a date string falls within a date range (inclusive).
 */
export function isInDateRange(dateStr: string, startDate: string, endDate: string): boolean {
  const d = dateStr.substring(0, 10);
  return d >= startDate && d <= endDate;
}

/**
 * Get the first day of the current month as YYYY-MM-DD.
 */
export function getMonthStart(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

/**
 * Get today as YYYY-MM-DD.
 */
export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}
