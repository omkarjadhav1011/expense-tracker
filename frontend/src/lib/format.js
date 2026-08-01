const CURRENCY_SYMBOL = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'CA$',
  AUD: 'A$',
};

const CURRENCY_LOCALE = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  JPY: 'ja-JP',
  CAD: 'en-CA',
  AUD: 'en-AU',
};

export const currencySymbol = (currency = 'INR') =>
  CURRENCY_SYMBOL[currency] || `${currency} `;

// Rounded, grouped money — the redesign never shows decimals in summary UI.
export const formatMoney = (amount, currency = 'INR') => {
  const value = Number(amount) || 0;
  const formatted = new Intl.NumberFormat(CURRENCY_LOCALE[currency] || 'en-IN', {
    maximumFractionDigits: 0,
  }).format(Math.round(Math.abs(value)));
  return `${value < 0 ? '-' : ''}${currencySymbol(currency)}${formatted}`;
};

export const formatSigned = (amount, type, currency = 'INR') =>
  `${type === 'INCOME' ? '+' : '−'}${formatMoney(amount, currency)}`;

// "2026-07-31" -> "31 Jul 26"
export const formatShortDate = (iso) => {
  if (!iso) return '';
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  });
};

// "2026-07" -> "Jul 2026"
export const formatMonthLabel = (monthKey) => {
  if (!monthKey) return '';
  const [year, month] = monthKey.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  if (Number.isNaN(date.getTime())) return monthKey;
  return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
};

// "2026-07" -> "Jul"
export const formatMonthShort = (monthKey) => formatMonthLabel(monthKey).split(' ')[0];

export const toIsoDate = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const toMonthKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

// The budget endpoints take month and year as separate integers rather than a
// "YYYY-MM" key, so screens need both forms of the same month.
export const toMonthParts = (date = new Date()) => ({
  month: date.getMonth() + 1,
  year: date.getFullYear(),
});

export const initials = (name) => {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
};
