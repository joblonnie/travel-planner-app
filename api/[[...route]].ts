import { Hono } from 'hono';
import { handle } from 'hono/vercel';

const app = new Hono().basePath('/api');

app.get('/ping', (c) => c.json({ ok: true, time: new Date().toISOString() }));

// Lazy import the full app only when needed
app.all('/*', async (c) => {
  const { app: fullApp } = await import('./_server/app.js');
  return fullApp.fetch(c.req.raw);
});

export default handle(app);
