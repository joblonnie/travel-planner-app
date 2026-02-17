import type { StateCreator } from 'zustand';
import type { ActivityExpense, ExpenseOwner, ExpenseOwnerConfig, TripExpense } from '@/types/index.ts';
import type { TripStore } from '../useTripStore.ts';
import { currentTrip, updateCurrentTrip, mapActivities } from '../helpers.ts';

export type Expense = TripExpense;

export interface ExpenseSlice {
  addExpense: (expense: TripExpense) => void;
  removeExpense: (id: string) => void;
  addActivityExpense: (dayId: string, activityId: string, expense: ActivityExpense) => void;
  updateActivityExpense: (dayId: string, activityId: string, expenseId: string, updates: Partial<ActivityExpense>) => void;
  removeActivityExpense: (dayId: string, activityId: string, expenseId: string) => void;
  addOwner: (owner: ExpenseOwnerConfig) => void;
  removeOwner: (ownerId: string) => void;
  updateOwner: (ownerId: string, updates: Partial<Omit<ExpenseOwnerConfig, 'id'>>) => void;
  getTotalExpensesByOwner: (owner: ExpenseOwner | 'all') => number;
  getTotalCost: () => number;
  getDayCost: (dayId: string) => number;
  getDayActualCost: (dayId: string) => number;
  getTotalExpenses: () => number;
  setPendingCameraExpense: (pending: { amount: number; currency: string } | null) => void;
}

export const createExpenseSlice: StateCreator<TripStore, [], [], ExpenseSlice> = (set, get) => ({
  addExpense: (expense) =>
    set((state) => updateCurrentTrip(state, (trip) => ({
      expenses: [...trip.expenses, expense],
    }))),

  removeExpense: (id) =>
    set((state) => updateCurrentTrip(state, (trip) => ({
      expenses: trip.expenses.filter((e) => e.id !== id),
    }))),

  addActivityExpense: (dayId, activityId, expense) =>
    set((state) => updateCurrentTrip(state, (trip) =>
      mapActivities(trip, dayId, (a) =>
        a.id === activityId ? { ...a, expenses: [...(a.expenses || []), expense] } : a
      )
    )),

  updateActivityExpense: (dayId, activityId, expenseId, updates) =>
    set((state) => updateCurrentTrip(state, (trip) =>
      mapActivities(trip, dayId, (a) =>
        a.id === activityId
          ? { ...a, expenses: (a.expenses || []).map((e) => e.id === expenseId ? { ...e, ...updates } : e) }
          : a
      )
    )),

  removeActivityExpense: (dayId, activityId, expenseId) =>
    set((state) => updateCurrentTrip(state, (trip) =>
      mapActivities(trip, dayId, (a) =>
        a.id === activityId
          ? { ...a, expenses: (a.expenses || []).filter((e) => e.id !== expenseId) }
          : a
      )
    )),

  addOwner: (owner) =>
    set((state) => updateCurrentTrip(state, (trip) => {
      if (trip.owners.some((o) => o.id === owner.id)) return {};
      return { owners: [...trip.owners, owner] };
    })),

  removeOwner: (ownerId) => {
    if (ownerId === 'shared') return;
    set((state) => updateCurrentTrip(state, (trip) => {
      const expenses = trip.expenses.map((e) =>
        e.owner === ownerId ? { ...e, owner: 'shared' } : e
      );
      const days = trip.days.map((day) => ({
        ...day,
        activities: day.activities.map((a) => ({
          ...a,
          expenses: (a.expenses || []).map((e) =>
            e.owner === ownerId ? { ...e, owner: 'shared' } : e
          ),
        })),
      }));
      return {
        owners: trip.owners.filter((o) => o.id !== ownerId),
        expenses,
        days,
      };
    }));
  },

  updateOwner: (ownerId, updates) =>
    set((state) => updateCurrentTrip(state, (trip) => ({
      owners: trip.owners.map((o) =>
        o.id === ownerId ? { ...o, ...updates } : o
      ),
    }))),

  getTotalExpensesByOwner: (owner) => {
    const trip = currentTrip(get());
    const filterOwner = (o: string) => owner === 'all' || o === owner;
    const globalExpenses = trip.expenses
      .filter((e) => filterOwner(e.owner))
      .reduce((sum, e) => sum + e.amount, 0);
    const activityExpenses = trip.days.reduce((sum, day) =>
      sum + day.activities.reduce((s, a) =>
        s + (a.expenses || []).filter((e) => filterOwner(e.owner)).reduce((es, e) => es + e.amount, 0), 0), 0);
    return globalExpenses + activityExpenses;
  },

  getTotalCost: () => {
    const trip = currentTrip(get());
    return trip.days.reduce((total, day) =>
      total + day.activities.reduce((sum, a) => sum + a.estimatedCost, 0), 0);
  },

  getDayCost: (dayId) => {
    const trip = currentTrip(get());
    const day = trip.days.find((d) => d.id === dayId);
    if (!day) return 0;
    return day.activities.reduce((sum, a) => sum + a.estimatedCost, 0);
  },

  getDayActualCost: (dayId) => {
    const trip = currentTrip(get());
    const day = trip.days.find((d) => d.id === dayId);
    if (!day) return 0;
    const activityExpenses = day.activities.reduce((sum, a) =>
      sum + (a.expenses || []).reduce((s, e) => s + e.amount, 0), 0);
    const globalDayExpenses = trip.expenses.filter((e) => e.dayId === dayId).reduce((sum, e) => sum + e.amount, 0);
    return activityExpenses + globalDayExpenses;
  },

  getTotalExpenses: () => {
    const trip = currentTrip(get());
    const globalExpenses = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
    const activityExpenses = trip.days.reduce((sum, day) =>
      sum + day.activities.reduce((s, a) =>
        s + (a.expenses || []).reduce((es, e) => es + e.amount, 0), 0), 0);
    return globalExpenses + activityExpenses;
  },

  setPendingCameraExpense: (pendingCameraExpense) =>
    set((state) => updateCurrentTrip(state, () => ({ pendingCameraExpense }))),
});
