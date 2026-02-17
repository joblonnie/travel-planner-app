import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { eq } from 'drizzle-orm';
import type { AppEnv } from '../app.js';
import {
  TripSchema,
  TripListResponseSchema,
  TripResponseSchema,
  TripParamsSchema,
  DeleteResponseSchema,
} from '../schemas/trips.js';
import { ErrorResponseSchema } from '../schemas/common.js';
import { getDb } from '../db/index.js';
import { trips } from '../db/schema.js';

// --- Route definitions ---

const listTrips = createRoute({
  operationId: 'listTrips',
  method: 'get',
  path: '/trips',
  tags: ['Trips'],
  summary: 'List all trips for current user',
  description: 'Returns trip metadata (id, name, dates, emoji) without full JSONB data.',
  responses: {
    200: {
      content: { 'application/json': { schema: TripListResponseSchema } },
      description: 'List of trips',
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
    const rows = await db
      .select({
        id: trips.id,
        tripName: trips.tripName,
        startDate: trips.startDate,
        endDate: trips.endDate,
        data: trips.data,
        createdAt: trips.createdAt,
        updatedAt: trips.updatedAt,
      })
      .from(trips)
      .where(eq(trips.userId, userId));

    const tripList = rows.map((row) => ({
      id: row.id,
      tripName: row.tripName,
      startDate: row.startDate,
      endDate: row.endDate,
      emoji: (row.data as Record<string, unknown>)?.emoji as string | undefined,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));

    return c.json({ trips: tripList }, 200);
  })
  .openapi(getTrip, async (c) => {
    const userId = c.get('userId') as string;
    const { tripId } = c.req.valid('param');
    const db = getDb();
    const [row] = await db
      .select()
      .from(trips)
      .where(eq(trips.id, tripId));

    if (!row || row.userId !== userId) {
      return c.json({ error: 'Trip not found' }, 404);
    }

    return c.json({ trip: row.data as Record<string, unknown> }, 200);
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

    return c.json({ trip: tripData }, 201);
  })
  .openapi(updateTrip, async (c) => {
    const userId = c.get('userId') as string;
    const { tripId } = c.req.valid('param');
    const tripData = c.req.valid('json');
    const db = getDb();

    const [existing] = await db
      .select({ userId: trips.userId })
      .from(trips)
      .where(eq(trips.id, tripId));

    if (!existing || existing.userId !== userId) {
      return c.json({ error: 'Trip not found' }, 404);
    }

    await db
      .update(trips)
      .set({
        tripName: tripData.tripName,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        data: tripData,
        updatedAt: new Date(),
      })
      .where(eq(trips.id, tripId));

    return c.json({ trip: tripData }, 200);
  })
  .openapi(deleteTrip, async (c) => {
    const userId = c.get('userId') as string;
    const { tripId } = c.req.valid('param');
    const db = getDb();

    const [existing] = await db
      .select({ userId: trips.userId })
      .from(trips)
      .where(eq(trips.id, tripId));

    if (!existing || existing.userId !== userId) {
      return c.json({ error: 'Trip not found' }, 404);
    }

    await db.delete(trips).where(eq(trips.id, tripId));

    return c.json({ deleted: true }, 200);
  });
