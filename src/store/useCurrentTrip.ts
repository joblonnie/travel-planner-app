import { useTripStore } from './useTripStore.ts';
import { useTripsQuery } from '@/hooks/useTripQuery.ts';
import type { Trip } from '@/types/index.ts';

const EMPTY_TRIP: Trip = {
  id: '',
  tripName: '',
  startDate: '',
  endDate: '',
  days: [],
  currentDayIndex: 0,
  totalBudget: 0,
  expenses: [],
  restaurantComments: [],
  customDestinations: [],
  immigrationSchedules: [],
  interCityTransports: [],
  owners: [{ id: 'shared', name: '공용', color: 'gray' }],
  pendingCameraExpense: null,
  createdAt: '',
  updatedAt: '',
  guide: '',
};

/**
 * Selector hook for current trip data.
 * Subscribes to React Query cache (source of truth for trip data).
 * Uses Zustand only for currentTripId (UI state).
 *
 * Re-renders when:
 * - React Query cache is updated via setQueryData (optimistic mutations)
 * - currentTripId changes in Zustand
 */
export function useTripData<T>(selector: (trip: Trip) => T): T {
  const currentTripId = useTripStore((s) => s.currentTripId);

  // Subscribe to React Query cache updates — re-renders on setQueryData calls
  const { data: trips } = useTripsQuery(false);

  const trip = trips?.find((t) => t.id === currentTripId);
  return selector(trip ?? EMPTY_TRIP);
}
