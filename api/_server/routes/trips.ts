import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { eq, inArray } from 'drizzle-orm';
import type { z } from 'zod';
import type { AppEnv } from '../app.js';
import {
  TripSchema,
  TripListFullResponseSchema,
  TripResponseSchema,
  TripParamsSchema,
  DeleteResponseSchema,
} from '../schemas/trips.js';
import { ErrorResponseSchema } from '../schemas/common.js';
import { getDb } from '../db/index.js';
import { trips, tripMembers, users } from '../db/schema.js';
import { getTripRole, hasMinRole, type MemberRole } from '../middleware/tripAuth.js';

type TripData = z.infer<typeof TripSchema>;

// --- Route definitions ---

const listTrips = createRoute({
  operationId: 'listTrips',
  method: 'get',
  path: '/trips',
  tags: ['Trips'],
  summary: 'List all trips for current user',
  description: 'Returns owned and shared trips with full JSONB data.',
  responses: {
    200: {
      content: { 'application/json': { schema: TripListFullResponseSchema } },
      description: 'List of trips with full data',
    },
    401: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Unauthorized',
    },
  },
});

const getTrip = createRoute({
  operationId: 'getTrip',
  method: 'get',
  path: '/trips/{tripId}',
  tags: ['Trips'],
  summary: 'Get a single trip',
  description: 'Returns the full Trip object including all days, activities, and expenses.',
  request: {
    params: TripParamsSchema,
  },
  responses: {
    200: {
      content: { 'application/json': { schema: TripResponseSchema } },
      description: 'Trip details',
    },
    404: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Trip not found',
    },
    401: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Unauthorized',
    },
  },
});

const createTrip = createRoute({
  operationId: 'createTrip',
  method: 'post',
  path: '/trips',
  tags: ['Trips'],
  summary: 'Create a new trip',
  request: {
    body: {
      content: { 'application/json': { schema: TripSchema } },
      required: true,
    },
  },
  responses: {
    201: {
      content: { 'application/json': { schema: TripResponseSchema } },
      description: 'Trip created',
    },
    401: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Unauthorized',
    },
  },
});

const updateTrip = createRoute({
  operationId: 'updateTrip',
  method: 'put',
  path: '/trips/{tripId}',
  tags: ['Trips'],
  summary: 'Update a trip',
  description: 'Replaces the entire Trip JSONB data.',
  request: {
    params: TripParamsSchema,
    body: {
      content: { 'application/json': { schema: TripSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: TripResponseSchema } },
      description: 'Trip updated',
    },
    404: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Trip not found',
    },
    401: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Unauthorized',
    },
  },
});

const deleteTrip = createRoute({
  operationId: 'deleteTrip',
  method: 'delete',
  path: '/trips/{tripId}',
  tags: ['Trips'],
  summary: 'Delete a trip',
  request: {
    params: TripParamsSchema,
  },
  responses: {
    200: {
      content: { 'application/json': { schema: DeleteResponseSchema } },
      description: 'Trip deleted',
    },
    404: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Trip not found',
    },
    401: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Unauthorized',
    },
  },
});

// --- Route handlers ---
// Auth is enforced by requireAuth middleware in app.ts.
// userId is available via c.get('userId').

