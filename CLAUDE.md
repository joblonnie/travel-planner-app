# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start Vite dev server with HMR
- `npm run build` — Type-check with `tsc -b` then build with Vite
- `npm run lint` — ESLint across the project
- `npm run preview` — Preview production build locally
- No test framework is configured

## Architecture

Single-page React PWA for honeymoon trip planning. Korean is the primary UI language with English and Spanish support.

**State management:** Single Zustand store (`src/store/useTripStore.ts`) with `persist` middleware, stored in localStorage as `honeymoon-trip-store` (version 6). The store holds all trip data: days, activities, expenses, owners, immigration schedules, inter-city transports, theme, and UI state. Store migrations handle version upgrades (v2→v3→v4→v5→v6).

**Data flow:** Static destination/trip data lives in `src/data/` and seeds the store's initial state. Custom destinations are appended at runtime via `addCustomDestination()`. All mutations go through Zustand actions — components use `useTripStore((s) => s.someField)` selectors.

**Two-page layout:** App.tsx switches between `DayContent` (planner) and `BudgetPage` via `currentPage` state. `DaySidebar` is an overlay for day navigation. Mobile bottom nav provides access to sidebar, camera, currency toggle, search, and settings.

**Expense system:** Two layers — per-activity expenses (`ActivityExpense[]` on each `ScheduledActivity`) and global expenses (`Expense[]` at store level). Both use `owner: ExpenseOwner` (a string). Owners are dynamic via `ExpenseOwnerConfig[]` in the store; `'shared'` is built-in and non-deletable. Deleting an owner reassigns its expenses to `'shared'`.

**i18n:** `src/i18n/translations.ts` exports a flat record keyed by dot-notation strings. `useI18n()` returns `t(key)` that resolves against current language. Use the `TranslationKey` type from `src/i18n/useI18n.ts` for type-safe translation key casts.

**Currency:** `useCurrency()` hook manages display currency (EUR/KRW/USD/JPY) with conversion from EUR base. All stored costs are in EUR.

## Key Types

All in `src/types/index.ts`. The 5 activity/content types: `'attraction' | 'shopping' | 'meal' | 'transport' | 'free'`. Adding a new type requires updating `ScheduledActivity.type`, `Content.type`, and translations.

## Styling

Tailwind CSS 4 with CSS variable-based theming in `src/index.css`. Three themes: Cloud Dancer (default, Pantone 2026), Classic Spain, Mocha Mousse — switched via `data-theme` attribute on `<html>`. Token names: `primary`, `primary-dark`, `primary-light`, `secondary`, `secondary-dark`, `secondary-light`, `theme-dark`, `theme-navy`, `warm-*`. Theme stored in Zustand (`theme: ThemeId`) and synced to DOM via `useTheme()` hook in App.tsx. Glassmorphism pattern: `backdrop-blur-xl`, `bg-white/70`, `rounded-2xl/3xl`. Mobile-first with `sm:` breakpoint for desktop. Bottom-sheet modals use `items-end` on mobile, `items-center` on `sm+`. Minimum touch targets: 44px.

## Gotchas

- Don't use `overflow-hidden` on cards that contain dropdown menus (clips them)
- Google Maps `isLoaded` is async — don't assume it's ready on mount
- Minimum text color: `text-gray-500` (lighter is unreadable)
- Minimum icon sizes: 12px info, 14px actions, 16px primary
- Base64 media in localStorage has ~5-10MB limit; warn users at 3MB
- Accommodation syncs across all days with the same `destinationId` via `updateAccommodationByDestination()`
- Store version is 6 — add migrations when changing persisted state shape

## Deployment

Vercel with SPA rewrites configured in `vercel.json`. PWA via `vite-plugin-pwa` with Google Maps runtime caching.
