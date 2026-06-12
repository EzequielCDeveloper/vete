// Simple module-level state for cross-component filters
let _dateFilter: string | null = null;

export function setDateFilter(date: string | null) {
  _dateFilter = date;
}

export function getDateFilter(): string | null {
  return _dateFilter;
}

export function clearDateFilter() {
  _dateFilter = null;
}
