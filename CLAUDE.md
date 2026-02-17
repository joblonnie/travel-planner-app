# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start Vite dev server with HMR
- `npm run build` — Type-check with `tsc -b` then build with Vite
- `npm run lint` — ESLint across the project
- `npm run preview` — Preview production build locally
- No test framework is configured

## Path Alias

`@/` maps to `src/`. Configured in both `vite.config.ts` and `tsconfig.app.json`. All cross-feature imports use `@/` alias; within-feature imports use relative `./` paths.

## Directory Structure

```
src/
├── app/                          # App.tsx, main.tsx, index.css
├── components/                   # Shared UI (OwnerSelector, LoadingSpinner, CitySearch)
├── features/
│   ├── planner/                  # Day planner view
│   │   ├── components/           # DayContent, ActivityCard, ActivityFormModal, etc.
│   │   ├── hooks/                # useGeolocation, useLocalTime
│   │   └── index.ts
│   ├── budget/                   # Budget tracking + OCR
│   │   ├── components/           # BudgetPage, CameraOcrModal
│   │   ├── api/                  # useVisionOcr (TanStack Query mutation)
│   │   └── index.ts
│   ├── sidebar/                  # Day navigation sidebar + modals
│   │   ├── components/           # DaySidebar, DayFormModal, FlightFormModal, etc.
│   │   └── index.ts
│   ├── trips/                    # Trip management
│   │   ├── components/           # TripListPage, TripCreateModal, TripSettingsModal
│   │   └── index.ts
│   └── search/                   # Global search
│       ├── components/           # SearchModal
│       └── index.ts
├── hooks/                        # Shared hooks (useCurrency, useEscKey, useExchangeRates, useGoogleMaps, useTheme)
├── store/
│   ├── slices/                   # 7 Zustand slices (app, trip, day, activity, expense, transport, destination)
│   ├── helpers.ts                # currentTrip, updateCurrentTrip, mapDays, mapActivities
│   ├── useTripStore.ts           # Composed store (all slices)
│   └── useCurrentTrip.ts         # useTripData<T> selector hook
├── lib/                          # queryClient.ts (TanStack Query)
├── data/                         # Static destinations, tripPlan
├── i18n/                         # translations, useI18n
└── types/                        # index.ts
```

## Architecture

Single-page React PWA for honeymoon trip planning. Korean is the primary UI language with English and Spanish support.

**State management:** Zustand store with slice pattern (`src/store/slices/`) composed in `src/store/useTripStore.ts`. 7 slices: `appSlice` (UI state), `tripSlice` (CRUD), `daySlice`, `activitySlice`, `expenseSlice`, `transportSlice`, `destinationSlice`. Persisted in localStorage as `honeymoon-trip-store` (version 6).

**Server state:** TanStack Query manages server-fetched data (exchange rates via `useExchangeRates`, OCR via `useVisionOcr`). `QueryClientProvider` wraps the app in `src/app/main.tsx`.

**Backend:** Hono serverless API at `api/[[...route]].ts` (Vercel Functions). Routes: `GET /api/exchange-rates` (Frankfurter proxy), `POST /api/vision` (Google Cloud Vision OCR).

**Data flow:** Static destination/trip data lives in `src/data/` and seeds the store. Custom destinations appended via `addCustomDestination()`. All mutations go through Zustand actions — components use `useTripStore((s) => s.someField)` individual selectors.

**Two-page layout:** App.tsx switches between `DayContent` (planner) and `BudgetPage` via `currentPage` state. `DaySidebar` is an overlay for day navigation. Mobile bottom nav provides access to sidebar, camera, currency toggle, search, and settings.

**Expense system:** Two layers — per-activity expenses (`ActivityExpense[]` on each `ScheduledActivity`) and global expenses (`Expense[]` at store level). Both use `owner: ExpenseOwner` (a string). Owners are dynamic via `ExpenseOwnerConfig[]` in the store; `'shared'` is built-in and non-deletable.

**i18n:** `src/i18n/translations.ts` exports a flat record keyed by dot-notation strings. `useI18n()` returns memoized `t(key)` via `useCallback`. Use the `TranslationKey` type from `src/i18n/useI18n.ts` for type-safe translation key casts.

**Currency:** `useCurrency()` hook manages display currency (EUR/KRW/USD/JPY/CNY) with `useCallback`/`useMemo` memoization. All stored costs are in EUR.

## Zustand Slice Guide

Each slice is a `StateCreator<TripStore, [], [], SliceInterface>`. Slices use helpers from `store/helpers.ts`:
- `currentTrip(state)` — get current trip
- `updateCurrentTrip(state, updater)` — immutably update current trip
- `mapDays(trip, fn)` — map over days
- `mapActivities(trip, dayId, fn)` — map activities in a specific day

When adding new store actions, add them to the appropriate slice, update the slice's interface, and the composed `TripStore` type picks it up automatically.

## Re-render Prevention Rules

- **Always** use individual selectors: `useTripStore((s) => s.field)` — never destructure the whole store
- **Always** `useCallback`/`useMemo` for functions/computed values in hooks
- **Always** `memo()` for components receiving props that may cause unnecessary re-renders
- Getter functions (`getTotalCost`, etc.) are fine as-is since they're synchronous

## Key Types

All in `src/types/index.ts`. The 5 activity/content types: `'attraction' | 'shopping' | 'meal' | 'transport' | 'free'`. Adding a new type requires updating `ScheduledActivity.type`, `Content.type`, and translations.

## Styling

Tailwind CSS 4 with CSS variable-based theming in `src/app/index.css`. Three themes: Cloud Dancer (default), Classic Spain, Mocha Mousse — switched via `data-theme` attribute. Glassmorphism pattern: `backdrop-blur-xl`, `bg-white/70`, `rounded-2xl/3xl`. Mobile-first with `sm:` breakpoint for desktop. Bottom-sheet modals use `items-end` on mobile, `items-center` on `sm+`. Minimum touch targets: 44px.

## Gotchas

- Don't use `overflow-hidden` on cards that contain dropdown menus (clips them)
- Google Maps `isLoaded` is async — don't assume it's ready on mount
- Minimum text color: `text-gray-500` (lighter is unreadable)
- Minimum icon sizes: 12px info, 14px actions, 16px primary
- Base64 media in localStorage has ~5-10MB limit; warn users at 3MB
- Accommodation syncs across all days with the same `destinationId` via `updateAccommodationByDestination()`
- Store version is 6 — add migrations when changing persisted state shape
- `useExchangeRates` falls back to direct Frankfurter API if `/api/exchange-rates` proxy is unavailable (local dev)

## Environment Variables (Vercel)

- `GOOGLE_CLOUD_VISION_API_KEY` — for `/api/vision` OCR endpoint

## Deployment

Vercel with SPA rewrites + API routes configured in `vercel.json`. PWA via `vite-plugin-pwa` with Google Maps runtime caching. Hono API functions in `api/` directory.
