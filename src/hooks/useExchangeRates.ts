import { useEffect, useCallback } from 'react';
import { useTripStore } from '../store/useTripStore.ts';

const API_URL = 'https://api.frankfurter.dev/v1/latest?base=EUR&symbols=KRW,USD,JPY,CNY';
const STALE_MS = 24 * 60 * 60 * 1000; // 24 hours

export function useExchangeRates() {
  const setFetchedRates = useTripStore((s) => s.setFetchedRates);
  const setExchangeRate = useTripStore((s) => s.setExchangeRate);
  const ratesUpdatedAt = useTripStore((s) => s.ratesUpdatedAt);

  const refreshRates = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) return;
      const data = await res.json();
      if (data.rates) {
        setFetchedRates(data.rates);
        // Sync store.exchangeRate with fetched KRW rate
        if (data.rates.KRW) {
          setExchangeRate(data.rates.KRW);
        }
      }
    } catch {
      // Offline or network error — keep existing values
    }
  }, [setFetchedRates, setExchangeRate]);

  useEffect(() => {
    if (ratesUpdatedAt) {
      const age = Date.now() - new Date(ratesUpdatedAt).getTime();
      if (age < STALE_MS) return;
    }
    refreshRates();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { refreshRates };
}
