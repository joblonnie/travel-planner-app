import { useEffect, useCallback, useState } from 'react';
import { useTripStore } from '@/store/useTripStore.ts';
import { apiClient } from '@/api/client.ts';

export function useAuth() {
  const setUser = useTripStore((s) => s.setUser);
  const [loading, setLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    apiClient.GET('/api/auth/me').then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
      }
    }).catch(() => {
      // Silently fail — user stays unauthenticated
    }).finally(() => {
      setLoading(false);
    });
  }, [setUser]);

  const login = useCallback(() => {
    window.location.href = '/api/auth/google';
  }, []);

  const logout = useCallback(async () => {
    await apiClient.POST('/api/auth/logout');
    setUser(null);
  }, [setUser]);

  return { login, logout, loading };
}
