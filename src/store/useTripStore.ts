import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TripExpense, TripRestaurantComment } from '@/types/index.ts';

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
      version: 7,
      partialize: (state) => {
        // Only persist UI preferences — trip data + auth state come from server
        const { user, isAuthenticated, tripsLoaded, trips, currentTripId, ...rest } = state;
        return rest;
      },
    }
  )
);
