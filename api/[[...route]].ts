import { Hono } from 'hono';

export const config = {
  runtime: 'edge',
};

const app = new Hono().basePath('/api');

app.get('/ping', (c) => c.json({ ok: true }));
app.get('/auth/me', (c) => c.json({ user: null }));

export default app.fetch;
