import type { Trip, DayPlan, ScheduledActivity } from '@/types/index.ts';

export interface TripStoreBase {
  trips: Trip[];
  currentTripId: string;
}

/** Get current trip from state */
export function currentTrip(state: TripStoreBase): Trip {
  return state.trips.find((t) => t.id === state.currentTripId)!;
}

/** Update current trip immutably */
export function updateCurrentTrip(
  state: TripStoreBase,
  updater: (trip: Trip) => Partial<Trip>,
): Partial<TripStoreBase> {
  return {
    trips: state.trips.map((t) =>
      t.id === state.currentTripId
        ? { ...t, ...updater(t), updatedAt: new Date().toISOString() }
        : t
    ),
  };
}

/** Map days of a trip */
export function mapDays(trip: Trip, fn: (day: DayPlan) => DayPlan): Partial<Trip> {
  return { days: trip.days.map(fn) };
}

/** Map activities within a specific day */
export function mapActivities(
  trip: Trip,
  dayId: string,
  fn: (activity: ScheduledActivity) => ScheduledActivity,
): Partial<Trip> {
  return mapDays(trip, (day) =>
    day.id === dayId ? { ...day, activities: day.activities.map(fn) } : day,
  );
}
