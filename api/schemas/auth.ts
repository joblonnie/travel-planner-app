import { z } from '@hono/zod-openapi';

export const UserResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string().nullable(),
  }).nullable(),
}).openapi('UserResponse');

export const LogoutResponseSchema = z.object({
  success: z.boolean(),
}).openapi('LogoutResponse');
