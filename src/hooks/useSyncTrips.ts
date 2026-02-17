import { useEffect, useRef, useCallback } from 'react';
import { useTripStore } from '@/store/useTripStore.ts';
import { useSaveTrip } from './useTrips.ts';

const DEBOUNCE_MS = 500;

/**
 * Syncs Zustand trip store changes to the server.
 * - Watches current trip for changes and debounces PUT requests
 * - Only active when user is authenticated
 * - localStorage persist remains as offline cache
 */
export function useSyncTrips() {
  const saveTrip = useSaveTrip();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAuthenticated = useTripStore((s) => s.isAuthenticated);

  const currentTripId = useTripStore((s) => s.currentTripId);
  const trips = useTripStore((s) => s.trips);

  const syncToServer = useCallback(() => {
    if (!isAuthenticated || !currentTripId) return;
    const trip = trips.find((t) => t.id === currentTripId);
    if (!trip) return;

    saveTrip.mutate({ tripId: currentTripId, trip });
  }, [isAuthenticated, currentTripId, trips, saveTrip]);

  // Debounced sync on trip data changes
  useEffect(() => {
    if (!isAuthenticated || !currentTripId) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(syncToServer, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [trips, currentTripId, isAuthenticated, syncToServer]);
}
