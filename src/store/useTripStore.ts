import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TripExpense, TripRestaurantComment } from '@/types/index.ts';

import { createAppSlice, type AppSlice } from './slices/appSlice.ts';

// Re-export for backward compat
export type Expense = TripExpense;
export type RestaurantComment = TripRestaurantComment;

export type TripStore = AppSlice;

export const useTripStore = create<TripStore>()(
  persist(
    (...a) => ({
      ...createAppSlice(...a),
    }),
    {
      name: 'travel-trip-store',
      version: 9,
      migrate: (persisted, version) => {
        const state = persisted as Record<string, unknown>;
        if (version < 9) {
          // v9: Base currency changed from EUR to KRW
          return { ...state, currency: 'KRW', fetchedRates: null, ratesUpdatedAt: null };
        }
        return state;
      },
      partialize: (state) => {
        // Only persist UI preferences — trip data + auth state come from server
        const { user, isAuthenticated, tripsLoaded, currentTripId, currentDayIndex, ...rest } = state;
        return rest;
      },
    }
  )
);
