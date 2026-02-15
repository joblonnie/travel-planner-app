export interface Destination {
  id: string;
  name: string;
  nameKo: string;
  lat: number;
  lng: number;
  timezone: string;
  description: string;
  tips: string[];
  phrases: Phrase[];
  restaurants: Restaurant[];
  contents: Content[];
  transportation: Transportation[];
  weatherInfo: WeatherInfo;
}

export interface Phrase {
  situation: string;
  spanish: string;
  pronunciation: string;
  korean: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  priceRange: string;
  rating: number;
  address: string;
  description: string;
  mustTry: string[];
  lat: number;
  lng: number;
}

export interface Content {
  id: string;
  name: string;
  nameKo: string;
  type: 'attraction' | 'shopping' | 'meal' | 'transport' | 'free';
  description: string;
  estimatedCost: number;
  currency: string;
  duration: string;
  address: string;
  lat: number;
  lng: number;
  imageUrl?: string;
  tips?: string[];
}

export interface Transportation {
  from: string;
  to: string;
  type: 'train' | 'bus' | 'taxi' | 'rental_car' | 'walk' | 'metro';
  duration: string;
  estimatedCost: number;
  currency: string;
  notes: string;
  bookingUrl?: string;
}

export interface WeatherInfo {
  avgTempHigh: number;
  avgTempLow: number;
  rainfall: string;
  description: string;
  clothing: string;
}

export interface FlightInfo {
  id: string;
  airline: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  confirmationNumber?: string;
  notes?: string;
}

export interface AccommodationInfo {
  id: string;
  name: string;
  address: string;
  checkIn?: string;
  checkOut?: string;
  confirmationNumber?: string;
  cost: number;
  currency: string;
  notes?: string;
  lat?: number;
  lng?: number;
}

export type ExpenseOwner = string;

export interface ExpenseOwnerConfig {
  id: string;
  name: string;
  color: string;
}

export interface ActivityExpense {
  id: string;
  amount: number;
  currency: string;
  description: string;
  createdAt: string;
  owner: ExpenseOwner;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  dataUrl: string;
  thumbnail?: string;
  caption?: string;
  createdAt: string;
}

export interface DayPlan {
  id: string;
  dayNumber: number;
  date: string;
  destination: string;
  destinationId: string;
  activities: ScheduledActivity[];
  notes: string;
  flights?: FlightInfo[];
  accommodation?: AccommodationInfo;
}

export interface ScheduledActivity {
  id: string;
  contentId?: string;
  name: string;
  nameKo: string;
  time: string;
  duration: string;
  type: 'attraction' | 'shopping' | 'meal' | 'transport' | 'free';
  estimatedCost: number;
  currency: string;
  isBooked: boolean;
  isCompleted?: boolean;
  isSkipped?: boolean;
  booking?: BookingInfo;
  lat?: number;
  lng?: number;
  memos?: string[];
  expenses?: ActivityExpense[];
  media?: MediaItem[];
}

export interface BookingInfo {
  confirmationNumber?: string;
  voucherUrl?: string;
  voucherFile?: string;
  notes: string;
  bookingDate?: string;
  provider?: string;
}

export interface ImmigrationSchedule {
  id: string;
  type: 'departure' | 'arrival';
  date: string;
  time: string;
  airport: string;
  airline?: string;
  flightNumber?: string;
  terminal?: string;
  gate?: string;
  confirmationNumber?: string;
  notes?: string;
}

export interface InterCityTransport {
  id: string;
  fromDayId: string;
  toDayId: string;
  type: 'train' | 'bus' | 'taxi' | 'rental_car' | 'flight';
  departure?: string;
  arrival?: string;
  departureTime?: string;
  arrivalTime?: string;
  operator?: string;
  confirmationNumber?: string;
  estimatedCost?: number;
  currency?: string;
  notes?: string;
}

