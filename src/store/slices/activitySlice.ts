import type { StateCreator } from 'zustand';
import type { ScheduledActivity, BookingInfo, MediaItem } from '@/types/index.ts';
import type { TripStore } from '../useTripStore.ts';
import { updateCurrentTrip, mapDays, mapActivities } from '../helpers.ts';

export interface ActivitySlice {
  addActivity: (dayId: string, activity: ScheduledActivity, insertAtIndex?: number) => void;
  removeActivity: (dayId: string, activityId: string) => void;
  updateActivity: (dayId: string, activityId: string, updates: Partial<ScheduledActivity>) => void;
  reorderActivities: (dayId: string, oldIndex: number, newIndex: number) => void;
  updateBooking: (dayId: string, activityId: string, booking: BookingInfo) => void;
  toggleBooked: (dayId: string, activityId: string) => void;
  toggleCompleted: (dayId: string, activityId: string) => void;
  toggleSkipped: (dayId: string, activityId: string) => void;
  addMemo: (dayId: string, activityId: string, text: string) => void;
  removeMemo: (dayId: string, activityId: string, memoIndex: number) => void;
  addMedia: (dayId: string, activityId: string, media: MediaItem) => void;
  removeMedia: (dayId: string, activityId: string, mediaId: string) => void;
  duplicateActivity: (dayId: string, activityId: string) => void;
}

export const createActivitySlice: StateCreator<TripStore, [], [], ActivitySlice> = (set) => ({
  addActivity: (dayId, activity, insertAtIndex?) =>
    set((state) => updateCurrentTrip(state, (trip) => mapDays(trip, (day) => {
      if (day.id !== dayId) return day;
      if (insertAtIndex != null && insertAtIndex >= 0 && insertAtIndex <= day.activities.length) {
        const items = [...day.activities];
        items.splice(insertAtIndex, 0, activity);
        return { ...day, activities: items };
      }
      return { ...day, activities: [...day.activities, activity] };
    }))),

  removeActivity: (dayId, activityId) =>
    set((state) => updateCurrentTrip(state, (trip) =>
      mapDays(trip, (day) =>
        day.id === dayId
          ? { ...day, activities: day.activities.filter((a) => a.id !== activityId) }
          : day
      )
    )),

  updateActivity: (dayId, activityId, updates) =>
    set((state) => updateCurrentTrip(state, (trip) =>
      mapActivities(trip, dayId, (a) => a.id === activityId ? { ...a, ...updates } : a)
    )),

  reorderActivities: (dayId, oldIndex, newIndex) =>
    set((state) => updateCurrentTrip(state, (trip) => mapDays(trip, (day) => {
      if (day.id !== dayId) return day;
      const items = [...day.activities];
      const timeSlots = items.map((a) => a.time);
      const [moved] = items.splice(oldIndex, 1);
      items.splice(newIndex, 0, moved);
      const reordered = items.map((a, i) => ({ ...a, time: timeSlots[i] }));
      return { ...day, activities: reordered };
    }))),

  updateBooking: (dayId, activityId, booking) =>
    set((state) => updateCurrentTrip(state, (trip) =>
      mapActivities(trip, dayId, (a) => a.id === activityId ? { ...a, booking, isBooked: true } : a)
    )),

  toggleBooked: (dayId, activityId) =>
    set((state) => updateCurrentTrip(state, (trip) =>
      mapActivities(trip, dayId, (a) => a.id === activityId ? { ...a, isBooked: !a.isBooked } : a)
    )),

  toggleCompleted: (dayId, activityId) =>
    set((state) => updateCurrentTrip(state, (trip) =>
      mapActivities(trip, dayId, (a) =>
        a.id === activityId ? { ...a, isCompleted: !a.isCompleted, isSkipped: false } : a
      )
    )),

  toggleSkipped: (dayId, activityId) =>
    set((state) => updateCurrentTrip(state, (trip) =>
      mapActivities(trip, dayId, (a) =>
        a.id === activityId ? { ...a, isSkipped: !a.isSkipped, isCompleted: false } : a
      )
    )),

  addMemo: (dayId, activityId, text) =>
    set((state) => updateCurrentTrip(state, (trip) =>
      mapActivities(trip, dayId, (a) =>
        a.id === activityId ? { ...a, memos: [...(a.memos || []), text] } : a
      )
    )),

  removeMemo: (dayId, activityId, memoIndex) =>
    set((state) => updateCurrentTrip(state, (trip) =>
      mapActivities(trip, dayId, (a) =>
        a.id === activityId
          ? { ...a, memos: (a.memos || []).filter((_, i) => i !== memoIndex) }
          : a
      )
    )),

  addMedia: (dayId, activityId, media) =>
    set((state) => updateCurrentTrip(state, (trip) =>
      mapActivities(trip, dayId, (a) =>
        a.id === activityId ? { ...a, media: [...(a.media || []), media] } : a
      )
    )),

  removeMedia: (dayId, activityId, mediaId) =>
    set((state) => updateCurrentTrip(state, (trip) =>
      mapActivities(trip, dayId, (a) =>
        a.id === activityId
          ? { ...a, media: (a.media || []).filter((m) => m.id !== mediaId) }
          : a
      )
    )),

  duplicateActivity: (dayId, activityId) =>
    set((state) => updateCurrentTrip(state, (trip) =>
      mapDays(trip, (day) => {
        if (day.id !== dayId) return day;
        const act = day.activities.find((a) => a.id === activityId);
        if (!act) return day;
        const newAct: ScheduledActivity = {
          ...act,
          id: crypto.randomUUID(),
          isCompleted: false,
          isSkipped: false,
          expenses: [],
          media: [],
          booking: undefined,
          isBooked: false,
        };
        const idx = day.activities.findIndex((a) => a.id === activityId);
        const items = [...day.activities];
        items.splice(idx + 1, 0, newAct);
        return { ...day, activities: items };
      })
    )),
});
