import { Hono } from 'hono';
import { handle } from 'hono/vercel';

const app = new Hono().basePath('/api');

app.get('/ping', (c) => c.json({ ok: true }));
app.get('/auth/me', (c) => c.json({ user: null }));

export default handle(app);
