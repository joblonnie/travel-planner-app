import type { StateCreator } from 'zustand';
import type { ThemeId } from '@/types/index.ts';
import type { Language } from '@/i18n/translations.ts';
import type { Currency } from '@/hooks/useCurrency.ts';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface AppSlice {
  language: Language;
  currency: Currency;
  exchangeRate: number;
  theme: ThemeId;
  fetchedRates: Record<string, number> | null;
  ratesUpdatedAt: string | null;

  // Trip navigation (UI state — data lives in React Query)
  currentTripId: string;
  currentDayIndex: number;

  // Auth
  user: AuthUser | null;
  isAuthenticated: boolean;
  tripsLoaded: boolean;

  setLanguage: (lang: Language) => void;
  setCurrency: (currency: Currency) => void;
  setExchangeRate: (rate: number) => void;
  setTheme: (theme: ThemeId) => void;
  setFetchedRates: (rates: Record<string, number>) => void;
  setCurrentTripId: (id: string) => void;
  setCurrentDayIndex: (index: number) => void;
  setUser: (user: AuthUser | null) => void;
  setTripsLoaded: (loaded: boolean) => void;
}

export const createAppSlice: StateCreator<AppSlice> = (set) => ({
  language: 'ko' as Language,
  currency: 'EUR' as Currency,
  exchangeRate: 1450,
  theme: 'cloud-dancer' as ThemeId,
  fetchedRates: null,
  ratesUpdatedAt: null,

  // Trip navigation
  currentTripId: '',
  currentDayIndex: 0,

  // Auth
  user: null,
  isAuthenticated: false,
  tripsLoaded: false,

  setLanguage: (language) => set({ language }),
  setCurrency: (currency) => set({ currency }),
  setExchangeRate: (exchangeRate) => set({ exchangeRate }),
  setTheme: (theme) => {
    document.documentElement.dataset.theme = theme;
    set({ theme });
  },
  setFetchedRates: (rates) =>
    set({ fetchedRates: rates, ratesUpdatedAt: new Date().toISOString() }),
  setCurrentTripId: (currentTripId) => set({ currentTripId, currentDayIndex: 0 }),
  setCurrentDayIndex: (currentDayIndex) => set({ currentDayIndex }),
  setUser: (user) => set({ user, isAuthenticated: !!user, tripsLoaded: !user ? false : undefined }),
  setTripsLoaded: (loaded) => set({ tripsLoaded: loaded }),
});
