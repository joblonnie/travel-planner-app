import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useTripsQuery } from '@/hooks/useTripQuery.ts';
import { useTripStore } from '@/store/useTripStore.ts';

export function AuthLayout() {
  const isAuthenticated = useTripStore((s) => s.isAuthenticated);
  const currentTripId = useTripStore((s) => s.currentTripId);
  const setCurrentTripId = useTripStore((s) => s.setCurrentTripId);
  const setTripsLoaded = useTripStore((s) => s.setTripsLoaded);

  const { data: trips, isSuccess } = useTripsQuery(isAuthenticated);

  // When trips load, set currentTripId if not already set
  useEffect(() => {
    if (!isSuccess || !trips) return;

    if (!currentTripId && trips.length > 0) {
      setCurrentTripId(trips[0].id);
    }
    setTripsLoaded(true);
  }, [isSuccess, trips, currentTripId, setCurrentTripId, setTripsLoaded]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Always render Outlet — AppLayout shows header immediately,
  // content area handles its own loading state
  return <Outlet />;
}
