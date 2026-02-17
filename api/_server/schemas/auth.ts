import { z } from '@hono/zod-openapi';

export const UserResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string().nullable(),
  }).nullable(),
}).openapi('UserResponse');

export const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(50),
}).openapi('UpdateProfile');

export const UpdateProfileResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string().nullable(),
  }),
}).openapi('UpdateProfileResponse');

export const LogoutResponseSchema = z.object({
  success: z.boolean(),
}).openapi('LogoutResponse');
