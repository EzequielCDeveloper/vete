/**
 * Extract YYYY-MM-DD from any date string (ISO, timestamp, etc.).
 * e.g. "2026-06-12T00:00:00.000Z" → "2026-06-12"
 */
export function sanitizeDate(date: string): string {
  if (!date) return '';
  return date.split('T')[0].split(' ')[0];
}

/**
 * Format an ISO date string (YYYY-MM-DD) to DD/MM/YYYY.
 */
export function formatDate(date: string): string {
  if (!date) return '';
  const cleaned = sanitizeDate(date);
  const [year, month, day] = cleaned.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Format a number as a currency string ($XXX.XX).
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
