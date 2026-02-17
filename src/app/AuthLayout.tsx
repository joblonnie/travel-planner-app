import { Navigate, Outlet } from 'react-router-dom';
import { Plane } from 'lucide-react';
import { useSyncTrips } from '@/hooks/useSyncTrips.ts';
import { useTripStore } from '@/store/useTripStore.ts';
import { LoadingSpinner } from '@/components/LoadingSpinner.tsx';

export function AuthLayout() {
  useSyncTrips();
  const isAuthenticated = useTripStore((s) => s.isAuthenticated);
  const tripsLoaded = useTripStore((s) => s.tripsLoaded);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!tripsLoaded) {
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
