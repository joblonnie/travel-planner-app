import { z } from '@hono/zod-openapi';

// --- Nested schemas (mirrors src/types/index.ts) ---

const PhraseSchema = z.object({
  situation: z.string(),
  spanish: z.string(),
  pronunciation: z.string(),
  korean: z.string(),
});

const RestaurantSchema = z.object({
  id: z.string(),
  name: z.string(),
  cuisine: z.string(),
  priceRange: z.string(),
  rating: z.number(),
  address: z.string(),
  description: z.string(),
  mustTry: z.array(z.string()),
  lat: z.number(),
  lng: z.number(),
});

const ContentSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameKo: z.string(),
  type: z.enum(['attraction', 'shopping', 'meal', 'transport', 'free']),
  description: z.string(),
  estimatedCost: z.number(),
  currency: z.string(),
  duration: z.string(),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  imageUrl: z.string().optional(),
  tips: z.array(z.string()).optional(),
});

const TransportationSchema = z.object({
  from: z.string(),
  to: z.string(),
  type: z.enum(['train', 'bus', 'taxi', 'rental_car', 'walk', 'metro']),
  duration: z.string(),
  estimatedCost: z.number(),
  currency: z.string(),
  notes: z.string(),
  bookingUrl: z.string().optional(),
});

const WeatherInfoSchema = z.object({
  avgTempHigh: z.number(),
  avgTempLow: z.number(),
  rainfall: z.string(),
  description: z.string(),
  clothing: z.string(),
});

const DestinationSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameKo: z.string(),
  lat: z.number(),
  lng: z.number(),
  timezone: z.string(),
  description: z.string(),
  tips: z.array(z.string()),
  phrases: z.array(PhraseSchema),
  restaurants: z.array(RestaurantSchema),
  contents: z.array(ContentSchema),
  transportation: z.array(TransportationSchema),
  weatherInfo: WeatherInfoSchema,
});

const FlightInfoSchema = z.object({
  id: z.string(),
  airline: z.string(),
  flightNumber: z.string(),
  departure: z.string(),
  arrival: z.string(),
  departureTime: z.string(),
  arrivalTime: z.string(),
  confirmationNumber: z.string().optional(),
  notes: z.string().optional(),
});

const AccommodationInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  confirmationNumber: z.string().optional(),
  cost: z.number(),
  currency: z.string(),
  notes: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

const BookingInfoSchema = z.object({
  confirmationNumber: z.string().optional(),
  voucherUrl: z.string().optional(),
  voucherFile: z.string().optional(),
  notes: z.string(),
  bookingDate: z.string().optional(),
  provider: z.string().optional(),
});

const ActivityExpenseSchema = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.string(),
  description: z.string(),
  createdAt: z.string(),
  owner: z.string(),
});

const MediaItemSchema = z.object({
  id: z.string(),
  type: z.enum(['image', 'video']),
  dataUrl: z.string(),
  thumbnail: z.string().optional(),
  caption: z.string().optional(),
  createdAt: z.string(),
});

const ScheduledActivitySchema = z.object({
  id: z.string(),
  contentId: z.string().optional(),
  name: z.string(),
  nameKo: z.string(),
  time: z.string(),
  duration: z.string(),
  type: z.enum(['attraction', 'shopping', 'meal', 'transport', 'free']),
  estimatedCost: z.number(),
  currency: z.string(),
  isBooked: z.boolean(),
  isCompleted: z.boolean().optional(),
  isSkipped: z.boolean().optional(),
  booking: BookingInfoSchema.optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  memos: z.array(z.string()).optional(),
  expenses: z.array(ActivityExpenseSchema).optional(),
  media: z.array(MediaItemSchema).optional(),
});

const DayPlanSchema = z.object({
  id: z.string(),
  dayNumber: z.number(),
  date: z.string(),
  destination: z.string(),
  destinationId: z.string(),
  activities: z.array(ScheduledActivitySchema),
  notes: z.string(),
  flights: z.array(FlightInfoSchema).optional(),
  accommodation: AccommodationInfoSchema.optional(),
});

const ExpenseOwnerConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
});

const TripExpenseSchema = z.object({
  id: z.string(),
  dayId: z.string().optional(),
  category: z.enum(['accommodation', 'food', 'transport', 'attraction', 'shopping', 'entertainment', 'other']),
  amount: z.number(),
  currency: z.literal('EUR'),
  description: z.string(),
  date: z.string(),
  owner: z.string(),
});

const TripRestaurantCommentSchema = z.object({
  id: z.string(),
  restaurantId: z.string(),
  text: z.string(),
  rating: z.number().optional(),
  date: z.string(),
});

const ImmigrationScheduleSchema = z.object({
  id: z.string(),
  type: z.enum(['departure', 'arrival']),
  date: z.string(),
  time: z.string(),
  airport: z.string(),
  airline: z.string().optional(),
  flightNumber: z.string().optional(),
  terminal: z.string().optional(),
  gate: z.string().optional(),
  confirmationNumber: z.string().optional(),
  notes: z.string().optional(),
});

const InterCityTransportSchema = z.object({
  id: z.string(),
  fromDayId: z.string(),
  toDayId: z.string(),
  type: z.enum(['train', 'bus', 'taxi', 'rental_car', 'flight']),
  departure: z.string().optional(),
  arrival: z.string().optional(),
  departureTime: z.string().optional(),
  arrivalTime: z.string().optional(),
  operator: z.string().optional(),
  confirmationNumber: z.string().optional(),
  estimatedCost: z.number().optional(),
  currency: z.string().optional(),
  notes: z.string().optional(),
});

// --- Main Trip schema ---

export const TripSchema = z.object({
  id: z.string(),
  tripName: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  days: z.array(DayPlanSchema),
  currentDayIndex: z.number(),
  totalBudget: z.number(),
  expenses: z.array(TripExpenseSchema),
  restaurantComments: z.array(TripRestaurantCommentSchema),
  customDestinations: z.array(DestinationSchema),
  immigrationSchedules: z.array(ImmigrationScheduleSchema),
  interCityTransports: z.array(InterCityTransportSchema),
  owners: z.array(ExpenseOwnerConfigSchema),
  pendingCameraExpense: z.object({
    amount: z.number(),
    currency: z.string(),
  }).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  emoji: z.string().optional(),
}).openapi('Trip');

// --- API-specific schemas ---

export const TripListItemSchema = z.object({
  id: z.string(),
  tripName: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  emoji: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
}).openapi('TripListItem');

export const TripListResponseSchema = z.object({
  trips: z.array(TripListItemSchema),
}).openapi('TripListResponse');

export const TripListFullResponseSchema = z.object({
  trips: z.array(TripSchema),
}).openapi('TripListFullResponse');

export const TripResponseSchema = z.object({
  trip: TripSchema,
}).openapi('TripResponse');

export const TripParamsSchema = z.object({
  tripId: z.string().openapi({
    param: { name: 'tripId', in: 'path' },
    example: '550e8400-e29b-41d4-a716-446655440000',
  }),
});

export const DeleteResponseSchema = z.object({
  deleted: z.boolean(),
}).openapi('DeleteResponse');
