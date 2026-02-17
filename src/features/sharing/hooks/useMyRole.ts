import { useTripData } from '@/store/useCurrentTrip.ts';

export type TripRole = 'owner' | 'editor' | 'viewer';

export function useMyRole(): TripRole {
  return useTripData((t) => t.role ?? 'owner');
}

export function useCanEdit(): boolean {
  const role = useMyRole();
  return role !== 'viewer';
}

export function useIsOwner(): boolean {
  const role = useMyRole();
  return role === 'owner';
}
