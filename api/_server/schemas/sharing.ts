import { z } from '@hono/zod-openapi';

// --- Request schemas ---

export const InviteRequestSchema = z.object({
  email: z.string().email(),
  role: z.enum(['editor', 'viewer']),
}).openapi('InviteRequest');

export const UpdateMemberRoleSchema = z.object({
  role: z.enum(['editor', 'viewer']),
}).openapi('UpdateMemberRole');

// --- Response schemas ---

export const MemberSchema = z.object({
  userId: z.string(),
  email: z.string(),
  name: z.string().nullable(),
  role: z.string(),
  joinedAt: z.string(),
}).openapi('Member');

export const MembersResponseSchema = z.object({
  members: z.array(MemberSchema),
}).openapi('MembersResponse');

export const InvitationSchema = z.object({
  id: z.string(),
  tripId: z.string(),
  tripName: z.string(),
  inviterName: z.string().nullable(),
  inviterEmail: z.string(),
  role: z.string(),
  status: z.string(),
  createdAt: z.string(),
  expiresAt: z.string(),
}).openapi('Invitation');

export const InvitationsResponseSchema = z.object({
  invitations: z.array(InvitationSchema),
}).openapi('InvitationsResponse');

export const InviteResponseSchema = z.object({
  invitation: InvitationSchema,
}).openapi('InviteResponse');

export const MemberResponseSchema = z.object({
  member: MemberSchema,
}).openapi('MemberResponse');

// --- Param schemas ---

export const TripIdParamSchema = z.object({
  tripId: z.string().openapi({
    param: { name: 'tripId', in: 'path' },
  }),
});

export const MemberUserIdParamSchema = z.object({
  tripId: z.string().openapi({
    param: { name: 'tripId', in: 'path' },
  }),
  userId: z.string().openapi({
    param: { name: 'userId', in: 'path' },
  }),
});

export const InvitationIdParamSchema = z.object({
  invitationId: z.string().openapi({
    param: { name: 'invitationId', in: 'path' },
  }),
});
