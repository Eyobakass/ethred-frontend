// src/utils/currency.ts

export const formatCurrency = (
  amount: number,
  currency: 'ETB' | 'USD' = 'ETB',
  lang: 'en' | 'am' = 'en'
): string => {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  const formattedNumber = new Intl.NumberFormat(lang === 'am' ? 'am-ET' : 'en-ET', {
    maximumFractionDigits: 2,
  }).format(amount);

  return lang === 'am' ? `${formattedNumber} ብር` : `${formattedNumber} ETB`;
};
