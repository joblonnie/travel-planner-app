import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { eq, and } from 'drizzle-orm';
import type { AppEnv } from '../app.js';
import {
  InviteRequestSchema,
  UpdateMemberRoleSchema,
  MembersResponseSchema,
  InvitationsResponseSchema,
  InviteResponseSchema,
  MemberResponseSchema,
  TripIdParamSchema,
  MemberUserIdParamSchema,
  InvitationIdParamSchema,
} from '../schemas/sharing.js';
import { ErrorResponseSchema } from '../schemas/common.js';
import { getDb } from '../db/index.js';
import { tripMembers, tripInvitations, trips, users } from '../db/schema.js';
import { getTripRole, hasMinRole } from '../middleware/tripAuth.js';

const DeletedResponseSchema = ErrorResponseSchema; // reuse for simple { error?: } shape

// --- Route definitions ---

const listMembers = createRoute({
  operationId: 'listTripMembers',
  method: 'get',
  path: '/trips/{tripId}/members',
  tags: ['Sharing'],
  summary: 'List trip members',
  request: { params: TripIdParamSchema },
  responses: {
    200: { content: { 'application/json': { schema: MembersResponseSchema } }, description: 'Members list' },
    403: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'Forbidden' },
  },
});

const inviteMember = createRoute({
  operationId: 'inviteTripMember',
  method: 'post',
  path: '/trips/{tripId}/invite',
  tags: ['Sharing'],
  summary: 'Invite a user by email',
  request: {
    params: TripIdParamSchema,
    body: { content: { 'application/json': { schema: InviteRequestSchema } }, required: true },
  },
  responses: {
    201: { content: { 'application/json': { schema: InviteResponseSchema } }, description: 'Invitation created' },
    400: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'Bad request' },
    403: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'Forbidden' },
  },
});

const removeMember = createRoute({
  operationId: 'removeTripMember',
  method: 'delete',
  path: '/trips/{tripId}/members/{userId}',
  tags: ['Sharing'],
  summary: 'Remove a member from trip',
  request: { params: MemberUserIdParamSchema },
  responses: {
    200: { content: { 'application/json': { schema: MemberResponseSchema } }, description: 'Member removed' },
    403: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'Forbidden' },
    404: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'Not found' },
  },
});

const updateMemberRole = createRoute({
  operationId: 'updateTripMemberRole',
  method: 'patch',
  path: '/trips/{tripId}/members/{userId}',
  tags: ['Sharing'],
  summary: 'Change member role',
  request: {
    params: MemberUserIdParamSchema,
    body: { content: { 'application/json': { schema: UpdateMemberRoleSchema } }, required: true },
  },
  responses: {
    200: { content: { 'application/json': { schema: MemberResponseSchema } }, description: 'Role updated' },
    403: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'Forbidden' },
    404: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'Not found' },
  },
});

const listMyInvitations = createRoute({
  operationId: 'listMyInvitations',
  method: 'get',
  path: '/invitations',
  tags: ['Sharing'],
  summary: 'List pending invitations for current user',
  responses: {
    200: { content: { 'application/json': { schema: InvitationsResponseSchema } }, description: 'Invitations' },
  },
});

const acceptInvitation = createRoute({
  operationId: 'acceptInvitation',
  method: 'post',
  path: '/invitations/{invitationId}/accept',
  tags: ['Sharing'],
  summary: 'Accept an invitation',
  request: { params: InvitationIdParamSchema },
  responses: {
    200: { content: { 'application/json': { schema: MemberResponseSchema } }, description: 'Accepted' },
    404: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'Not found' },
  },
});

const declineInvitation = createRoute({
  operationId: 'declineInvitation',
  method: 'post',
  path: '/invitations/{invitationId}/decline',
  tags: ['Sharing'],
  summary: 'Decline an invitation',
  request: { params: InvitationIdParamSchema },
  responses: {
    200: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'Declined' },
    404: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'Not found' },
  },
});

// --- Handlers ---

