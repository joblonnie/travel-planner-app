/**
 * Pure Trip → Trip transformer functions.
 * Replaces 6 Zustand slices (trip, day, activity, expense, transport, destination).
 * Each action is a curried function: (args) => (trip: Trip) => Trip
 * Getters are plain functions: (trip: Trip) => T
 */
import type {
  Trip, DayPlan, ScheduledActivity, BookingInfo, MediaItem,
  ActivityExpense, ExpenseOwnerConfig, TripExpense, TripRestaurantComment,
  FlightInfo, ImmigrationSchedule, InterCityTransport,
  AccommodationInfo, Destination, ExpenseOwner,
} from '@/types/index.ts';

// ── Helpers ──

function mapDays(trip: Trip, fn: (day: DayPlan) => DayPlan): Trip {
  return { ...trip, days: trip.days.map(fn) };
}

function mapActivities(
  trip: Trip,
  dayId: string,
  fn: (a: ScheduledActivity) => ScheduledActivity,
): Trip {
  return mapDays(trip, (day) =>
    day.id === dayId ? { ...day, activities: day.activities.map(fn) } : day,
  );
}

// ── Day Actions ──

export const addDay = (day: DayPlan) =>
  (trip: Trip): Trip => ({ ...trip, days: [...trip.days, day] });

export const removeDay = (dayId: string) =>
  (trip: Trip): Trip => {
    const newDays = trip.days.filter((d) => d.id !== dayId).map((d, i) => ({ ...d, dayNumber: i + 1 }));
    return {
      ...trip,
      days: newDays,
      currentDayIndex: Math.max(0, Math.min(trip.currentDayIndex, newDays.length - 1)),
    };
  };

export const updateDay = (dayId: string, updates: Partial<DayPlan>) =>
  (trip: Trip): Trip => mapDays(trip, (day) => day.id === dayId ? { ...day, ...updates } : day);

export const reorderDays = (oldIndex: number, newIndex: number) =>
  (trip: Trip): Trip => {
    const items = [...trip.days];
    const [moved] = items.splice(oldIndex, 1);
    items.splice(newIndex, 0, moved);
    const reNumbered = items.map((d, i) => ({ ...d, dayNumber: i + 1 }));
    const currentDayId = trip.days[trip.currentDayIndex]?.id;
    const newIdx = reNumbered.findIndex((d) => d.id === currentDayId);
    return { ...trip, days: reNumbered, currentDayIndex: newIdx >= 0 ? newIdx : 0 };
  };

export const sortDaysByDate = () =>
  (trip: Trip): Trip => {
    const currentDayId = trip.days[trip.currentDayIndex]?.id;
    const sorted = [...trip.days]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d, i) => ({ ...d, dayNumber: i + 1 }));
    const newIndex = sorted.findIndex((d) => d.id === currentDayId);
    return { ...trip, days: sorted, currentDayIndex: newIndex >= 0 ? newIndex : 0 };
  };

export const duplicateDay = (dayId: string) =>
  (trip: Trip): Trip => {
    const day = trip.days.find((d) => d.id === dayId);
    if (!day) return trip;
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
    return { ...trip, days: [...trip.days, newDay] };
  };

export const setCurrentDay = (index: number) =>
  (trip: Trip): Trip => ({ ...trip, currentDayIndex: index });

export const goToNextDay = () =>
  (trip: Trip): Trip => ({
    ...trip,
    currentDayIndex: Math.min(trip.currentDayIndex + 1, trip.days.length - 1),
  });

export const goToPrevDay = () =>
  (trip: Trip): Trip => ({
    ...trip,
    currentDayIndex: Math.max(trip.currentDayIndex - 1, 0),
  });

export const updateDayNotes = (dayId: string, notes: string) =>
  (trip: Trip): Trip => mapDays(trip, (day) => day.id === dayId ? { ...day, notes } : day);

export const updateAccommodationByDestination = (destinationId: string, accommodation: AccommodationInfo | undefined) =>
  (trip: Trip): Trip => mapDays(trip, (day) =>
    day.destinationId === destinationId ? { ...day, accommodation } : day,
  );

