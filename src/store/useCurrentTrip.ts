import { useTripStore } from './useTripStore.ts';
import type { Trip } from '../types/index.ts';

/**
 * Selector hook for current trip data.
 * Zustand v4 compares selector results with === by default,
 * so primitives and stable references won't cause unnecessary re-renders.
 *
 * For object/array results that may be reconstructed, use useShallow:
 *   import { useShallow } from 'zustand/react/shallow';
 *   const { days, tripName } = useTripStore(useShallow(s => ...));
 */
export function useTripData<T>(selector: (trip: Trip) => T): T {
  return useTripStore((s) => {
    const trip = s.trips.find((t) => t.id === s.currentTripId)!;
    return selector(trip);
  });
}
