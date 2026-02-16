import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  DayPlan, ScheduledActivity, BookingInfo, Destination, FlightInfo,
  ImmigrationSchedule, InterCityTransport, ActivityExpense, ExpenseOwner,
  MediaItem, ExpenseOwnerConfig, Trip, TripExpense, TripRestaurantComment,
} from '../types/index.ts';
import { defaultTripPlan } from '../data/tripPlan.ts';
import { destinations } from '../data/destinations.ts';
import type { Language } from '../i18n/translations.ts';
import type { Currency } from '../hooks/useCurrency.ts';

// Re-export for backward compat
export type Expense = TripExpense;
export type RestaurantComment = TripRestaurantComment;

/* ─── Helper: get current trip from state ─── */
function currentTrip(state: TripStore): Trip {
  return state.trips.find((t) => t.id === state.currentTripId)!;
}

/* ─── Helper: update current trip immutably ─── */
function updateCurrentTrip(
  state: TripStore,
  updater: (trip: Trip) => Partial<Trip>,
): Partial<TripStore> {
  return {
    trips: state.trips.map((t) =>
      t.id === state.currentTripId
        ? { ...t, ...updater(t), updatedAt: new Date().toISOString() }
        : t
    ),
  };
}

interface TripStore {
  // ── Multi-trip state ──
  trips: Trip[];
  currentTripId: string;

  // ── Global settings (not per-trip) ──
  currentPage: 'planner' | 'budget' | 'trips';
  language: Language;
  currency: Currency;
  exchangeRate: number;

  // ── Trip CRUD ──
  createTrip: (trip: Omit<Trip, 'createdAt' | 'updatedAt'>) => void;
  deleteTrip: (tripId: string) => void;
  switchTrip: (tripId: string) => void;
  duplicateTrip: (tripId: string) => void;

  // ── Global settings actions ──
  setCurrentPage: (page: 'planner' | 'budget' | 'trips') => void;
  setLanguage: (lang: Language) => void;
  setCurrency: (currency: Currency) => void;
  setExchangeRate: (rate: number) => void;

  // ── Per-trip actions (operate on currentTrip) ──
  setTripName: (name: string) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setCurrentDay: (index: number) => void;
  setTotalBudget: (budget: number) => void;
  reorderDays: (oldIndex: number, newIndex: number) => void;
  reorderActivities: (dayId: string, oldIndex: number, newIndex: number) => void;
  addActivity: (dayId: string, activity: ScheduledActivity, insertAtIndex?: number) => void;
  removeActivity: (dayId: string, activityId: string) => void;
  updateActivity: (dayId: string, activityId: string, updates: Partial<ScheduledActivity>) => void;
  updateBooking: (dayId: string, activityId: string, booking: BookingInfo) => void;
  toggleBooked: (dayId: string, activityId: string) => void;
  toggleCompleted: (dayId: string, activityId: string) => void;
  toggleSkipped: (dayId: string, activityId: string) => void;
  updateDayNotes: (dayId: string, notes: string) => void;
  addDay: (day: DayPlan) => void;
  removeDay: (dayId: string) => void;
  updateDay: (dayId: string, updates: Partial<DayPlan>) => void;
  updateAccommodationByDestination: (destinationId: string, accommodation: import('../types/index.ts').AccommodationInfo | undefined) => void;
  sortDaysByDate: () => void;
  addExpense: (expense: Expense) => void;
  removeExpense: (id: string) => void;
  addRestaurantComment: (comment: RestaurantComment) => void;
  removeRestaurantComment: (commentId: string) => void;
  getRestaurantComments: (restaurantId: string) => RestaurantComment[];
  addFlight: (dayId: string, flight: FlightInfo) => void;
  removeFlight: (dayId: string, flightId: string) => void;
  updateFlight: (dayId: string, flightId: string, updates: Partial<FlightInfo>) => void;
  addCustomDestination: (dest: Destination) => void;
  getAllDestinations: () => Destination[];
  getTotalCost: () => number;
  getDayCost: (dayId: string) => number;
  getDayActualCost: (dayId: string) => number;
  getTotalExpenses: () => number;
  addMemo: (dayId: string, activityId: string, text: string) => void;
  removeMemo: (dayId: string, activityId: string, memoIndex: number) => void;
  addActivityExpense: (dayId: string, activityId: string, expense: ActivityExpense) => void;
  removeActivityExpense: (dayId: string, activityId: string, expenseId: string) => void;
  addImmigrationSchedule: (schedule: ImmigrationSchedule) => void;
  updateImmigrationSchedule: (id: string, updates: Partial<ImmigrationSchedule>) => void;
  removeImmigrationSchedule: (id: string) => void;
  addInterCityTransport: (transport: InterCityTransport) => void;
  updateInterCityTransport: (id: string, updates: Partial<InterCityTransport>) => void;
  removeInterCityTransport: (id: string) => void;
  addOwner: (owner: ExpenseOwnerConfig) => void;
  removeOwner: (ownerId: string) => void;
  updateOwner: (ownerId: string, updates: Partial<Omit<ExpenseOwnerConfig, 'id'>>) => void;
  getTotalExpensesByOwner: (owner: ExpenseOwner | 'all') => number;
  addMedia: (dayId: string, activityId: string, media: MediaItem) => void;
  removeMedia: (dayId: string, activityId: string, mediaId: string) => void;
  setPendingCameraExpense: (pending: { amount: number; currency: string } | null) => void;
  duplicateActivity: (dayId: string, activityId: string) => void;
  duplicateDay: (dayId: string) => void;
  goToNextDay: () => void;
  goToPrevDay: () => void;
  importTripData: (jsonStr: string) => boolean;
}

