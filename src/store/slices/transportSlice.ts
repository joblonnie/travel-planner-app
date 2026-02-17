import type { StateCreator } from 'zustand';
import type { FlightInfo, ImmigrationSchedule, InterCityTransport } from '@/types/index.ts';
import type { TripStore } from '../useTripStore.ts';
import { updateCurrentTrip, mapDays } from '../helpers.ts';

export interface TransportSlice {
  addFlight: (dayId: string, flight: FlightInfo) => void;
  removeFlight: (dayId: string, flightId: string) => void;
  updateFlight: (dayId: string, flightId: string, updates: Partial<FlightInfo>) => void;
  addImmigrationSchedule: (schedule: ImmigrationSchedule) => void;
  updateImmigrationSchedule: (id: string, updates: Partial<ImmigrationSchedule>) => void;
  removeImmigrationSchedule: (id: string) => void;
  addInterCityTransport: (transport: InterCityTransport) => void;
  updateInterCityTransport: (id: string, updates: Partial<InterCityTransport>) => void;
  removeInterCityTransport: (id: string) => void;
}

export const createTransportSlice: StateCreator<TripStore, [], [], TransportSlice> = (set) => ({
  addFlight: (dayId, flight) =>
    set((state) => updateCurrentTrip(state, (trip) =>
      mapDays(trip, (day) =>
        day.id === dayId ? { ...day, flights: [...(day.flights || []), flight] } : day
      )
    )),

  removeFlight: (dayId, flightId) =>
    set((state) => updateCurrentTrip(state, (trip) =>
      mapDays(trip, (day) =>
        day.id === dayId
          ? { ...day, flights: (day.flights || []).filter((f) => f.id !== flightId) }
          : day
      )
    )),

  updateFlight: (dayId, flightId, updates) =>
    set((state) => updateCurrentTrip(state, (trip) =>
      mapDays(trip, (day) =>
        day.id === dayId
          ? { ...day, flights: (day.flights || []).map((f) => f.id === flightId ? { ...f, ...updates } : f) }
          : day
      )
    )),

  addImmigrationSchedule: (schedule) =>
    set((state) => updateCurrentTrip(state, (trip) => ({
      immigrationSchedules: [...trip.immigrationSchedules, schedule],
    }))),

  updateImmigrationSchedule: (id, updates) =>
    set((state) => updateCurrentTrip(state, (trip) => ({
      immigrationSchedules: trip.immigrationSchedules.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }))),

  removeImmigrationSchedule: (id) =>
    set((state) => updateCurrentTrip(state, (trip) => ({
      immigrationSchedules: trip.immigrationSchedules.filter((s) => s.id !== id),
    }))),

  addInterCityTransport: (transport) =>
    set((state) => updateCurrentTrip(state, (trip) => ({
      interCityTransports: [...trip.interCityTransports, transport],
    }))),

  updateInterCityTransport: (id, updates) =>
    set((state) => updateCurrentTrip(state, (trip) => ({
      interCityTransports: trip.interCityTransports.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }))),

  removeInterCityTransport: (id) =>
    set((state) => updateCurrentTrip(state, (trip) => ({
      interCityTransports: trip.interCityTransports.filter((t) => t.id !== id),
    }))),
});
