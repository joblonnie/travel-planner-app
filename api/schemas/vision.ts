import { z } from '@hono/zod-openapi';

export const VisionRequestSchema = z.object({
  image: z.string().openapi({
    description: 'Base64 encoded image (with or without data URL prefix)',
    example: 'data:image/jpeg;base64,...',
  }),
}).openapi('VisionRequest');

export const VisionResponseSchema = z.object({
  text: z.string().openapi({
    description: 'Detected text from the image',
    example: 'Receipt total: €25.50',
  }),
}).openapi('VisionResponse');
