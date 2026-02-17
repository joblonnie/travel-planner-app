import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { RootLayout } from './RootLayout.tsx';
import { LoginPage } from '@/features/auth/components/LoginPage.tsx';
import { AuthLayout } from './AuthLayout.tsx';
import { AppLayout } from './AppLayout.tsx';
import { DayContent } from '@/features/planner/components/DayContent.tsx';
import { LoadingSpinner } from '@/components/LoadingSpinner.tsx';

const BudgetPage = lazy(() => import('@/features/budget/components/BudgetPage.tsx').then(m => ({ default: m.BudgetPage })));
const TripListPage = lazy(() => import('@/features/trips/components/TripListPage.tsx').then(m => ({ default: m.TripListPage })));

function LazyBudgetPage() {
  return <Suspense fallback={<LoadingSpinner />}><BudgetPage /></Suspense>;
}

function LazyTripListPage() {
  return <Suspense fallback={<LoadingSpinner />}><TripListPage /></Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      {
        element: <AuthLayout />,
        children: [{
          element: <AppLayout />,
          children: [
            { index: true, element: <DayContent /> },
            { path: 'budget', element: <LazyBudgetPage /> },
            { path: 'trips', element: <LazyTripListPage /> },
          ],
        }],
      },
    ],
  },
]);
