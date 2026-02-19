import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { exchangeRatesRoute } from './routes/exchange-rates.js';
import { visionRoute } from './routes/vision.js';
import { tripsRoute } from './routes/trips.js';
import { authRoute } from './routes/auth.js';
import { sharingRoute, publicSharingRoute } from './routes/sharing.js';
import { requireAuth } from './middleware/auth.js';

export type AppEnv = {
  Variables: {
    userId: string;
  };
};

export const app = new OpenAPIHono<AppEnv>({
  defaultHook: (result, c) => {
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return c.json({ error: firstIssue?.message ?? 'Validation error' }, 400);
    }
  },
}).basePath('/api');

// Public routes
app.route('/', exchangeRatesRoute);
app.route('/', visionRoute);
app.route('/', authRoute);
app.route('/', publicSharingRoute);  // Public invitation details

// Protected routes — require session auth
app.use('/trips/*', requireAuth);
app.use('/trips', requireAuth);
app.use('/invitations/*', requireAuth);
app.use('/invitations', requireAuth);
app.route('/', tripsRoute);
app.route('/', sharingRoute);

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
