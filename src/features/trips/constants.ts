import { Crown, Pencil, Eye } from 'lucide-react';
import type { Trip } from '@/types/index.ts';

export const ROLE_BADGE = {
  owner: { icon: Crown, label: 'sharing.owner', color: 'text-amber-700 bg-amber-50 border-amber-300' },
  editor: { icon: Pencil, label: 'sharing.editor', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  viewer: { icon: Eye, label: 'sharing.viewer', color: 'text-gray-600 bg-gray-100 border-gray-200' },
} as const;

export function getProgress(trip: Trip): number {
  const totalActivities = trip.days.reduce((sum, d) => sum + d.activities.length, 0);
  if (totalActivities === 0) return 0;
  const completed = trip.days.reduce(
    (sum, d) => sum + d.activities.filter((a) => a.isCompleted || a.isSkipped).length,
    0
  );
  return Math.round((completed / totalActivities) * 100);
}

export function getTotalActivities(trip: Trip): number {
  return trip.days.reduce((sum, d) => sum + d.activities.length, 0);
}

export function getUniqueDestinations(trip: Trip): string[] {
  const dests = new Set(trip.days.map((d) => d.destination));
  return [...dests].filter(Boolean);
}
