import { useCallback, useMemo } from 'react';
import { useTripStore } from '@/store/useTripStore.ts';

export type Currency = 'KRW' | 'EUR' | 'USD' | 'JPY' | 'CNY';

export const CURRENCIES: Currency[] = ['KRW', 'EUR', 'USD', 'JPY', 'CNY'];

export const currencySymbols: Record<Currency, string> = {
  KRW: '₩',
  EUR: '€',
  USD: '$',
  JPY: '¥',
  CNY: '¥',
};

export const currencyLabels: Record<Currency, string> = {
  KRW: 'KRW',
  EUR: 'EUR',
  USD: 'USD',
  JPY: 'JPY',
  CNY: 'CNY',
};

// Default rates: 1 KRW = X units
const DEFAULT_RATES: Record<Currency, number> = {
  KRW: 1,
  EUR: 0.00069,
  USD: 0.00074,
  JPY: 0.114,
  CNY: 0.0054,
};

export function useCurrency() {
  const currency = useTripStore((s) => s.currency);
  const setCurrency = useTripStore((s) => s.setCurrency);
  const fetchedRates = useTripStore((s) => s.fetchedRates);

  const rates: Record<Currency, number> = useMemo(() => ({
    ...DEFAULT_RATES,
    ...(fetchedRates as Partial<Record<Currency, number>>),
  }), [fetchedRates]);

  const rate = useMemo(
    () => currency === 'KRW' ? 1 : (rates[currency] ?? DEFAULT_RATES[currency] ?? 1),
    [currency, rates]
  );

  /** Convert a KRW amount to the current display currency */
  const convert = useCallback(
    (amountKrw: number): number => {
      if (currency === 'KRW') return amountKrw;
      const converted = amountKrw * rate;
      if (currency === 'JPY') return Math.round(converted);
      return converted;
    },
    [currency, rate]
  );

  /** Convert a display-currency amount back to KRW (base) */
  const toBase = useCallback(
    (amountLocal: number): number => {
      if (currency === 'KRW') return amountLocal;
      if (rate === 0) return amountLocal;
      return Math.round(amountLocal / rate);
    },
    [currency, rate]
  );

  /** Format a KRW amount in the current display currency */
  const format = useCallback(
    (amountKrw: number): string => {
      const sym = currencySymbols[currency];
      if (currency === 'KRW' || currency === 'JPY') {
        const converted = currency === 'KRW' ? amountKrw : Math.round(amountKrw * rate);
        return `${sym}${converted.toLocaleString('en')}`;
      }
      // EUR, USD, CNY — with decimals
      const val = amountKrw * rate;
      const hasDecimal = val % 1 !== 0;
      return `${sym}${val.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: hasDecimal ? 2 : 0 })}`;
    },
    [currency, rate]
  );

  /** Format showing display currency with KRW equivalent in parentheses */
  const formatWithBoth = useCallback(
    (amountKrw: number): string => {
      const krw = `₩${amountKrw.toLocaleString('en')}`;
      if (currency === 'KRW') return krw;
      return `${format(amountKrw)} (${krw})`;
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
    setCurrency,
    convert,
    toBase,
    format,
    formatWithBoth,
    symbol,
    nextCurrency,
    rate,
  };
}