export const sharingRoute = new OpenAPIHono<AppEnv>()
  // GET /trips/:tripId/members
  .openapi(listMembers, async (c) => {
    const userId = c.get('userId') as string;
    const { tripId } = c.req.valid('param');

    const role = await getTripRole(tripId, userId);
    if (!hasMinRole(role, 'viewer')) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const db = getDb();
    const rows = await db
      .select({
        userId: tripMembers.userId,
        email: users.email,
        name: users.name,
        role: tripMembers.role,
        joinedAt: tripMembers.joinedAt,
      })
      .from(tripMembers)
      .innerJoin(users, eq(users.id, tripMembers.userId))
      .where(eq(tripMembers.tripId, tripId));

    return c.json({
      members: rows.map((r) => ({
        userId: r.userId,
        email: r.email,
        name: r.name,
        role: r.role,
        joinedAt: r.joinedAt.toISOString(),
      })),
    }, 200);
  })

  // POST /trips/:tripId/invite
  .openapi(inviteMember, async (c) => {
    const userId = c.get('userId') as string;
    const { tripId } = c.req.valid('param');
    const { email, role } = c.req.valid('json');

    const userRole = await getTripRole(tripId, userId);
    if (!hasMinRole(userRole, 'owner')) {
      return c.json({ error: 'Only owner can invite' }, 403);
    }

    const db = getDb();

    // Check if already a member
    const [inviteeUser] = await db.select().from(users).where(eq(users.email, email));
    if (inviteeUser) {
      const [existing] = await db
        .select()
        .from(tripMembers)
        .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, inviteeUser.id)));
      if (existing) {
        return c.json({ error: 'User is already a member' }, 400);
      }
    }

    // Get trip name and inviter info
    const [trip] = await db.select({ tripName: trips.tripName }).from(trips).where(eq(trips.id, tripId));
    const [inviter] = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, userId));

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // If pending invitation exists, update it (re-invite); otherwise create new
    const [existingInvite] = await db
      .select()
      .from(tripInvitations)
      .where(and(
        eq(tripInvitations.tripId, tripId),
        eq(tripInvitations.inviteeEmail, email),
        eq(tripInvitations.status, 'pending'),
      ));

    let invitationId: string;
    if (existingInvite) {
      invitationId = existingInvite.id;
      await db
        .update(tripInvitations)
        .set({ role, inviterId: userId, expiresAt })
        .where(eq(tripInvitations.id, existingInvite.id));
    } else {
      invitationId = crypto.randomUUID();
      await db.insert(tripInvitations).values({
        id: invitationId,
        tripId,
        inviterId: userId,
        inviteeEmail: email,
        role,
        status: 'pending',
        createdAt: now,
        expiresAt,
      });
    }

    return c.json({
      invitation: {
        id: invitationId,
        tripId,
        tripName: trip?.tripName ?? '',
        inviterName: inviter?.name ?? null,
        inviterEmail: inviter?.email ?? '',
        role,
        status: 'pending',
        createdAt: existingInvite?.createdAt.toISOString() ?? now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      },
    }, 201);
  })

  // DELETE /trips/:tripId/members/:userId
  .openapi(removeMember, async (c) => {
    const currentUserId = c.get('userId') as string;
    const { tripId, userId: targetUserId } = c.req.valid('param');

    const currentRole = await getTripRole(tripId, currentUserId);
    // Owner can remove anyone; members can remove themselves
    if (currentUserId !== targetUserId && !hasMinRole(currentRole, 'owner')) {
      return c.json({ error: 'Only owner can remove members' }, 403);
    }

    // Cannot remove the owner
    const targetRole = await getTripRole(tripId, targetUserId);
    if (targetRole === 'owner') {
      return c.json({ error: 'Cannot remove the owner' }, 400 as any);
    }

    const db = getDb();
    const deleted = await db
      .delete(tripMembers)
      .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, targetUserId)))
      .returning();

    if (deleted.length === 0) {
      return c.json({ error: 'Member not found' }, 404);
    }

    const [user] = await db.select({ email: users.email, name: users.name }).from(users).where(eq(users.id, targetUserId));

    return c.json({
      member: {
        userId: targetUserId,
        email: user?.email ?? '',
        name: user?.name ?? null,
        role: deleted[0].role,
        joinedAt: deleted[0].joinedAt.toISOString(),
      },
    }, 200);
  })

  // PATCH /trips/:tripId/members/:userId
  .openapi(updateMemberRole, async (c) => {
    const currentUserId = c.get('userId') as string;
    const { tripId, userId: targetUserId } = c.req.valid('param');
    const { role: newRole } = c.req.valid('json');

    const currentRole = await getTripRole(tripId, currentUserId);
    if (!hasMinRole(currentRole, 'owner')) {
      return c.json({ error: 'Only owner can change roles' }, 403);
    }

    // Cannot change owner role
    if (targetUserId === currentUserId) {
      return c.json({ error: 'Cannot change own role' }, 400 as any);
    }

    const db = getDb();
    const updated = await db
      .update(tripMembers)
      .set({ role: newRole })
      .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, targetUserId)))
      .returning();

    if (updated.length === 0) {
      return c.json({ error: 'Member not found' }, 404);
    }

    const [user] = await db.select({ email: users.email, name: users.name }).from(users).where(eq(users.id, targetUserId));

    return c.json({
      member: {
        userId: targetUserId,
        email: user?.email ?? '',
        name: user?.name ?? null,
        role: newRole,
        joinedAt: updated[0].joinedAt.toISOString(),
      },
    }, 200);
  })

  // GET /invitations
  .openapi(listMyInvitations, async (c) => {
    const userId = c.get('userId') as string;
    const db = getDb();

    // Find user's email
    const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId));
    if (!user) return c.json({ invitations: [] }, 200);

    const rows = await db
      .select({
        id: tripInvitations.id,
        tripId: tripInvitations.tripId,
        tripName: trips.tripName,
        inviterId: tripInvitations.inviterId,
        role: tripInvitations.role,
        status: tripInvitations.status,
        createdAt: tripInvitations.createdAt,
        expiresAt: tripInvitations.expiresAt,
      })
      .from(tripInvitations)
      .innerJoin(trips, eq(trips.id, tripInvitations.tripId))
      .where(and(
        eq(tripInvitations.inviteeEmail, user.email),
        eq(tripInvitations.status, 'pending'),
      ));

    // Enrich with inviter info
    const inviterIds = [...new Set(rows.map((r) => r.inviterId))];
    const inviters = inviterIds.length > 0
      ? await Promise.all(inviterIds.map(async (id) => {
          const [u] = await db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(eq(users.id, id));
          return u;
        }))
      : [];
    const inviterMap = Object.fromEntries(inviters.filter(Boolean).map((u) => [u!.id, u!]));

    const now = new Date();
    return c.json({
      invitations: rows
        .filter((r) => r.expiresAt > now) // filter expired
        .map((r) => ({
          id: r.id,
          tripId: r.tripId,
          tripName: r.tripName,
          inviterName: inviterMap[r.inviterId]?.name ?? null,
          inviterEmail: inviterMap[r.inviterId]?.email ?? '',
          role: r.role,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
          expiresAt: r.expiresAt.toISOString(),
        })),
    }, 200);
  })

  // POST /invitations/:invitationId/accept
  .openapi(acceptInvitation, async (c) => {
    const userId = c.get('userId') as string;
    const { invitationId } = c.req.valid('param');
    const db = getDb();

    // Get user email
    const [user] = await db.select({ email: users.email, name: users.name }).from(users).where(eq(users.id, userId));
    if (!user) return c.json({ error: 'User not found' }, 404);

    // Get invitation
    const [invitation] = await db
      .select()
      .from(tripInvitations)
      .where(eq(tripInvitations.id, invitationId));

    if (!invitation || invitation.inviteeEmail !== user.email) {
      return c.json({ error: 'Invitation not found' }, 404);
    }

    if (invitation.status !== 'pending') {
      return c.json({ error: 'Invitation already processed' }, 400 as any);
    }

    if (invitation.expiresAt < new Date()) {
      return c.json({ error: 'Invitation expired' }, 400 as any);
    }

    // Accept: add as member and update invitation status
    const now = new Date();
    await db.insert(tripMembers).values({
      tripId: invitation.tripId,
      userId,
      role: invitation.role,
      joinedAt: now,
    }).onConflictDoNothing();

    await db
      .update(tripInvitations)
      .set({ status: 'accepted' })
      .where(eq(tripInvitations.id, invitationId));

    return c.json({
      member: {
        userId,
        email: user.email,
        name: user.name,
        role: invitation.role,
        joinedAt: now.toISOString(),
      },
    }, 200);
  })

  // POST /invitations/:invitationId/decline
  .openapi(declineInvitation, async (c) => {
    const userId = c.get('userId') as string;
    const { invitationId } = c.req.valid('param');
    const db = getDb();

    const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId));
    if (!user) return c.json({ error: 'User not found' }, 404);

    const [invitation] = await db
      .select()
      .from(tripInvitations)
      .where(eq(tripInvitations.id, invitationId));

    if (!invitation || invitation.inviteeEmail !== user.email) {
      return c.json({ error: 'Invitation not found' }, 404);
    }

    if (invitation.status !== 'pending') {
      return c.json({ error: 'Invitation already processed' }, 400 as any);
    }

    await db
      .update(tripInvitations)
      .set({ status: 'declined' })
      .where(eq(tripInvitations.id, invitationId));

    return c.json({ error: '' }, 200); // empty error means success
  });
