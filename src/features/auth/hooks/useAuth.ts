import { useCallback } from 'react';
import { useTripStore } from '@/store/useTripStore.ts';
import { apiClient } from '@/api/client.ts';

export function useAuth() {
  const setUser = useTripStore((s) => s.setUser);

  const login = useCallback(() => {
    window.location.href = '/api/auth/google';
  }, []);

  const logout = useCallback(async () => {
    await apiClient.POST('/api/auth/logout');
    setUser(null);
  }, [setUser]);

  return { login, logout };
}
