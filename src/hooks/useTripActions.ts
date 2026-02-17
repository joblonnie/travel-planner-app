import { useMemo } from 'react';
import { useTripMutation, useTripListMutation } from './useTripMutation.ts';
import * as actions from '@/store/tripActions.ts';
import type {
  DayPlan, ScheduledActivity, BookingInfo, MediaItem,
  ActivityExpense, ExpenseOwnerConfig, TripExpense, TripRestaurantComment,
  FlightInfo, ImmigrationSchedule, InterCityTransport,
  AccommodationInfo, Destination,
} from '@/types/index.ts';

/**
 * Bridge hook: provides the same action API as the old Zustand slices,
 * backed by React Query optimistic mutations.
 *
 * Usage:
 *   const { addActivity, toggleCompleted, ... } = useTripActions();
 */
export function useTripActions() {
  const mutate = useTripMutation();
  const { createTrip, deleteTrip, duplicateTrip, importTripData } = useTripListMutation();

  return useMemo(() => ({
    // ── Day Actions ──
    setCurrentDay: (index: number) => mutate(actions.setCurrentDay(index)),
    addDay: (day: DayPlan) => mutate(actions.addDay(day)),
    removeDay: (dayId: string) => mutate(actions.removeDay(dayId)),
    updateDay: (dayId: string, updates: Partial<DayPlan>) => mutate(actions.updateDay(dayId, updates)),
    reorderDays: (oldIndex: number, newIndex: number) => mutate(actions.reorderDays(oldIndex, newIndex)),
    sortDaysByDate: () => mutate(actions.sortDaysByDate()),
    duplicateDay: (dayId: string) => mutate(actions.duplicateDay(dayId)),
    goToNextDay: () => mutate(actions.goToNextDay()),
    goToPrevDay: () => mutate(actions.goToPrevDay()),
    updateDayNotes: (dayId: string, notes: string) => mutate(actions.updateDayNotes(dayId, notes)),
    updateAccommodationByDestination: (destId: string, accom: AccommodationInfo | undefined) =>
      mutate(actions.updateAccommodationByDestination(destId, accom)),

    // ── Activity Actions ──
    addActivity: (dayId: string, activity: ScheduledActivity, insertAtIndex?: number) =>
      mutate(actions.addActivity(dayId, activity, insertAtIndex)),
    removeActivity: (dayId: string, activityId: string) => mutate(actions.removeActivity(dayId, activityId)),
    updateActivity: (dayId: string, activityId: string, updates: Partial<ScheduledActivity>) =>
      mutate(actions.updateActivity(dayId, activityId, updates)),
    reorderActivities: (dayId: string, oldIndex: number, newIndex: number) =>
      mutate(actions.reorderActivities(dayId, oldIndex, newIndex)),
    updateBooking: (dayId: string, activityId: string, booking: BookingInfo) =>
      mutate(actions.updateBooking(dayId, activityId, booking)),
    toggleBooked: (dayId: string, activityId: string) => mutate(actions.toggleBooked(dayId, activityId)),
    toggleCompleted: (dayId: string, activityId: string) => mutate(actions.toggleCompleted(dayId, activityId)),
    toggleSkipped: (dayId: string, activityId: string) => mutate(actions.toggleSkipped(dayId, activityId)),
    addMemo: (dayId: string, activityId: string, text: string) => mutate(actions.addMemo(dayId, activityId, text)),
    removeMemo: (dayId: string, activityId: string, memoIndex: number) =>
      mutate(actions.removeMemo(dayId, activityId, memoIndex)),
    addMedia: (dayId: string, activityId: string, media: MediaItem) =>
      mutate(actions.addMedia(dayId, activityId, media)),
    removeMedia: (dayId: string, activityId: string, mediaId: string) =>
      mutate(actions.removeMedia(dayId, activityId, mediaId)),
    duplicateActivity: (dayId: string, activityId: string) =>
      mutate(actions.duplicateActivity(dayId, activityId)),

    // ── Expense Actions ──
    addExpense: (expense: TripExpense) => mutate(actions.addExpense(expense)),
    removeExpense: (id: string) => mutate(actions.removeExpense(id)),
    addActivityExpense: (dayId: string, activityId: string, expense: ActivityExpense) =>
      mutate(actions.addActivityExpense(dayId, activityId, expense)),
    updateActivityExpense: (dayId: string, activityId: string, expenseId: string, updates: Partial<ActivityExpense>) =>
      mutate(actions.updateActivityExpense(dayId, activityId, expenseId, updates)),
    removeActivityExpense: (dayId: string, activityId: string, expenseId: string) =>
      mutate(actions.removeActivityExpense(dayId, activityId, expenseId)),
    addOwner: (owner: ExpenseOwnerConfig) => mutate(actions.addOwner(owner)),
    removeOwner: (ownerId: string) => mutate(actions.removeOwner(ownerId)),
    updateOwner: (ownerId: string, updates: Partial<Omit<ExpenseOwnerConfig, 'id'>>) =>
      mutate(actions.updateOwner(ownerId, updates)),
    setPendingCameraExpense: (pending: { amount: number; currency: string } | null) =>
      mutate(actions.setPendingCameraExpense(pending)),

    // ── Transport Actions ──
    addFlight: (dayId: string, flight: FlightInfo) => mutate(actions.addFlight(dayId, flight)),
    removeFlight: (dayId: string, flightId: string) => mutate(actions.removeFlight(dayId, flightId)),
    updateFlight: (dayId: string, flightId: string, updates: Partial<FlightInfo>) =>
      mutate(actions.updateFlight(dayId, flightId, updates)),
    addImmigrationSchedule: (schedule: ImmigrationSchedule) => mutate(actions.addImmigrationSchedule(schedule)),
    updateImmigrationSchedule: (id: string, updates: Partial<ImmigrationSchedule>) =>
      mutate(actions.updateImmigrationSchedule(id, updates)),
    removeImmigrationSchedule: (id: string) => mutate(actions.removeImmigrationSchedule(id)),
    addInterCityTransport: (transport: InterCityTransport) => mutate(actions.addInterCityTransport(transport)),
    updateInterCityTransport: (id: string, updates: Partial<InterCityTransport>) =>
      mutate(actions.updateInterCityTransport(id, updates)),
    removeInterCityTransport: (id: string) => mutate(actions.removeInterCityTransport(id)),

    // ── Destination Actions ──
    addCustomDestination: (dest: Destination) => mutate(actions.addCustomDestination(dest)),
    addRestaurantComment: (comment: TripRestaurantComment) => mutate(actions.addRestaurantComment(comment)),
    removeRestaurantComment: (commentId: string) => mutate(actions.removeRestaurantComment(commentId)),
    setTripName: (name: string) => mutate(actions.setTripName(name)),
    setStartDate: (date: string) => mutate(actions.setStartDate(date)),
    setEndDate: (date: string) => mutate(actions.setEndDate(date)),
    setTotalBudget: (budget: number) => mutate(actions.setTotalBudget(budget)),
    setTripEmoji: (emoji: string) => mutate(actions.setTripEmoji(emoji)),

    // ── Trip-Level Actions (not debounced) ──
    createTrip,
    deleteTrip,
    duplicateTrip,
    importTripData,
  }), [mutate, createTrip, deleteTrip, duplicateTrip, importTripData]);
}
