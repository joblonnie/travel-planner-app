import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client.ts';
import type { Trip } from '@/types/index.ts';

export const TRIPS_QUERY_KEY = ['trips'] as const;

/**
 * Fetches all trips from the server.
 * Source of truth for trip data (replaces Zustand trip storage).
 */
export function useTripsQuery(enabled = true) {
  return useQuery<Trip[]>({
    queryKey: TRIPS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/api/trips');
      if (error) throw new Error(error.error);
      return (data.trips ?? []) as Trip[];
    },
    staleTime: Infinity, // We manage freshness via mutations
    enabled,
  });
}

/**
 * Get trips from the React Query cache (synchronous).
 * Returns undefined if cache is empty.
 */
export function useTripsCache(): Trip[] | undefined {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<Trip[]>(TRIPS_QUERY_KEY);
}
