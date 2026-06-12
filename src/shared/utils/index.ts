/**
 * Format an ISO date string (YYYY-MM-DD) to DD/MM/YYYY.
 */
export function formatDate(date: string): string {
  if (!date) return '';
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Format a number as a currency string ($XXX.XX).
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
