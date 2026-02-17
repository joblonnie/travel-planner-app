import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Plane } from 'lucide-react';
import { useTripsQuery } from '@/hooks/useTripQuery.ts';
import { useTripStore } from '@/store/useTripStore.ts';
import { LoadingSpinner } from '@/components/LoadingSpinner.tsx';

export function AuthLayout() {
  const isAuthenticated = useTripStore((s) => s.isAuthenticated);
  const currentTripId = useTripStore((s) => s.currentTripId);
  const setCurrentTripId = useTripStore((s) => s.setCurrentTripId);
  const setTripsLoaded = useTripStore((s) => s.setTripsLoaded);

  const { data: trips, isLoading, isSuccess } = useTripsQuery(isAuthenticated);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-4 rounded-2xl shadow-lg">
            <Plane size={32} />
          </div>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return <Outlet />;
}
