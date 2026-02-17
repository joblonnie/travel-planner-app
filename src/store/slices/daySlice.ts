import type { StateCreator } from 'zustand';
import type { DayPlan } from '@/types/index.ts';
import type { AccommodationInfo } from '@/types/index.ts';
import type { TripStore } from '../useTripStore.ts';
import { updateCurrentTrip, mapDays } from '../helpers.ts';

export interface DaySlice {
  setCurrentDay: (index: number) => void;
  addDay: (day: DayPlan) => void;
  removeDay: (dayId: string) => void;
  updateDay: (dayId: string, updates: Partial<DayPlan>) => void;
  reorderDays: (oldIndex: number, newIndex: number) => void;
  sortDaysByDate: () => void;
  duplicateDay: (dayId: string) => void;
  goToNextDay: () => void;
  goToPrevDay: () => void;
  updateDayNotes: (dayId: string, notes: string) => void;
  updateAccommodationByDestination: (destinationId: string, accommodation: AccommodationInfo | undefined) => void;
}

export const createDaySlice: StateCreator<TripStore, [], [], DaySlice> = (set) => ({
  setCurrentDay: (index) =>
    set((state) => updateCurrentTrip(state, () => ({ currentDayIndex: index }))),

  addDay: (day) =>
    set((state) => updateCurrentTrip(state, (trip) => ({
      days: [...trip.days, day],
    }))),

  removeDay: (dayId) =>
    set((state) => updateCurrentTrip(state, (trip) => {
      const newDays = trip.days.filter((d) => d.id !== dayId).map((d, i) => ({ ...d, dayNumber: i + 1 }));
      return {
        days: newDays,
        currentDayIndex: Math.max(0, Math.min(trip.currentDayIndex, newDays.length - 1)),
      };
    })),

  updateDay: (dayId, updates) =>
    set((state) => updateCurrentTrip(state, (trip) =>
      mapDays(trip, (day) => day.id === dayId ? { ...day, ...updates } : day)
    )),

  reorderDays: (oldIndex, newIndex) =>
    set((state) => updateCurrentTrip(state, (trip) => {
      const items = [...trip.days];
      const [moved] = items.splice(oldIndex, 1);
      items.splice(newIndex, 0, moved);
      const reNumbered = items.map((d, i) => ({ ...d, dayNumber: i + 1 }));
      const currentDayId = trip.days[trip.currentDayIndex]?.id;
      const newIdx = reNumbered.findIndex((d) => d.id === currentDayId);
      return { days: reNumbered, currentDayIndex: newIdx >= 0 ? newIdx : 0 };
    })),

  sortDaysByDate: () =>
    set((state) => updateCurrentTrip(state, (trip) => {
      const currentDayId = trip.days[trip.currentDayIndex]?.id;
      const sorted = [...trip.days]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((d, i) => ({ ...d, dayNumber: i + 1 }));
      const newIndex = sorted.findIndex((d) => d.id === currentDayId);
      return { days: sorted, currentDayIndex: newIndex >= 0 ? newIndex : 0 };
    })),

  duplicateDay: (dayId) =>
    set((state) => updateCurrentTrip(state, (trip) => {
      const day = trip.days.find((d) => d.id === dayId);
      if (!day) return {};
      const newDay: DayPlan = {
        ...day,
        id: crypto.randomUUID(),
        dayNumber: trip.days.length + 1,
        activities: day.activities.map((a) => ({
          ...a,
          id: crypto.randomUUID(),
          isCompleted: false,
          isSkipped: false,
          expenses: [],
          media: [],
        })),
      };
      return { days: [...trip.days, newDay] };
    })),

  goToNextDay: () =>
    set((state) => updateCurrentTrip(state, (trip) => ({
      currentDayIndex: Math.min(trip.currentDayIndex + 1, trip.days.length - 1),
    }))),

  goToPrevDay: () =>
    set((state) => updateCurrentTrip(state, (trip) => ({
      currentDayIndex: Math.max(trip.currentDayIndex - 1, 0),
    }))),

  updateDayNotes: (dayId, notes) =>
    set((state) => updateCurrentTrip(state, (trip) =>
      mapDays(trip, (day) => day.id === dayId ? { ...day, notes } : day)
    )),

  updateAccommodationByDestination: (destinationId, accommodation) =>
    set((state) => updateCurrentTrip(state, (trip) =>
      mapDays(trip, (day) =>
        day.destinationId === destinationId ? { ...day, accommodation } : day
      )
    )),
});
