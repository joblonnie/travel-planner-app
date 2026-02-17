import { useCallback, useMemo } from 'react';
import { useTripStore } from '@/store/useTripStore.ts';

export type Currency = 'EUR' | 'KRW' | 'USD' | 'JPY' | 'CNY';

export const CURRENCIES: Currency[] = ['EUR', 'KRW', 'USD', 'JPY', 'CNY'];

export const currencySymbols: Record<Currency, string> = {
  EUR: '€',
  KRW: '₩',
  USD: '$',
  JPY: '¥',
  CNY: '¥',
};

export const currencyLabels: Record<Currency, string> = {
  EUR: 'EUR',
  KRW: 'KRW',
  USD: 'USD',
  JPY: 'JPY',
  CNY: 'CNY',
};

// Default rates: 1 EUR = X units
const DEFAULT_RATES: Record<Currency, number> = {
  EUR: 1,
  KRW: 1450,
  USD: 1.08,
  JPY: 165,
  CNY: 7.8,
};

export function useCurrency() {
  const currency = useTripStore((s) => s.currency);
  const exchangeRate = useTripStore((s) => s.exchangeRate);
  const setCurrency = useTripStore((s) => s.setCurrency);
  const setExchangeRate = useTripStore((s) => s.setExchangeRate);
  const fetchedRates = useTripStore((s) => s.fetchedRates);

  const rates: Record<Currency, number> = useMemo(() => ({
    ...DEFAULT_RATES,
    ...(fetchedRates as Partial<Record<Currency, number>>),
  }), [fetchedRates]);

  const rate = useMemo(
    () => currency === 'EUR' ? 1 : (rates[currency] ?? exchangeRate),
    [currency, rates, exchangeRate]
  );

  const convert = useCallback(
    (amountEur: number): number => {
      if (currency === 'EUR') return amountEur;
      return Math.round(amountEur * rate);
    },
    [currency, rate]
  );

  const toEur = useCallback(
    (amountLocal: number): number => {
      if (currency === 'EUR') return amountLocal;
      return amountLocal / rate;
    },
    [currency, rate]
  );

  const format = useCallback(
    (amountEur: number): string => {
      const sym = currencySymbols[currency];
      if (currency === 'EUR') {
        const hasDecimal = amountEur % 1 !== 0;
        return `${sym}${amountEur.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: hasDecimal ? 2 : 0 })}`;
      }
      if (currency === 'USD' || currency === 'CNY') {
        const val = amountEur * rate;
        const hasDecimal = val % 1 !== 0;
        return `${sym}${val.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: hasDecimal ? 2 : 0 })}`;
      }
      // KRW, JPY — no decimals
      const converted = Math.round(amountEur * rate);
      return `${sym}${converted.toLocaleString('en')}`;
    },
    [currency, rate]
  );

  const formatWithBoth = useCallback(
    (amountEur: number): string => {
      const hasDecimal = amountEur % 1 !== 0;
      const eur = `€${amountEur.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: hasDecimal ? 2 : 0 })}`;
      if (currency === 'EUR') return eur;
      return `${format(amountEur)} (${eur})`;
    },
    [currency, format]
  );

  const symbol = useMemo(() => currencySymbols[currency], [currency]);

  const nextCurrency = useCallback(
    () => {
      const idx = CURRENCIES.indexOf(currency);
      setCurrency(CURRENCIES[(idx + 1) % CURRENCIES.length]);
    },
    [currency, setCurrency]
  );

  return {
    currency,
    exchangeRate,
    setCurrency,
    setExchangeRate,
    convert,
    toEur,
    format,
    formatWithBoth,
    symbol,
    nextCurrency,
    rate,
  };
}
