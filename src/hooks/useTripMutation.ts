import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client.ts';
import { useTripStore } from '@/store/useTripStore.ts';
import { TRIPS_QUERY_KEY } from './useTripQuery.ts';
import type { Trip } from '@/types/index.ts';

const DEBOUNCE_MS = 2000;

/**
 * Centralized trip mutation hook.
 * - Accepts a (trip: Trip) => Trip updater
 * - Optimistically updates React Query cache
 * - Debounces PUT to server (2s)
 * - Rolls back on error
 */
export function useTripMutation() {
  const queryClient = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingTripIdRef = useRef<string | null>(null);

  const mutate = useCallback(
    (updater: (trip: Trip) => Trip) => {
      const currentTripId = useTripStore.getState().currentTripId;
      if (!currentTripId) return;

      // Optimistic update in React Query cache
      queryClient.setQueryData<Trip[]>(TRIPS_QUERY_KEY, (old) => {
        if (!old) return old;
        return old.map((t) =>
          t.id === currentTripId
            ? { ...updater(t), updatedAt: new Date().toISOString() }
            : t,
        );
      });

      // Debounce server PUT
      pendingTripIdRef.current = currentTripId;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const tripId = pendingTripIdRef.current;
        if (!tripId) return;

        const trips = queryClient.getQueryData<Trip[]>(TRIPS_QUERY_KEY);
        const trip = trips?.find((t) => t.id === tripId);
        if (!trip) return;

        apiClient.PUT('/api/trips/{tripId}', {
          params: { path: { tripId } },
          body: trip,
        }).catch(() => {
          // On error, refetch from server to get consistent state
          queryClient.invalidateQueries({ queryKey: TRIPS_QUERY_KEY });
        });
      }, DEBOUNCE_MS);
    },
    [queryClient],
  );

  return mutate;
}

/**
 * Mutation for trip-level operations that affect the trips list
 * (create, delete, duplicate) — these are NOT debounced.
 */
export function useTripListMutation() {
  const queryClient = useQueryClient();

  const createTrip = useCallback(
    async (trip: Omit<Trip, 'createdAt' | 'updatedAt'>) => {
      const newTrip: Trip = {
        ...trip,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Trip;

      // Optimistic
      queryClient.setQueryData<Trip[]>(TRIPS_QUERY_KEY, (old) =>
        old ? [...old, newTrip] : [newTrip],
      );

      // Set as current
      useTripStore.getState().setCurrentTripId(newTrip.id);

      // Server
      try {
        await apiClient.POST('/api/trips', { body: newTrip });
      } catch {
        queryClient.invalidateQueries({ queryKey: TRIPS_QUERY_KEY });
      }
    },
    [queryClient],
  );

  const deleteTrip = useCallback(
    async (tripId: string) => {
      const state = useTripStore.getState();

      // Optimistic
      queryClient.setQueryData<Trip[]>(TRIPS_QUERY_KEY, (old) => {
        if (!old) return old;
        const remaining = old.filter((t) => t.id !== tripId);
        // Update currentTripId if needed
        if (state.currentTripId === tripId) {
          state.setCurrentTripId(remaining[0]?.id || '');
        }
        return remaining;
      });

      // Server
      try {
        await apiClient.DELETE('/api/trips/{tripId}', {
          params: { path: { tripId } },
        });
      } catch {
        queryClient.invalidateQueries({ queryKey: TRIPS_QUERY_KEY });
      }
    },
    [queryClient],
  );

  const duplicateTrip = useCallback(
    async (tripId: string) => {
      const trips = queryClient.getQueryData<Trip[]>(TRIPS_QUERY_KEY);
      const trip = trips?.find((t) => t.id === tripId);
      if (!trip) return;

      const newId = crypto.randomUUID();
      const newTrip: Trip = {
        ...trip,
        id: newId,
        tripName: `${trip.tripName} (copy)`,
        days: trip.days.map((d) => ({
          ...d,
          id: crypto.randomUUID(),
          activities: d.activities.map((a) => ({
            ...a,
            id: crypto.randomUUID(),
            expenses: [],
            media: [],
          })),
        })),
        expenses: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistic
      queryClient.setQueryData<Trip[]>(TRIPS_QUERY_KEY, (old) =>
        old ? [...old, newTrip] : [newTrip],
      );

      // Server
      try {
        await apiClient.POST('/api/trips', { body: newTrip });
      } catch {
        queryClient.invalidateQueries({ queryKey: TRIPS_QUERY_KEY });
      }
    },
    [queryClient],
  );

  const importTripData = useCallback(
    (jsonStr: string): boolean => {
      try {
        const data = JSON.parse(jsonStr);
        const ts = new Date().toISOString();

        if (data.version >= 5 && data.trips && Array.isArray(data.trips)) {
          const importedTrips = data.trips.map((t: Trip) => ({
            ...t,
            id: crypto.randomUUID(),
            updatedAt: ts,
          }));
          queryClient.setQueryData<Trip[]>(TRIPS_QUERY_KEY, (old) =>
            old ? [...old, ...importedTrips] : importedTrips,
          );
          if (importedTrips[0]) {
            useTripStore.getState().setCurrentTripId(importedTrips[0].id);
          }
          // Sync each to server
          for (const trip of importedTrips) {
            apiClient.POST('/api/trips', { body: trip }).catch(() => {});
          }
          return true;
        }

        if (!data.days || !Array.isArray(data.days)) return false;
        const newTripId = crypto.randomUUID();
        const newTrip: Trip = {
          id: newTripId,
          tripName: data.tripName ?? '가져온 여행',
          startDate: data.startDate ?? '',
          endDate: data.endDate ?? '',
          days: data.days,
          currentDayIndex: 0,
          totalBudget: data.totalBudget ?? 5000,
          expenses: data.expenses ?? [],
          restaurantComments: data.restaurantComments ?? [],
          customDestinations: data.customDestinations ?? [],
          immigrationSchedules: data.immigrationSchedules ?? [],
          interCityTransports: data.interCityTransports ?? [],
          owners: data.owners ?? [{ id: 'shared', name: '공용', color: 'gray' }],
          pendingCameraExpense: null,
          guide: data.guide ?? '',
          createdAt: ts,
          updatedAt: ts,
        };
        queryClient.setQueryData<Trip[]>(TRIPS_QUERY_KEY, (old) =>
          old ? [...old, newTrip] : [newTrip],
        );
        useTripStore.getState().setCurrentTripId(newTripId);
        apiClient.POST('/api/trips', { body: newTrip }).catch(() => {});
        return true;
      } catch {
        return false;
      }
    },
    [queryClient],
  );

  return { createTrip, deleteTrip, duplicateTrip, importTripData };
}
