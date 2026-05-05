const zarFormatter = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  minimumFractionDigits: 2,
});

/** Format an amount in cents as a ZAR currency string, e.g. 125000 → "R 1 250,00". */
export function formatMoney(cents: number): string {
  return zarFormatter.format(cents / 100);
}

/** Format an amount in cents as a compact string for tight UI space, e.g. 125000 → "R 1 250". */
export function formatMoneyCompact(cents: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