// ── Activity Actions ──

export const addActivity = (dayId: string, activity: ScheduledActivity, insertAtIndex?: number) =>
  (trip: Trip): Trip => mapDays(trip, (day) => {
    if (day.id !== dayId) return day;
    if (insertAtIndex != null && insertAtIndex >= 0 && insertAtIndex <= day.activities.length) {
      const items = [...day.activities];
      items.splice(insertAtIndex, 0, activity);
      return { ...day, activities: items };
    }
    return { ...day, activities: [...day.activities, activity] };
  });

export const removeActivity = (dayId: string, activityId: string) =>
  (trip: Trip): Trip => mapDays(trip, (day) =>
    day.id === dayId
      ? { ...day, activities: day.activities.filter((a) => a.id !== activityId) }
      : day,
  );

export const updateActivity = (dayId: string, activityId: string, updates: Partial<ScheduledActivity>) =>
  (trip: Trip): Trip => mapActivities(trip, dayId, (a) =>
    a.id === activityId ? { ...a, ...updates } : a,
  );

export const reorderActivities = (dayId: string, oldIndex: number, newIndex: number) =>
  (trip: Trip): Trip => mapDays(trip, (day) => {
    if (day.id !== dayId) return day;
    const items = [...day.activities];
    const timeSlots = items.map((a) => a.time);
    const [moved] = items.splice(oldIndex, 1);
    items.splice(newIndex, 0, moved);
    const reordered = items.map((a, i) => ({ ...a, time: timeSlots[i] }));
    return { ...day, activities: reordered };
  });

export const updateBooking = (dayId: string, activityId: string, booking: BookingInfo) =>
  (trip: Trip): Trip => mapActivities(trip, dayId, (a) =>
    a.id === activityId ? { ...a, booking, isBooked: true } : a,
  );

export const toggleBooked = (dayId: string, activityId: string) =>
  (trip: Trip): Trip => mapActivities(trip, dayId, (a) =>
    a.id === activityId ? { ...a, isBooked: !a.isBooked } : a,
  );

export const toggleCompleted = (dayId: string, activityId: string) =>
  (trip: Trip): Trip => mapActivities(trip, dayId, (a) =>
    a.id === activityId ? { ...a, isCompleted: !a.isCompleted, isSkipped: false } : a,
  );

export const toggleSkipped = (dayId: string, activityId: string) =>
  (trip: Trip): Trip => mapActivities(trip, dayId, (a) =>
    a.id === activityId ? { ...a, isSkipped: !a.isSkipped, isCompleted: false } : a,
  );

export const addMemo = (dayId: string, activityId: string, text: string) =>
  (trip: Trip): Trip => mapActivities(trip, dayId, (a) =>
    a.id === activityId ? { ...a, memos: [...(a.memos || []), text] } : a,
  );

export const removeMemo = (dayId: string, activityId: string, memoIndex: number) =>
  (trip: Trip): Trip => mapActivities(trip, dayId, (a) =>
    a.id === activityId
      ? { ...a, memos: (a.memos || []).filter((_, i) => i !== memoIndex) }
      : a,
  );

export const addMedia = (dayId: string, activityId: string, media: MediaItem) =>
  (trip: Trip): Trip => mapActivities(trip, dayId, (a) =>
    a.id === activityId ? { ...a, media: [...(a.media || []), media] } : a,
  );

export const removeMedia = (dayId: string, activityId: string, mediaId: string) =>
  (trip: Trip): Trip => mapActivities(trip, dayId, (a) =>
    a.id === activityId
      ? { ...a, media: (a.media || []).filter((m) => m.id !== mediaId) }
      : a,
  );

export const duplicateActivity = (dayId: string, activityId: string) =>
  (trip: Trip): Trip => mapDays(trip, (day) => {
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
  });

// ── Expense Actions ──

export const addExpense = (expense: TripExpense) =>
  (trip: Trip): Trip => ({ ...trip, expenses: [...trip.expenses, expense] });

export const removeExpense = (id: string) =>
  (trip: Trip): Trip => ({ ...trip, expenses: trip.expenses.filter((e) => e.id !== id) });

