import { useEffect, useRef, useCallback } from 'react';
import { useTripStore } from '@/store/useTripStore.ts';
import { useSaveTrip } from './useTrips.ts';
import { apiClient } from '@/api/client.ts';

const DEBOUNCE_MS = 500;

/**
 * Syncs Zustand trip store with the server.
 * - Fetches trips from server on login
 * - Watches current trip for changes and debounces PUT requests
 * - Only active when user is authenticated
 */
export function useSyncTrips() {
  const saveTrip = useSaveTrip();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedRef = useRef(false);
  const isAuthenticated = useTripStore((s) => s.isAuthenticated);
  const setTrips = useTripStore((s) => s.setTrips);
  const setTripsLoaded = useTripStore((s) => s.setTripsLoaded);

  const currentTripId = useTripStore((s) => s.currentTripId);
  const trips = useTripStore((s) => s.trips);

  // Fetch trips from server on login
  useEffect(() => {
    if (!isAuthenticated || loadedRef.current) return;
    loadedRef.current = true;

    apiClient.GET('/api/trips').then(({ data }) => {
      if (data?.trips) {
        setTrips(data.trips as typeof trips);
      }
    }).catch(() => {
      // Server fetch failed — trips stay empty
    }).finally(() => {
      setTripsLoaded(true);
    });
  }, [isAuthenticated, setTrips, setTripsLoaded]);

  const syncToServer = useCallback(() => {
    if (!isAuthenticated || !currentTripId) return;
    const trip = trips.find((t) => t.id === currentTripId);
    if (!trip) return;

    saveTrip.mutate({ tripId: currentTripId, trip });
  }, [isAuthenticated, currentTripId, trips, saveTrip]);

  // Debounced sync on trip data changes
  useEffect(() => {
    if (!isAuthenticated || !currentTripId || !loadedRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(syncToServer, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [trips, currentTripId, isAuthenticated, syncToServer]);
}
