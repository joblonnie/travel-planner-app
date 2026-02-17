import type { StateCreator } from 'zustand';
import type { Trip, DayPlan, ExpenseOwnerConfig, Destination, ImmigrationSchedule, InterCityTransport } from '@/types/index.ts';
import type { TripStore } from '../useTripStore.ts';
import type { TripExpense, TripRestaurantComment } from '@/types/index.ts';

export interface TripSlice {
  trips: Trip[];
  currentTripId: string;

  setTrips: (trips: Trip[], currentId?: string) => void;
  createTrip: (trip: Omit<Trip, 'createdAt' | 'updatedAt'>) => void;
  deleteTrip: (tripId: string) => void;
  switchTrip: (tripId: string) => void;
  duplicateTrip: (tripId: string) => void;
  importTripData: (jsonStr: string) => boolean;
}

export const createTripSlice: StateCreator<TripStore, [], [], TripSlice> = (set) => ({
  trips: [],
  currentTripId: '',

  setTrips: (trips, currentId) =>
    set({
      trips,
      currentTripId: currentId || trips[0]?.id || '',
    }),

  createTrip: (trip) =>
    set((state) => {
      const newTrip: Trip = {
        ...trip,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return {
        trips: [...state.trips, newTrip],
        currentTripId: newTrip.id,
      };
    }),

  deleteTrip: (tripId) =>
    set((state) => {
      const remaining = state.trips.filter((t) => t.id !== tripId);
      const newCurrentId = state.currentTripId === tripId
        ? (remaining[0]?.id || '')
        : state.currentTripId;
      return { trips: remaining, currentTripId: newCurrentId };
    }),

  switchTrip: (tripId) =>
    set({ currentTripId: tripId }),

  duplicateTrip: (tripId) =>
    set((state) => {
      const trip = state.trips.find((t) => t.id === tripId);
      if (!trip) return state;
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
      return { trips: [...state.trips, newTrip] };
    }),

  importTripData: (jsonStr) => {
    try {
      const data = JSON.parse(jsonStr);

      if (data.version >= 5 && data.trips && Array.isArray(data.trips)) {
        const importedTrips = data.trips.map((t: Trip) => ({
          ...t,
          id: crypto.randomUUID(),
          updatedAt: new Date().toISOString(),
        }));
        set((state) => ({
          trips: [...state.trips, ...importedTrips],
          currentTripId: importedTrips[0]?.id ?? state.currentTripId,
        }));
        return true;
      }

      if (!data.days || !Array.isArray(data.days)) return false;
      const newTripId = crypto.randomUUID();
      const ts = new Date().toISOString();
      const newTrip: Trip = {
        id: newTripId,
        tripName: data.tripName ?? '가져온 여행',
        startDate: data.startDate ?? '',
        endDate: data.endDate ?? '',
        days: data.days as DayPlan[],
        currentDayIndex: 0,
        totalBudget: data.totalBudget ?? 5000,
        expenses: (data.expenses ?? []) as TripExpense[],
        restaurantComments: (data.restaurantComments ?? []) as TripRestaurantComment[],
        customDestinations: (data.customDestinations ?? []) as Destination[],
        immigrationSchedules: (data.immigrationSchedules ?? []) as ImmigrationSchedule[],
        interCityTransports: (data.interCityTransports ?? []) as InterCityTransport[],
        owners: (data.owners as ExpenseOwnerConfig[]) ?? [{ id: 'shared', name: '공용', color: 'gray' }],
        pendingCameraExpense: null,
        createdAt: ts,
        updatedAt: ts,
      };
      set((state) => ({
        trips: [...state.trips, newTrip],
        currentTripId: newTripId,
      }));
      return true;
    } catch {
      return false;
    }
  },
});
