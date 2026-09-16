const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('en-US');

export const formatCurrency = (value: number): string =>
  currencyFormatter.format(value);

export const formatNumber = (value: number): string =>
  numberFormatter.format(value);

/** Compact currency for chart axes, e.g. 12.5k */
export const formatCompactCurrency = (value: number): string =>
  value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(0);