export const addActivityExpense = (dayId: string, activityId: string, expense: ActivityExpense) =>
  (trip: Trip): Trip => mapActivities(trip, dayId, (a) =>
    a.id === activityId ? { ...a, expenses: [...(a.expenses || []), expense] } : a,
  );

export const updateActivityExpense = (dayId: string, activityId: string, expenseId: string, updates: Partial<ActivityExpense>) =>
  (trip: Trip): Trip => mapActivities(trip, dayId, (a) =>
    a.id === activityId
      ? { ...a, expenses: (a.expenses || []).map((e) => e.id === expenseId ? { ...e, ...updates } : e) }
      : a,
  );

export const removeActivityExpense = (dayId: string, activityId: string, expenseId: string) =>
  (trip: Trip): Trip => mapActivities(trip, dayId, (a) =>
    a.id === activityId
      ? { ...a, expenses: (a.expenses || []).filter((e) => e.id !== expenseId) }
      : a,
  );

export const addOwner = (owner: ExpenseOwnerConfig) =>
  (trip: Trip): Trip => {
    if (trip.owners.some((o) => o.id === owner.id)) return trip;
    return { ...trip, owners: [...trip.owners, owner] };
  };

export const removeOwner = (ownerId: string) =>
  (trip: Trip): Trip => {
    if (ownerId === 'shared') return trip;
    const expenses = trip.expenses.map((e) =>
      e.owner === ownerId ? { ...e, owner: 'shared' as string } : e,
    );
    const days = trip.days.map((day) => ({
      ...day,
      activities: day.activities.map((a) => ({
        ...a,
        expenses: (a.expenses || []).map((e) =>
          e.owner === ownerId ? { ...e, owner: 'shared' as string } : e,
        ),
      })),
    }));
    return {
      ...trip,
      owners: trip.owners.filter((o) => o.id !== ownerId),
      expenses,
      days,
    };
  };

export const updateOwner = (ownerId: string, updates: Partial<Omit<ExpenseOwnerConfig, 'id'>>) =>
  (trip: Trip): Trip => ({
    ...trip,
    owners: trip.owners.map((o) => o.id === ownerId ? { ...o, ...updates } : o),
  });

// ── Transport Actions ──

export const addFlight = (dayId: string, flight: FlightInfo) =>
  (trip: Trip): Trip => mapDays(trip, (day) =>
    day.id === dayId ? { ...day, flights: [...(day.flights || []), flight] } : day,
  );

export const removeFlight = (dayId: string, flightId: string) =>
  (trip: Trip): Trip => mapDays(trip, (day) =>
    day.id === dayId
      ? { ...day, flights: (day.flights || []).filter((f) => f.id !== flightId) }
      : day,
  );

export const updateFlight = (dayId: string, flightId: string, updates: Partial<FlightInfo>) =>
  (trip: Trip): Trip => mapDays(trip, (day) =>
    day.id === dayId
      ? { ...day, flights: (day.flights || []).map((f) => f.id === flightId ? { ...f, ...updates } : f) }
      : day,
  );

export const addImmigrationSchedule = (schedule: ImmigrationSchedule) =>
  (trip: Trip): Trip => ({ ...trip, immigrationSchedules: [...trip.immigrationSchedules, schedule] });

export const updateImmigrationSchedule = (id: string, updates: Partial<ImmigrationSchedule>) =>
  (trip: Trip): Trip => ({
    ...trip,
    immigrationSchedules: trip.immigrationSchedules.map((s) => s.id === id ? { ...s, ...updates } : s),
  });

export const removeImmigrationSchedule = (id: string) =>
  (trip: Trip): Trip => ({
    ...trip,
    immigrationSchedules: trip.immigrationSchedules.filter((s) => s.id !== id),
  });

export const addInterCityTransport = (transport: InterCityTransport) =>
  (trip: Trip): Trip => ({ ...trip, interCityTransports: [...trip.interCityTransports, transport] });

