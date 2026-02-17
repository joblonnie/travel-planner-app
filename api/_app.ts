import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { exchangeRatesRoute } from './_routes/exchange-rates.ts';
import { visionRoute } from './_routes/vision.ts';
import { tripsRoute } from './_routes/trips.ts';
import { authRoute } from './_routes/auth.ts';
import { requireAuth } from './_middleware/auth.ts';

export const app = new OpenAPIHono().basePath('/api');

// Public routes
app.route('/', exchangeRatesRoute);
app.route('/', visionRoute);
app.route('/', authRoute);

// Protected routes — require session auth
app.use('/trips/*', requireAuth);
app.use('/trips', requireAuth);
app.route('/', tripsRoute);

// OpenAPI 3.1 spec endpoint
app.doc31('/doc', {
  openapi: '3.1.0',
  info: {
    title: 'Travel Planner API',
    version: '1.0.0',
    description: 'API for travel planning application',
  },
});

// Swagger UI
app.get('/ui', swaggerUI({ url: '/api/doc' }));
