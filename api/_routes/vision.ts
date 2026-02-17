import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { VisionRequestSchema, VisionResponseSchema } from '../_schemas/vision.ts';
import { ErrorResponseSchema } from '../_schemas/common.ts';

const postVision = createRoute({
  operationId: 'ocrImage',
  method: 'post',
  path: '/vision',
  tags: ['OCR'],
  summary: 'Detect text in an image via Google Cloud Vision',
  description: 'Sends a base64-encoded image to Google Cloud Vision TEXT_DETECTION and returns extracted text.',
  request: {
    body: {
      content: { 'application/json': { schema: VisionRequestSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: VisionResponseSchema } },
      description: 'Extracted text from image',
    },
    400: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'No image provided',
    },
    500: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Vision API not configured or processing error',
    },
    502: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Google Vision API request failed',
    },
  },
});

export const visionRoute = new OpenAPIHono().openapi(
  postVision,
  async (c) => {
    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
    if (!apiKey) {
      return c.json({ error: 'Vision API not configured' }, 500);
    }

    try {
      const { image } = c.req.valid('json');
      if (!image) {
        return c.json({ error: 'No image provided' }, 400);
      }

      // Strip data URL prefix if present
      const base64 = image.replace(/^data:image\/\w+;base64,/, '');

      const res = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [
              {
                image: { content: base64 },
                features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
              },
            ],
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.text();
        console.error('Vision API error:', errorData);
        return c.json({ error: 'Vision API request failed' }, 502);
      }

      const data = await res.json();
      const text =
        data.responses?.[0]?.fullTextAnnotation?.text ??
        data.responses?.[0]?.textAnnotations?.[0]?.description ??
        '';

      return c.json({ text }, 200);
    } catch {
      return c.json({ error: 'OCR processing failed' }, 500);
    }
  }
);
