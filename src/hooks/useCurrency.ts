import { useTripStore } from '../store/useTripStore.ts';

export type Currency = 'EUR' | 'KRW';

const DEFAULT_EUR_TO_KRW = 1450;

export function useCurrency() {
  const currency = useTripStore((s) => s.currency);
  const exchangeRate = useTripStore((s) => s.exchangeRate);
  const setCurrency = useTripStore((s) => s.setCurrency);
  const setExchangeRate = useTripStore((s) => s.setExchangeRate);

  const convert = (amountEur: number): number => {
    if (currency === 'EUR') return amountEur;
    return Math.round(amountEur * exchangeRate);
  };

  const format = (amountEur: number): string => {
    if (currency === 'EUR') {
      const hasDecimal = amountEur % 1 !== 0;
      return `€${amountEur.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: hasDecimal ? 2 : 0 })}`;
    }
    const krw = Math.round(amountEur * exchangeRate);
    return `₩${krw.toLocaleString('ko-KR')}`;
  };

  const formatWithBoth = (amountEur: number): string => {
    const hasDecimal = amountEur % 1 !== 0;
    const eur = `€${amountEur.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: hasDecimal ? 2 : 0 })}`;
    if (currency === 'EUR') return eur;
    const krw = Math.round(amountEur * exchangeRate);
    return `₩${krw.toLocaleString('ko-KR')} (${eur})`;
  };

  const symbol = currency === 'EUR' ? '€' : '₩';

  return {
    currency,
    exchangeRate,
    setCurrency,
    setExchangeRate,
    convert,
    format,
    formatWithBoth,
    symbol,
    DEFAULT_EUR_TO_KRW,
  };
}
