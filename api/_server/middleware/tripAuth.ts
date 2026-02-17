import { eq, and } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { tripMembers, trips } from '../db/schema.js';

export type MemberRole = 'owner' | 'editor' | 'viewer';

/**
 * Check if a user has a specific minimum role on a trip.
 * Role hierarchy: owner > editor > viewer
 */
const ROLE_LEVEL: Record<MemberRole, number> = {
  viewer: 1,
  editor: 2,
  owner: 3,
};

export async function getTripRole(tripId: string, userId: string): Promise<MemberRole | null> {
  const db = getDb();

  // Check trip_members first
  const [member] = await db
    .select({ role: tripMembers.role })
    .from(tripMembers)
    .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, userId)));

  if (member) return member.role as MemberRole;

  // Fallback: check trips.userId for legacy trips without trip_members rows
  const [trip] = await db
    .select({ userId: trips.userId })
    .from(trips)
    .where(eq(trips.id, tripId));

  if (trip && trip.userId === userId) return 'owner';

  return null;
}

export function hasMinRole(userRole: MemberRole | null, requiredRole: MemberRole): boolean {
  if (!userRole) return false;
  return ROLE_LEVEL[userRole] >= ROLE_LEVEL[requiredRole];
}