export const tripsRoute = new OpenAPIHono<AppEnv>()
  .openapi(listTrips, async (c) => {
    const userId = c.get('userId') as string;
    const db = getDb();

    // Get trips via trip_members (includes shared trips)
    const memberRows = await db
      .select({ tripId: tripMembers.tripId, role: tripMembers.role })
      .from(tripMembers)
      .where(eq(tripMembers.userId, userId));

    const roleMap: Record<string, MemberRole> = {};
    const tripIdSet = new Set<string>();
    for (const r of memberRows) {
      roleMap[r.tripId] = r.role as MemberRole;
      tripIdSet.add(r.tripId);
    }

    // Also include legacy trips (trips.userId but no trip_members row)
    const ownedRows = await db
      .select({ id: trips.id })
      .from(trips)
      .where(eq(trips.userId, userId));

    for (const r of ownedRows) {
      if (!tripIdSet.has(r.id)) {
        tripIdSet.add(r.id);
        roleMap[r.id] = 'owner';
      }
    }

    if (tripIdSet.size === 0) {
      return c.json({ trips: [] }, 200);
    }

    const rows = await db
      .select({ data: trips.data, id: trips.id })
      .from(trips)
      .where(inArray(trips.id, [...tripIdSet]));

    const tripList = rows.map((row) => ({
      ...(row.data as TripData),
      role: roleMap[row.id] ?? 'owner',
    }));

    // Batch fetch members for all trips
    const allTripIds = rows.map((r) => r.id);
    const memberRows2 = allTripIds.length > 0
      ? await db
          .select({
            tripId: tripMembers.tripId,
            userId: tripMembers.userId,
            role: tripMembers.role,
            name: users.name,
            email: users.email,
          })
          .from(tripMembers)
          .innerJoin(users, eq(tripMembers.userId, users.id))
          .where(inArray(tripMembers.tripId, allTripIds))
      : [];

    const membersMap: Record<string, Array<{ userId: string; name: string | null; email: string; role: string }>> = {};
    for (const m of memberRows2) {
      if (!membersMap[m.tripId]) membersMap[m.tripId] = [];
      membersMap[m.tripId].push({ userId: m.userId, name: m.name, email: m.email, role: m.role });
    }

    const tripListWithMembers = tripList.map((trip, idx) => ({
      ...trip,
      members: membersMap[rows[idx].id] ?? [],
    }));

    return c.json({ trips: tripListWithMembers }, 200);
  })
  .openapi(getTrip, async (c) => {
    const userId = c.get('userId') as string;
    const { tripId } = c.req.valid('param');
    const db = getDb();

    const role = await getTripRole(tripId, userId);
    if (!role) {
      return c.json({ error: 'Trip not found' }, 404);
    }

    const [row] = await db
      .select()
      .from(trips)
      .where(eq(trips.id, tripId));

    if (!row) {
      return c.json({ error: 'Trip not found' }, 404);
    }

    return c.json({ trip: { ...(row.data as TripData), role } }, 200);
  })
  .openapi(createTrip, async (c) => {
    const userId = c.get('userId') as string;
    const tripData = c.req.valid('json');
    const db = getDb();
    const now = new Date();

    await db.insert(trips).values({
      id: tripData.id,
      userId,
      tripName: tripData.tripName,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      data: tripData,
      schemaVersion: 6,
      createdAt: now,
      updatedAt: now,
    });

    // Add creator as owner in trip_members
    await db.insert(tripMembers).values({
      tripId: tripData.id,
      userId,
      role: 'owner',
      joinedAt: now,
    }).onConflictDoNothing();

    return c.json({ trip: tripData }, 201);
  })
  .openapi(updateTrip, async (c) => {
    const userId = c.get('userId') as string;
    const { tripId } = c.req.valid('param');
    const tripData = c.req.valid('json');
    const db = getDb();
    const now = new Date();

    const role = await getTripRole(tripId, userId);

    const [existing] = await db
      .select({ userId: trips.userId })
      .from(trips)
      .where(eq(trips.id, tripId));

    if (existing) {
      // Existing trip — need editor+ role
      if (!hasMinRole(role, 'editor')) {
        return c.json({ error: 'Trip not found' }, 404);
      }

      await db
        .update(trips)
        .set({
          tripName: tripData.tripName,
          startDate: tripData.startDate,
          endDate: tripData.endDate,
          data: tripData,
          updatedAt: now,
        })
        .where(eq(trips.id, tripId));
    } else {
      // Create new trip (upsert)
      await db.insert(trips).values({
        id: tripData.id,
        userId,
        tripName: tripData.tripName,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        data: tripData,
        schemaVersion: 6,
        createdAt: now,
        updatedAt: now,
      });

      // Add creator as owner in trip_members
      await db.insert(tripMembers).values({
        tripId: tripData.id,
        userId,
        role: 'owner',
        joinedAt: now,
      }).onConflictDoNothing();
    }

    return c.json({ trip: tripData }, 200);
  })
  .openapi(deleteTrip, async (c) => {
    const userId = c.get('userId') as string;
    const { tripId } = c.req.valid('param');
    const db = getDb();

    const role = await getTripRole(tripId, userId);
    if (!hasMinRole(role, 'owner')) {
      return c.json({ error: 'Trip not found' }, 404);
    }

    await db.delete(trips).where(eq(trips.id, tripId));

    return c.json({ deleted: true }, 200);
  });
