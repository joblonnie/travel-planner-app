import { useTripStore } from '../store/useTripStore.ts';

export type Currency = 'EUR' | 'KRW' | 'USD' | 'JPY';

export const CURRENCIES: Currency[] = ['EUR', 'KRW', 'USD', 'JPY'];

export const currencySymbols: Record<Currency, string> = {
  EUR: '€',
  KRW: '₩',
  USD: '$',
  JPY: '¥',
};

export const currencyLabels: Record<Currency, string> = {
  EUR: 'EUR',
  KRW: 'KRW',
  USD: 'USD',
  JPY: 'JPY',
};

// Default rates: 1 EUR = X units
const DEFAULT_RATES: Record<Currency, number> = {
  EUR: 1,
  KRW: 1450,
  USD: 1.08,
  JPY: 165,
};

export function useCurrency() {
  const currency = useTripStore((s) => s.currency);
  const exchangeRate = useTripStore((s) => s.exchangeRate);
  const setCurrency = useTripStore((s) => s.setCurrency);
  const setExchangeRate = useTripStore((s) => s.setExchangeRate);

  const rate = currency === 'EUR' ? 1 : (DEFAULT_RATES[currency] ?? exchangeRate);

  const convert = (amountEur: number): number => {
    if (currency === 'EUR') return amountEur;
    return Math.round(amountEur * rate);
  };

  const format = (amountEur: number): string => {
    const sym = currencySymbols[currency];
    if (currency === 'EUR') {
      const hasDecimal = amountEur % 1 !== 0;
      return `${sym}${amountEur.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: hasDecimal ? 2 : 0 })}`;
    }
    if (currency === 'USD') {
      const usd = amountEur * rate;
      const hasDecimal = usd % 1 !== 0;
      return `${sym}${usd.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: hasDecimal ? 2 : 0 })}`;
    }
    // KRW, JPY — no decimals
    const converted = Math.round(amountEur * rate);
    return `${sym}${converted.toLocaleString('en')}`;
  };

  const formatWithBoth = (amountEur: number): string => {
    const hasDecimal = amountEur % 1 !== 0;
    const eur = `€${amountEur.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: hasDecimal ? 2 : 0 })}`;
    if (currency === 'EUR') return eur;
    return `${format(amountEur)} (${eur})`;
  };

  const symbol = currencySymbols[currency];

  const nextCurrency = () => {
    const idx = CURRENCIES.indexOf(currency);
    setCurrency(CURRENCIES[(idx + 1) % CURRENCIES.length]);
  };

  return {
    currency,
    exchangeRate,
    setCurrency,
    setExchangeRate,
    convert,
    format,
    formatWithBoth,
    symbol,
    nextCurrency,
    DEFAULT_RATES,
  };
}
