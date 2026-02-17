import { useEffect } from 'react';
import { useTripStore } from '@/store/useTripStore.ts';

export function useTheme() {
  const theme = useTripStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return theme;
}
