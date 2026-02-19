import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTripStore } from '@/store/useTripStore.ts';
import { apiClient } from '@/api/client.ts';

const FALLBACK_URL = 'https://api.frankfurter.dev/v1/latest?base=KRW&symbols=EUR,USD,JPY,CNY';

async function fetchRates(): Promise<{ rates: Record<string, number> }> {
  // Try our proxy first, fallback to direct API (for local dev without backend)
  try {
    const { data, error } = await apiClient.GET('/api/exchange-rates');
    if (!error && data) return data;
  } catch {
    // proxy unavailable (local dev)
  }
  const res = await fetch(FALLBACK_URL);
  if (!res.ok) throw new Error('Failed to fetch rates');
  return res.json();
}

export function useExchangeRates() {
  const setFetchedRates = useTripStore((s) => s.setFetchedRates);

  const query = useQuery({
    queryKey: ['exchange-rates'],
    queryFn: fetchRates,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: Infinity,
    retry: 1,
  });

  // Sync fetched rates into Zustand for useCurrency compatibility
  useEffect(() => {
    if (query.data?.rates) {
      setFetchedRates(query.data.rates);
    }
  }, [query.data, setFetchedRates]);

  return { refreshRates: () => query.refetch() };
}
