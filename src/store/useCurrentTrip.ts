import { useTripStore } from './useTripStore.ts';
import type { Trip } from '../types/index.ts';

export function useTripData<T>(selector: (trip: Trip) => T): T {
  return useTripStore((s) => {
    const trip = s.trips.find((t) => t.id === s.currentTripId)!;
    return selector(trip);
  });
}
