import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DayPlan, ScheduledActivity, BookingInfo, Destination, FlightInfo, ImmigrationSchedule, InterCityTransport, ActivityExpense, ExpenseOwner, MediaItem, ExpenseOwnerConfig } from '../types/index.ts';
import { defaultTripPlan } from '../data/tripPlan.ts';
import { destinations } from '../data/destinations.ts';
import type { Language } from '../i18n/translations.ts';
import type { Currency } from '../hooks/useCurrency.ts';

export interface Expense {
  id: string;
  dayId?: string;
  category: 'accommodation' | 'food' | 'transport' | 'attraction' | 'shopping' | 'entertainment' | 'other';
  amount: number;
  currency: 'EUR';
  description: string;
  date: string;
  owner: ExpenseOwner;
}

export interface RestaurantComment {
  id: string;
  restaurantId: string;
  text: string;
  rating?: number;
  date: string;
}

interface TripStore {
  tripName: string;
  startDate: string;
  endDate: string;
  days: DayPlan[];
  currentDayIndex: number;
  currentPage: 'planner' | 'budget';
  language: Language;
  currency: Currency;
  exchangeRate: number;
  totalBudget: number;
  expenses: Expense[];
  restaurantComments: RestaurantComment[];
  customDestinations: Destination[];
  immigrationSchedules: ImmigrationSchedule[];
  interCityTransports: InterCityTransport[];
  owners: ExpenseOwnerConfig[];
  pendingCameraExpense: { amount: number; currency: string } | null;

