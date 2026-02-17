# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start Vite dev server with HMR
- `npm run build` — Type-check with `tsc -b` then build with Vite
- `npm run lint` — ESLint across the project
- `npm run preview` — Preview production build locally
- `npm run gen:api` — Generate OpenAPI spec → FE types (`src/api/schema.d.ts`)
- `npm run db:generate` / `db:push` / `db:studio` — Drizzle migrations
- No test framework is configured

## Path Alias

`@/` maps to `src/`. Configured in both `vite.config.ts` and `tsconfig.app.json`. All cross-feature imports use `@/` alias; within-feature imports use relative `./` paths.

## Directory Structure

```
src/
├── app/                          # main.tsx, router.tsx, RootLayout, AuthLayout, AppLayout, index.css
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
│   ├── search/                   # Global search
│   │   ├── components/           # SearchModal
│   │   └── index.ts
│   ├── auth/                     # Authentication (Google SSO)
│   │   ├── components/           # LoginPage, LoginButton, UserMenu
│   │   └── hooks/                # useAuth
│   └── sharing/                  # Trip sharing & collaboration
│       ├── components/           # TripMembersSection, InvitationsBadge
│       ├── hooks/                # useMembers, useInvitations, useMyRole
│       └── index.ts
├── hooks/                        # Shared hooks (useCurrency, useTripActions, useTripMutation, useTripQuery, etc.)
├── store/
│   ├── slices/appSlice.ts        # Zustand UI state (theme, language, currency, auth)
│   ├── tripActions.ts            # Pure trip transformer functions (~50 actions)
│   ├── useTripStore.ts           # Zustand store (AppSlice only, version 8)
│   └── useCurrentTrip.ts         # useTripData<T> selector hook (React Query cache)
├── api/                          # client.ts, schema.d.ts (generated)
├── lib/                          # queryClient.ts (TanStack Query)
├── data/                         # Static destinations, tripPlan
├── i18n/                         # translations, useI18n
└── types/                        # index.ts
```

## Architecture

Single-page React PWA for honeymoon trip planning. Korean is the primary UI language with English and Spanish support.

**Data flow — React Query as source of truth:**
```
Server DB ←→ React Query (trips cache, optimistic update, debounced PUT)
Zustand → UI state only (currentTripId, currentDayIndex, theme, language, currency, auth)
```

- `useTripsQuery()` fetches trips from server → React Query cache (`TRIPS_QUERY_KEY`)
- `useTripData<T>(selector)` reads current trip from RQ cache (replaces old Zustand selectors)
- `useTripActions()` returns ~50 action functions that call `useTripMutation()`
- `useTripMutation()` does optimistic cache update → 2s debounced PUT to server
- `tripActions.ts` contains pure `(args) => (trip: Trip) => Trip` transformer functions
- Zustand (`appSlice` only) holds UI preferences persisted in localStorage as `travel-trip-store` (version 8)

**Backend:** Hono serverless API at `api/[[...route]].ts` (Vercel Functions). OpenAPI 3.1 with Swagger UI. Routes: trips (CRUD + sharing), auth (Google SSO), exchange-rates, vision (OCR).

**Trip Sharing:** Role-based access (owner > editor > viewer). `trip_members` table tracks roles. Email-based invitations with 7-day TTL. Frontend components in `src/features/sharing/`.

**Layout:** React Router v7 with layout chain: RootLayout → AuthLayout → AppLayout → Page. Routes: `/login`, `/` (DayContent), `/budget` (BudgetPage), `/trips` (TripListPage).

**Expense system:** Two layers — per-activity expenses (`ActivityExpense[]` on each `ScheduledActivity`) and global expenses (`Expense[]` on Trip). Both use `owner: ExpenseOwner`. Owners are dynamic via `ExpenseOwnerConfig[]`; `'shared'` is built-in and non-deletable.

**i18n:** `src/i18n/translations.ts` exports a flat record keyed by dot-notation strings. `useI18n()` returns memoized `t(key)` via `useCallback`. Use the `TranslationKey` type from `src/i18n/useI18n.ts` for type-safe translation key casts.

**Currency:** `useCurrency()` hook manages display currency (EUR/KRW/USD/JPY/CNY) with `useCallback`/`useMemo` memoization. All stored costs are in EUR.

## Adding Trip Actions

Trip mutations are pure functions in `src/store/tripActions.ts`:
```ts
export const addActivity = (dayId: string, activity: ScheduledActivity, insertIdx?: number) =>
  (trip: Trip): Trip => ({ ...trip, days: trip.days.map(d => ...) });
```

To add a new action:
1. Add the pure transformer to `tripActions.ts`
2. Expose it in `useTripActions()` hook (`src/hooks/useTripActions.ts`)
3. Components call `const { myAction } = useTripActions()` then `myAction(args)`

## Re-render Prevention Rules

- **Always** use individual selectors: `useTripStore((s) => s.field)` — never destructure the whole store
- **Always** use `useTripData((trip) => trip.specificField)` — select only what you need
- **Always** `useCallback`/`useMemo` for functions/computed values in hooks
- **Always** `memo()` for components receiving props that may cause unnecessary re-renders

## Key Types

All in `src/types/index.ts`. The 5 activity/content types: `'attraction' | 'shopping' | 'meal' | 'transport' | 'free'`. Trip has optional `role?: 'owner' | 'editor' | 'viewer'` for shared trips.

## Styling

Tailwind CSS 4 with CSS variable-based theming in `src/app/index.css`. Three themes: Cloud Dancer (default), Classic Spain, Mocha Mousse — switched via `data-theme` attribute. Glassmorphism pattern: `backdrop-blur-xl`, `bg-white/70`, `rounded-2xl/3xl`. Mobile-first with `sm:` breakpoint for desktop. Bottom-sheet modals use `items-end` on mobile, `items-center` on `sm+`. Minimum touch targets: 44px.

## Gotchas

- Don't use `overflow-hidden` on cards that contain dropdown menus (clips them)
- Google Maps `isLoaded` is async — don't assume it's ready on mount
- Minimum text color: `text-gray-500` (lighter is unreadable)
- Minimum icon sizes: 12px info, 14px actions, 16px primary
- Accommodation syncs across all days with the same `destinationId` via `updateAccommodationByDestination()`
- Store version is 8 — add migrations when changing persisted state shape
- `useExchangeRates` falls back to direct Frankfurter API if `/api/exchange-rates` proxy is unavailable (local dev)
- Vite dev server doesn't serve API routes → use `api/gen-spec.ts` for spec generation

## Environment Variables (Vercel)

- `GOOGLE_CLOUD_VISION_API_KEY` — for `/api/vision` OCR endpoint
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_REDIRECT_URI` — Google OAuth

## Deployment

Vercel with SPA rewrites + API routes configured in `vercel.json`. PWA via `vite-plugin-pwa` with Google Maps runtime caching. Hono API functions in `api/` directory.
