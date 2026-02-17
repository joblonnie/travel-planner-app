import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  DayPlan, ExpenseOwnerConfig, Destination, ImmigrationSchedule,
  InterCityTransport, Trip, TripExpense, TripRestaurantComment,
} from '@/types/index.ts';
import { defaultTripPlan } from '@/data/tripPlan.ts';

import { createAppSlice, type AppSlice } from './slices/appSlice.ts';
import { createTripSlice, type TripSlice } from './slices/tripSlice.ts';
import { createDaySlice, type DaySlice } from './slices/daySlice.ts';
import { createActivitySlice, type ActivitySlice } from './slices/activitySlice.ts';
import { createExpenseSlice, type ExpenseSlice } from './slices/expenseSlice.ts';
import { createTransportSlice, type TransportSlice } from './slices/transportSlice.ts';
import { createDestinationSlice, type DestinationSlice } from './slices/destinationSlice.ts';

// Re-export for backward compat
export type Expense = TripExpense;
export type RestaurantComment = TripRestaurantComment;

export type TripStore =
  AppSlice &
  TripSlice &
  DaySlice &
  ActivitySlice &
  ExpenseSlice &
  TransportSlice &
  DestinationSlice;

export const useTripStore = create<TripStore>()(
  persist(
    (...a) => ({
      ...createAppSlice(...a),
      ...createTripSlice(...a),
      ...createDaySlice(...a),
      ...createActivitySlice(...a),
      ...createExpenseSlice(...a),
      ...createTransportSlice(...a),
      ...createDestinationSlice(...a),
    }),
    {
      name: 'travel-trip-store',
      version: 6,
      partialize: (state) => {
        // Exclude auth state from localStorage persistence
        const { user, isAuthenticated, ...rest } = state;
        return rest;
      },
      migrate: (_persistedState, version) => {
        const state = _persistedState as Record<string, unknown>;

        // v1 → v2: Reset trip data
        if (version < 2) {
          state.days = defaultTripPlan;
          state.startDate = '2026-10-17';
          state.endDate = '2026-11-01';
        }

        // v2 → v3: Add owner to expenses
        if (version < 3) {
          const expenses = ((state.expenses || []) as TripExpense[]).map((e) => ({
            ...e,
            owner: e.owner || 'shared',
          }));
          const days = ((state.days || []) as DayPlan[]).map((day) => ({
            ...day,
            activities: day.activities.map((a) => ({
              ...a,
              expenses: (a.expenses || []).map((e) => ({
                ...e,
                owner: e.owner || 'shared',
              })),
            })),
          }));
          state.expenses = expenses;
          state.days = days;
        }

        // v3 → v4: Dynamic owners
        if (version < 4) {
          const owners: ExpenseOwnerConfig[] = [
            { id: 'shared', name: '공용', color: 'gray' },
          ];
          const allExpenses = (state.expenses || []) as TripExpense[];
          const allDays = (state.days || []) as DayPlan[];
          const hasGroom = allExpenses.some((e) => e.owner === 'groom') ||
            allDays.some((d) => d.activities.some((a) => (a.expenses || []).some((e) => e.owner === 'groom')));
          const hasBride = allExpenses.some((e) => e.owner === 'bride') ||
            allDays.some((d) => d.activities.some((a) => (a.expenses || []).some((e) => e.owner === 'bride')));
          if (hasGroom) owners.push({ id: 'groom', name: '신랑', color: 'blue' });
          if (hasBride) owners.push({ id: 'bride', name: '신부', color: 'pink' });
          delete state.groomBudget;
          delete state.brideBudget;
          state.owners = owners;
        }

        // v5 → v6: Add theme setting
        if (version >= 5 && version < 6) {
          state.theme = state.theme || 'cloud-dancer';
        }

        // v4 → v5: Multi-trip support — wrap existing data into first Trip
        if (version < 5) {
          const ts = new Date().toISOString();
          const tripId = crypto.randomUUID();
          const trip: Trip = {
            id: tripId,
            tripName: (state.tripName as string) || '스페인 신혼여행 2026',
            startDate: (state.startDate as string) || '2026-10-17',
            endDate: (state.endDate as string) || '2026-11-01',
            days: (state.days as DayPlan[]) || defaultTripPlan,
            currentDayIndex: (state.currentDayIndex as number) || 0,
            totalBudget: (state.totalBudget as number) || 5000,
            expenses: (state.expenses as TripExpense[]) || [],
            restaurantComments: (state.restaurantComments as TripRestaurantComment[]) || [],
            customDestinations: (state.customDestinations as Destination[]) || [],
            immigrationSchedules: (state.immigrationSchedules as ImmigrationSchedule[]) || [],
            interCityTransports: (state.interCityTransports as InterCityTransport[]) || [],
            owners: (state.owners as ExpenseOwnerConfig[]) || [{ id: 'shared', name: '공용', color: 'gray' }],
            pendingCameraExpense: (state.pendingCameraExpense as Trip['pendingCameraExpense']) || null,
            createdAt: ts,
            updatedAt: ts,
          };

          delete state.tripName;
          delete state.startDate;
          delete state.endDate;
          delete state.days;
          delete state.currentDayIndex;
          delete state.totalBudget;
          delete state.expenses;
          delete state.restaurantComments;
          delete state.customDestinations;
          delete state.immigrationSchedules;
          delete state.interCityTransports;
          delete state.owners;
          delete state.pendingCameraExpense;

          return {
            ...state,
            trips: [trip],
            currentTripId: tripId,
            currentPage: state.currentPage || 'planner',
            language: state.language || 'ko',
            currency: state.currency || 'EUR',
            exchangeRate: state.exchangeRate || 1450,
          } as unknown as TripStore;
        }

        return state as unknown as TripStore;
      },
    }
  )
);