  setTripName: (name: string) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setCurrentDay: (index: number) => void;
  setCurrentPage: (page: 'planner' | 'budget') => void;
  setLanguage: (lang: Language) => void;
  setCurrency: (currency: Currency) => void;
  setExchangeRate: (rate: number) => void;
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

export const useTripStore = create<TripStore>()(
  persist(
    (set, get) => ({
      tripName: '스페인 신혼여행 2026',
      startDate: '2026-10-17',
      endDate: '2026-11-01',
      days: defaultTripPlan,
      currentDayIndex: 0,
      currentPage: 'planner' as const,
      language: 'ko' as Language,
      currency: 'EUR' as Currency,
      exchangeRate: 1450,
      totalBudget: 5000,
      expenses: [],
      restaurantComments: [],
      customDestinations: [],
      immigrationSchedules: [],
      interCityTransports: [],
      owners: [{ id: 'shared', name: '공용', color: 'gray' }],
      pendingCameraExpense: null,

      setTripName: (tripName) => set({ tripName }),
      setStartDate: (startDate) => set({ startDate }),
      setEndDate: (endDate) => set({ endDate }),
      setCurrentDay: (index) => set({ currentDayIndex: index }),
      setCurrentPage: (page) => set({ currentPage: page }),
      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),
      setExchangeRate: (exchangeRate) => set({ exchangeRate }),
      setTotalBudget: (totalBudget) => set({ totalBudget }),

      reorderDays: (oldIndex, newIndex) =>
        set((state) => {
          const items = [...state.days];
          const [moved] = items.splice(oldIndex, 1);
          items.splice(newIndex, 0, moved);
          const reNumbered = items.map((d, i) => ({ ...d, dayNumber: i + 1 }));
          // Keep current day pointing to the same day after reorder
          const currentDayId = state.days[state.currentDayIndex]?.id;
          const newIndex2 = reNumbered.findIndex((d) => d.id === currentDayId);
          return { days: reNumbered, currentDayIndex: newIndex2 >= 0 ? newIndex2 : 0 };
        }),

      reorderActivities: (dayId, oldIndex, newIndex) =>
        set((state) => {
          const days = state.days.map((day) => {
            if (day.id !== dayId) return day;
            const items = [...day.activities];
            const [moved] = items.splice(oldIndex, 1);
            items.splice(newIndex, 0, moved);
            return { ...day, activities: items };
          });
          return { days };
        }),

      addActivity: (dayId, activity, insertAtIndex?) =>
        set((state) => ({
          days: state.days.map((day) => {
            if (day.id !== dayId) return day;
            if (insertAtIndex != null && insertAtIndex >= 0 && insertAtIndex <= day.activities.length) {
              const items = [...day.activities];
              items.splice(insertAtIndex, 0, activity);
              return { ...day, activities: items };
            }
            return { ...day, activities: [...day.activities, activity] };
          }),
        })),

      removeActivity: (dayId, activityId) =>
        set((state) => ({
          days: state.days.map((day) =>
            day.id === dayId
              ? { ...day, activities: day.activities.filter((a) => a.id !== activityId) }
              : day
          ),
        })),

      updateActivity: (dayId, activityId, updates) =>
        set((state) => ({
          days: state.days.map((day) =>
            day.id === dayId
              ? {
                  ...day,
                  activities: day.activities.map((a) =>
                    a.id === activityId ? { ...a, ...updates } : a
                  ),
                }
              : day
          ),
        })),

      updateBooking: (dayId, activityId, booking) =>
        set((state) => ({
          days: state.days.map((day) =>
            day.id === dayId
              ? {
                  ...day,
                  activities: day.activities.map((a) =>
                    a.id === activityId ? { ...a, booking, isBooked: true } : a
                  ),
                }
              : day
          ),
        })),

      toggleBooked: (dayId, activityId) =>
        set((state) => ({
          days: state.days.map((day) =>
            day.id === dayId
              ? {
                  ...day,
                  activities: day.activities.map((a) =>
                    a.id === activityId ? { ...a, isBooked: !a.isBooked } : a
                  ),
                }
              : day
          ),
        })),

      toggleCompleted: (dayId, activityId) =>
        set((state) => ({
          days: state.days.map((day) =>
            day.id === dayId
              ? {
                  ...day,
                  activities: day.activities.map((a) =>
                    a.id === activityId ? { ...a, isCompleted: !a.isCompleted, isSkipped: false } : a
                  ),
                }
              : day
          ),
        })),

      toggleSkipped: (dayId, activityId) =>
        set((state) => ({
          days: state.days.map((day) =>
            day.id === dayId
              ? {
                  ...day,
                  activities: day.activities.map((a) =>
                    a.id === activityId ? { ...a, isSkipped: !a.isSkipped, isCompleted: false } : a
                  ),
                }
              : day
          ),
        })),

      updateDayNotes: (dayId, notes) =>
        set((state) => ({
          days: state.days.map((day) =>
            day.id === dayId ? { ...day, notes } : day
          ),
        })),

      addDay: (day) =>
        set((state) => ({ days: [...state.days, day] })),

      removeDay: (dayId) =>
        set((state) => {
          const newDays = state.days.filter((d) => d.id !== dayId).map((d, i) => ({ ...d, dayNumber: i + 1 }));
          return {
            days: newDays,
            currentDayIndex: Math.max(0, Math.min(state.currentDayIndex, newDays.length - 1)),
          };
        }),

      updateDay: (dayId, updates) =>
        set((state) => ({
          days: state.days.map((day) =>
            day.id === dayId ? { ...day, ...updates } : day
          ),
        })),

      updateAccommodationByDestination: (destinationId, accommodation) =>
        set((state) => ({
          days: state.days.map((day) =>
            day.destinationId === destinationId ? { ...day, accommodation } : day
          ),
        })),

      sortDaysByDate: () =>
        set((state) => {
          const currentDayId = state.days[state.currentDayIndex]?.id;
          const sorted = [...state.days]
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((d, i) => ({ ...d, dayNumber: i + 1 }));
          const newIndex = sorted.findIndex((d) => d.id === currentDayId);
          return { days: sorted, currentDayIndex: newIndex >= 0 ? newIndex : 0 };
        }),

      addExpense: (expense) =>
        set((state) => ({ expenses: [...state.expenses, expense] })),

      removeExpense: (id) =>
        set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) })),

      addRestaurantComment: (comment) =>
        set((state) => ({ restaurantComments: [...state.restaurantComments, comment] })),

      removeRestaurantComment: (commentId) =>
        set((state) => ({ restaurantComments: state.restaurantComments.filter((c) => c.id !== commentId) })),

      getRestaurantComments: (restaurantId) => {
        return get().restaurantComments.filter((c) => c.restaurantId === restaurantId);
      },

      addFlight: (dayId, flight) =>
        set((state) => ({
          days: state.days.map((day) =>
            day.id === dayId
              ? { ...day, flights: [...(day.flights || []), flight] }
              : day
          ),
        })),

      removeFlight: (dayId, flightId) =>
        set((state) => ({
          days: state.days.map((day) =>
            day.id === dayId
              ? { ...day, flights: (day.flights || []).filter((f) => f.id !== flightId) }
              : day
          ),
        })),

      updateFlight: (dayId, flightId, updates) =>
        set((state) => ({
          days: state.days.map((day) =>
            day.id === dayId
              ? {
                  ...day,
                  flights: (day.flights || []).map((f) =>
                    f.id === flightId ? { ...f, ...updates } : f
                  ),
                }
              : day
          ),
        })),

      addMemo: (dayId, activityId, text) =>
        set((state) => ({
          days: state.days.map((day) =>
            day.id === dayId
              ? {
                  ...day,
                  activities: day.activities.map((a) =>
                    a.id === activityId ? { ...a, memos: [...(a.memos || []), text] } : a
                  ),
                }
              : day
          ),
        })),

      removeMemo: (dayId, activityId, memoIndex) =>
        set((state) => ({
          days: state.days.map((day) =>
            day.id === dayId
              ? {
                  ...day,
                  activities: day.activities.map((a) =>
                    a.id === activityId
                      ? { ...a, memos: (a.memos || []).filter((_, i) => i !== memoIndex) }
                      : a
                  ),
                }
              : day
          ),
        })),

      addActivityExpense: (dayId, activityId, expense) =>
        set((state) => ({
          days: state.days.map((day) =>
            day.id === dayId
              ? {
                  ...day,
                  activities: day.activities.map((a) =>
                    a.id === activityId
                      ? { ...a, expenses: [...(a.expenses || []), expense] }
                      : a
                  ),
                }
              : day
          ),
        })),

      removeActivityExpense: (dayId, activityId, expenseId) =>
        set((state) => ({
          days: state.days.map((day) =>
            day.id === dayId
              ? {
                  ...day,
                  activities: day.activities.map((a) =>
                    a.id === activityId
                      ? { ...a, expenses: (a.expenses || []).filter((e) => e.id !== expenseId) }
                      : a
                  ),
                }
              : day
          ),
        })),

      addImmigrationSchedule: (schedule) =>
        set((state) => ({ immigrationSchedules: [...state.immigrationSchedules, schedule] })),

      updateImmigrationSchedule: (id, updates) =>
        set((state) => ({
          immigrationSchedules: state.immigrationSchedules.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      removeImmigrationSchedule: (id) =>
        set((state) => ({
          immigrationSchedules: state.immigrationSchedules.filter((s) => s.id !== id),
        })),

      addInterCityTransport: (transport) =>
        set((state) => ({ interCityTransports: [...state.interCityTransports, transport] })),

      updateInterCityTransport: (id, updates) =>
        set((state) => ({
          interCityTransports: state.interCityTransports.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      removeInterCityTransport: (id) =>
        set((state) => ({
          interCityTransports: state.interCityTransports.filter((t) => t.id !== id),
        })),

      addOwner: (owner) =>
        set((state) => {
          if (state.owners.some((o) => o.id === owner.id)) return state;
          return { owners: [...state.owners, owner] };
        }),

      removeOwner: (ownerId) => {
        if (ownerId === 'shared') return;
        set((state) => {
          // Reassign orphaned expenses to 'shared'
          const expenses = state.expenses.map((e) =>
            e.owner === ownerId ? { ...e, owner: 'shared' } : e
          );
          const days = state.days.map((day) => ({
            ...day,
            activities: day.activities.map((a) => ({
              ...a,
              expenses: (a.expenses || []).map((e) =>
                e.owner === ownerId ? { ...e, owner: 'shared' } : e
              ),
            })),
          }));
          return {
            owners: state.owners.filter((o) => o.id !== ownerId),
            expenses,
            days,
          };
        });
      },

      updateOwner: (ownerId, updates) =>
        set((state) => ({
          owners: state.owners.map((o) =>
            o.id === ownerId ? { ...o, ...updates } : o
          ),
        })),

      setPendingCameraExpense: (pendingCameraExpense) => set({ pendingCameraExpense }),

      getTotalExpensesByOwner: (owner) => {
        const state = get();
        const filterOwner = (o: string) => owner === 'all' || o === owner;
        const globalExpenses = state.expenses
          .filter((e) => filterOwner(e.owner))
          .reduce((sum, e) => sum + e.amount, 0);
        const activityExpenses = state.days.reduce((sum, day) =>
          sum + day.activities.reduce((s, a) =>
            s + (a.expenses || []).filter((e) => filterOwner(e.owner)).reduce((es, e) => es + e.amount, 0), 0), 0);
        return globalExpenses + activityExpenses;
      },

      addMedia: (dayId, activityId, media) =>
        set((state) => ({
          days: state.days.map((day) =>
            day.id === dayId
              ? {
                  ...day,
                  activities: day.activities.map((a) =>
                    a.id === activityId
                      ? { ...a, media: [...(a.media || []), media] }
                      : a
                  ),
                }
              : day
          ),
        })),

      removeMedia: (dayId, activityId, mediaId) =>
        set((state) => ({
          days: state.days.map((day) =>
            day.id === dayId
              ? {
                  ...day,
                  activities: day.activities.map((a) =>
                    a.id === activityId
                      ? { ...a, media: (a.media || []).filter((m) => m.id !== mediaId) }
                      : a
                  ),
                }
              : day
          ),
        })),

      duplicateActivity: (dayId, activityId) =>
        set((state) => ({
          days: state.days.map((day) => {
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
          }),
        })),

      duplicateDay: (dayId) =>
        set((state) => {
          const day = state.days.find((d) => d.id === dayId);
          if (!day) return state;
          const newDay: DayPlan = {
            ...day,
            id: crypto.randomUUID(),
            dayNumber: state.days.length + 1,
            activities: day.activities.map((a) => ({
              ...a,
              id: crypto.randomUUID(),
              isCompleted: false,
              isSkipped: false,
              expenses: [],
              media: [],
            })),
          };
          return { days: [...state.days, newDay] };
        }),

      goToNextDay: () =>
        set((state) => ({
          currentDayIndex: Math.min(state.currentDayIndex + 1, state.days.length - 1),
        })),

      goToPrevDay: () =>
        set((state) => ({
          currentDayIndex: Math.max(state.currentDayIndex - 1, 0),
        })),

      importTripData: (jsonStr) => {
        try {
          const data = JSON.parse(jsonStr);
          if (!data.days || !Array.isArray(data.days)) return false;
          set({
            tripName: data.tripName ?? get().tripName,
            startDate: data.startDate ?? get().startDate,
            endDate: data.endDate ?? get().endDate,
            days: data.days,
            expenses: data.expenses ?? [],
            totalBudget: data.totalBudget ?? get().totalBudget,
            exchangeRate: data.exchangeRate ?? get().exchangeRate,
            immigrationSchedules: data.immigrationSchedules ?? [],
            interCityTransports: data.interCityTransports ?? [],
            customDestinations: data.customDestinations ?? [],
            restaurantComments: data.restaurantComments ?? [],
            owners: data.owners ?? [{ id: 'shared', name: '공용', color: 'gray' }],
            currentDayIndex: 0,
          });
          return true;
        } catch {
          return false;
        }
      },

      addCustomDestination: (dest) =>
        set((state) => {
          if (state.customDestinations.some((d) => d.id === dest.id)) return state;
          return { customDestinations: [...state.customDestinations, dest] };
        }),

      getAllDestinations: () => {
        return [...destinations, ...get().customDestinations];
      },

      getTotalCost: () => {
        return get().days.reduce((total, day) => {
          return total + day.activities.reduce((sum, a) => sum + a.estimatedCost, 0);
        }, 0);
      },

      getDayCost: (dayId) => {
        const day = get().days.find((d) => d.id === dayId);
        if (!day) return 0;
        return day.activities.reduce((sum, a) => sum + a.estimatedCost, 0);
      },

      getDayActualCost: (dayId) => {
        const state = get();
        const day = state.days.find((d) => d.id === dayId);
        if (!day) return 0;
        const activityExpenses = day.activities.reduce((sum, a) => sum + (a.expenses || []).reduce((s, e) => s + e.amount, 0), 0);
        const globalDayExpenses = state.expenses.filter((e) => e.dayId === dayId).reduce((sum, e) => sum + e.amount, 0);
        return activityExpenses + globalDayExpenses;
      },

      getTotalExpenses: () => {
        const state = get();
        const globalExpenses = state.expenses.reduce((sum, e) => sum + e.amount, 0);
        const activityExpenses = state.days.reduce((sum, day) =>
          sum + day.activities.reduce((s, a) => s + (a.expenses || []).reduce((es, e) => es + e.amount, 0), 0), 0);
        return globalExpenses + activityExpenses;
      },
    }),
    {
      name: 'honeymoon-trip-store',
      version: 4,
      migrate: (_persistedState, version) => {
        const state = _persistedState as Record<string, unknown>;
        // Reset trip data when version changes to pick up new tripPlan defaults
        if (version < 2) {
          return {
            ...state,
            days: defaultTripPlan,
            startDate: '2026-10-17',
            endDate: '2026-11-01',
          };
        }
        if (version < 3) {
          // Add owner: 'shared' to all existing expenses
          const expenses = ((state.expenses || []) as Expense[]).map((e) => ({
            ...e,
            owner: e.owner || 'shared',
          }));
          // Add owner: 'shared' to all activity expenses
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
        if (version < 4) {
          // Migrate from hardcoded groom/bride to dynamic owners
          const owners: ExpenseOwnerConfig[] = [
            { id: 'shared', name: '공용', color: 'gray' },
          ];
          // Check if existing data has groom/bride expenses
          const allExpenses = (state.expenses || []) as Expense[];
          const allDays = (state.days || []) as DayPlan[];
          const hasGroom = allExpenses.some((e) => e.owner === 'groom') ||
            allDays.some((d) => d.activities.some((a) => (a.expenses || []).some((e) => e.owner === 'groom')));
          const hasBride = allExpenses.some((e) => e.owner === 'bride') ||
            allDays.some((d) => d.activities.some((a) => (a.expenses || []).some((e) => e.owner === 'bride')));
          if (hasGroom) owners.push({ id: 'groom', name: '신랑', color: 'blue' });
          if (hasBride) owners.push({ id: 'bride', name: '신부', color: 'pink' });
          // Remove deprecated fields
          delete state.groomBudget;
          delete state.brideBudget;
          return {
            ...state,
            owners,
          };
        }
        return state as TripStore;
      },
    }
  )
);
