import type { StateCreator } from 'zustand';
import type { Destination, TripRestaurantComment } from '@/types/index.ts';
import type { TripStore } from '../useTripStore.ts';
import { currentTrip, updateCurrentTrip } from '../helpers.ts';
import { destinations } from '@/data/destinations.ts';

export type RestaurantComment = TripRestaurantComment;

export interface DestinationSlice {
  addCustomDestination: (dest: Destination) => void;
  getAllDestinations: () => Destination[];
  addRestaurantComment: (comment: TripRestaurantComment) => void;
  removeRestaurantComment: (commentId: string) => void;
  getRestaurantComments: (restaurantId: string) => TripRestaurantComment[];
  setTripName: (name: string) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setTotalBudget: (budget: number) => void;
}

export const createDestinationSlice: StateCreator<TripStore, [], [], DestinationSlice> = (set, get) => ({
  addCustomDestination: (dest) =>
    set((state) => updateCurrentTrip(state, (trip) => {
      if (trip.customDestinations.some((d) => d.id === dest.id)) return {};
      return { customDestinations: [...trip.customDestinations, dest] };
    })),

  getAllDestinations: () => {
    const trip = currentTrip(get());
    return [...destinations, ...trip.customDestinations];
  },

  addRestaurantComment: (comment) =>
    set((state) => updateCurrentTrip(state, (trip) => ({
      restaurantComments: [...trip.restaurantComments, comment],
    }))),

  removeRestaurantComment: (commentId) =>
    set((state) => updateCurrentTrip(state, (trip) => ({
      restaurantComments: trip.restaurantComments.filter((c) => c.id !== commentId),
    }))),

  getRestaurantComments: (restaurantId) => {
    const trip = currentTrip(get());
    return trip.restaurantComments.filter((c) => c.restaurantId === restaurantId);
  },

  setTripName: (tripName) =>
    set((state) => updateCurrentTrip(state, () => ({ tripName }))),

  setStartDate: (startDate) =>
    set((state) => updateCurrentTrip(state, () => ({ startDate }))),

  setEndDate: (endDate) =>
    set((state) => updateCurrentTrip(state, () => ({ endDate }))),

  setTotalBudget: (totalBudget) =>
    set((state) => updateCurrentTrip(state, () => ({ totalBudget }))),
});
