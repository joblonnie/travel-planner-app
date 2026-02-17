import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Plane } from 'lucide-react';
import { useTripStore } from '@/store/useTripStore.ts';
import { useTheme } from '@/hooks/useTheme.ts';
import { LoadingSpinner } from '@/components/LoadingSpinner.tsx';
import { apiClient } from '@/api/client.ts';

export function RootLayout() {
  useTheme();
  const setUser = useTripStore((s) => s.setUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.GET('/api/auth/me').then(({ data }) => {
      if (data?.user) setUser(data.user);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [setUser]);

  if (loading) {
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