/* ─── Helper: map days of current trip ─── */
function mapDays(trip: Trip, fn: (day: DayPlan) => DayPlan): Partial<Trip> {
  return { days: trip.days.map(fn) };
}

/* ─── Helper: map activities within a specific day ─── */
function mapActivities(
  trip: Trip,
  dayId: string,
  fn: (activity: ScheduledActivity) => ScheduledActivity,
): Partial<Trip> {
  return mapDays(trip, (day) =>
    day.id === dayId ? { ...day, activities: day.activities.map(fn) } : day,
  );
}

const DEFAULT_TRIP_ID = crypto.randomUUID();
const now = new Date().toISOString();

const defaultTrip: Trip = {
  id: DEFAULT_TRIP_ID,
  tripName: '스페인 신혼여행 2026',
  startDate: '2026-10-17',
  endDate: '2026-11-01',
  days: defaultTripPlan,
  currentDayIndex: 0,
  totalBudget: 5000,
  expenses: [],
  restaurantComments: [],
  customDestinations: [],
  immigrationSchedules: [],
  interCityTransports: [],
  owners: [{ id: 'shared', name: '공용', color: 'gray' }],
  pendingCameraExpense: null,
  createdAt: now,
  updatedAt: now,
};

export const useTripStore = create<TripStore>()(
  persist(
    (set, get) => ({
      // ── Multi-trip state ──
      trips: [defaultTrip],
      currentTripId: DEFAULT_TRIP_ID,

      // ── Global settings ──
      currentPage: 'planner' as const,
      language: 'ko' as Language,
      currency: 'EUR' as Currency,
      exchangeRate: 1450,

      // ── Trip CRUD ──
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
            currentPage: 'planner',
          };
        }),

      deleteTrip: (tripId) =>
        set((state) => {
          if (state.trips.length <= 1) return state;
          const remaining = state.trips.filter((t) => t.id !== tripId);
          const newCurrentId = state.currentTripId === tripId
            ? remaining[0].id
            : state.currentTripId;
          return { trips: remaining, currentTripId: newCurrentId };
        }),

      switchTrip: (tripId) =>
        set({ currentTripId: tripId, currentPage: 'planner' }),

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

      // ── Global settings actions ──
      setCurrentPage: (page) => set({ currentPage: page }),
      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),
      setExchangeRate: (exchangeRate) => set({ exchangeRate }),

      // ── Per-trip actions ──
      setTripName: (tripName) =>
        set((state) => updateCurrentTrip(state, () => ({ tripName }))),

      setStartDate: (startDate) =>
        set((state) => updateCurrentTrip(state, () => ({ startDate }))),

      setEndDate: (endDate) =>
        set((state) => updateCurrentTrip(state, () => ({ endDate }))),

      setCurrentDay: (index) =>
        set((state) => updateCurrentTrip(state, () => ({ currentDayIndex: index }))),

      setTotalBudget: (totalBudget) =>
        set((state) => updateCurrentTrip(state, () => ({ totalBudget }))),

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

      updateDayNotes: (dayId, notes) =>
        set((state) => updateCurrentTrip(state, (trip) =>
          mapDays(trip, (day) => day.id === dayId ? { ...day, notes } : day)
        )),

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

      updateAccommodationByDestination: (destinationId, accommodation) =>
        set((state) => updateCurrentTrip(state, (trip) =>
          mapDays(trip, (day) =>
            day.destinationId === destinationId ? { ...day, accommodation } : day
          )
        )),

      sortDaysByDate: () =>
        set((state) => updateCurrentTrip(state, (trip) => {
          const currentDayId = trip.days[trip.currentDayIndex]?.id;
          const sorted = [...trip.days]
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((d, i) => ({ ...d, dayNumber: i + 1 }));
          const newIndex = sorted.findIndex((d) => d.id === currentDayId);
          return { days: sorted, currentDayIndex: newIndex >= 0 ? newIndex : 0 };
        })),

      addExpense: (expense) =>
        set((state) => updateCurrentTrip(state, (trip) => ({
          expenses: [...trip.expenses, expense],
        }))),

      removeExpense: (id) =>
        set((state) => updateCurrentTrip(state, (trip) => ({
          expenses: trip.expenses.filter((e) => e.id !== id),
        }))),

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

      addActivityExpense: (dayId, activityId, expense) =>
        set((state) => updateCurrentTrip(state, (trip) =>
          mapActivities(trip, dayId, (a) =>
            a.id === activityId ? { ...a, expenses: [...(a.expenses || []), expense] } : a
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

      setPendingCameraExpense: (pendingCameraExpense) =>
        set((state) => updateCurrentTrip(state, () => ({ pendingCameraExpense }))),

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

      importTripData: (jsonStr) => {
        try {
          const data = JSON.parse(jsonStr);

          // Handle v5+ format: full trip export with trips array
          if (data.version >= 5 && data.trips && Array.isArray(data.trips)) {
            const importedTrips = data.trips.map((t: Trip) => ({
              ...t,
              id: crypto.randomUUID(),
              updatedAt: new Date().toISOString(),
            }));
            set((state) => ({
              trips: [...state.trips, ...importedTrips],
              currentTripId: importedTrips[0]?.id ?? state.currentTripId,
              currentPage: 'planner' as const,
            }));
            return true;
          }

          // Handle v4 legacy format: single-trip data → wrap as new trip
          if (!data.days || !Array.isArray(data.days)) return false;
          const newTripId = crypto.randomUUID();
          const ts = new Date().toISOString();
          const newTrip: Trip = {
            id: newTripId,
            tripName: data.tripName ?? '가져온 여행',
            startDate: data.startDate ?? '',
            endDate: data.endDate ?? '',
            days: data.days,
            currentDayIndex: 0,
            totalBudget: data.totalBudget ?? 5000,
            expenses: data.expenses ?? [],
            restaurantComments: data.restaurantComments ?? [],
            customDestinations: data.customDestinations ?? [],
            immigrationSchedules: data.immigrationSchedules ?? [],
            interCityTransports: data.interCityTransports ?? [],
            owners: data.owners ?? [{ id: 'shared', name: '공용', color: 'gray' }],
            pendingCameraExpense: null,
            createdAt: ts,
            updatedAt: ts,
          };
          set((state) => ({
            trips: [...state.trips, newTrip],
            currentTripId: newTripId,
            currentPage: 'planner' as const,
          }));
          return true;
        } catch {
          return false;
        }
      },

      addCustomDestination: (dest) =>
        set((state) => updateCurrentTrip(state, (trip) => {
          if (trip.customDestinations.some((d) => d.id === dest.id)) return {};
          return { customDestinations: [...trip.customDestinations, dest] };
        })),

      getAllDestinations: () => {
        const trip = currentTrip(get());
        return [...destinations, ...trip.customDestinations];
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
    }),
    {
      name: 'honeymoon-trip-store',
      version: 5,
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
          const expenses = ((state.expenses || []) as Expense[]).map((e) => ({
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
          const allExpenses = (state.expenses || []) as Expense[];
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
            expenses: (state.expenses as Expense[]) || [],
            restaurantComments: (state.restaurantComments as RestaurantComment[]) || [],
            customDestinations: (state.customDestinations as Destination[]) || [],
            immigrationSchedules: (state.immigrationSchedules as ImmigrationSchedule[]) || [],
            interCityTransports: (state.interCityTransports as InterCityTransport[]) || [],
            owners: (state.owners as ExpenseOwnerConfig[]) || [{ id: 'shared', name: '공용', color: 'gray' }],
            pendingCameraExpense: (state.pendingCameraExpense as Trip['pendingCameraExpense']) || null,
            createdAt: ts,
            updatedAt: ts,
          };

          // Clean up old top-level fields
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