export const updateInterCityTransport = (id: string, updates: Partial<InterCityTransport>) =>
  (trip: Trip): Trip => ({
    ...trip,
    interCityTransports: trip.interCityTransports.map((t) => t.id === id ? { ...t, ...updates } : t),
  });

export const removeInterCityTransport = (id: string) =>
  (trip: Trip): Trip => ({
    ...trip,
    interCityTransports: trip.interCityTransports.filter((t) => t.id !== id),
  });

// ── Destination Actions ──

export const addCustomDestination = (dest: Destination) =>
  (trip: Trip): Trip => {
    if (trip.customDestinations.some((d) => d.id === dest.id)) return trip;
    return { ...trip, customDestinations: [...trip.customDestinations, dest] };
  };

export const addRestaurantComment = (comment: TripRestaurantComment) =>
  (trip: Trip): Trip => ({ ...trip, restaurantComments: [...trip.restaurantComments, comment] });

export const removeRestaurantComment = (commentId: string) =>
  (trip: Trip): Trip => ({
    ...trip,
    restaurantComments: trip.restaurantComments.filter((c) => c.id !== commentId),
  });

export const setTripName = (tripName: string) =>
  (trip: Trip): Trip => ({ ...trip, tripName });

export const setStartDate = (startDate: string) =>
  (trip: Trip): Trip => ({ ...trip, startDate });

export const setEndDate = (endDate: string) =>
  (trip: Trip): Trip => ({ ...trip, endDate });

export const setTotalBudget = (totalBudget: number) =>
  (trip: Trip): Trip => ({ ...trip, totalBudget });

export const setTripEmoji = (emoji: string) =>
  (trip: Trip): Trip => ({ ...trip, emoji });

export const setPendingCameraExpense = (pendingCameraExpense: { amount: number; currency: string } | null) =>
  (trip: Trip): Trip => ({ ...trip, pendingCameraExpense });

// ── Getters (pure functions) ──

export const getTotalCost = (trip: Trip): number =>
  trip.days.reduce((total, day) =>
    total + day.activities.reduce((sum, a) => sum + a.estimatedCost, 0), 0);

export const getDayCost = (trip: Trip, dayId: string): number => {
  const day = trip.days.find((d) => d.id === dayId);
  if (!day) return 0;
  return day.activities.reduce((sum, a) => sum + a.estimatedCost, 0);
};

export const getDayActualCost = (trip: Trip, dayId: string): number => {
  const day = trip.days.find((d) => d.id === dayId);
  if (!day) return 0;
  const activityExpenses = day.activities.reduce((sum, a) =>
    sum + (a.expenses || []).reduce((s, e) => s + e.amount, 0), 0);
  const globalDayExpenses = trip.expenses.filter((e) => e.dayId === dayId).reduce((sum, e) => sum + e.amount, 0);
  return activityExpenses + globalDayExpenses;
};

export const getTotalExpenses = (trip: Trip): number => {
  const globalExpenses = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
  const activityExpenses = trip.days.reduce((sum, day) =>
    sum + day.activities.reduce((s, a) =>
      s + (a.expenses || []).reduce((es, e) => es + e.amount, 0), 0), 0);
  return globalExpenses + activityExpenses;
};

export const getTotalExpensesByOwner = (trip: Trip, owner: ExpenseOwner | 'all'): number => {
  const filterOwner = (o: string) => owner === 'all' || o === owner;
  const globalExpenses = trip.expenses
    .filter((e) => filterOwner(e.owner))
    .reduce((sum, e) => sum + e.amount, 0);
  const activityExpenses = trip.days.reduce((sum, day) =>
    sum + day.activities.reduce((s, a) =>
      s + (a.expenses || []).filter((e) => filterOwner(e.owner)).reduce((es, e) => es + e.amount, 0), 0), 0);
  return globalExpenses + activityExpenses;
};

export const getRestaurantComments = (trip: Trip, restaurantId: string): TripRestaurantComment[] =>
  trip.restaurantComments.filter((c) => c.restaurantId === restaurantId);

export const getAllDestinations = (trip: Trip, staticDestinations: Destination[]): Destination[] =>
  [...staticDestinations, ...trip.customDestinations];
