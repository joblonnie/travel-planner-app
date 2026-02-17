import { handle } from 'hono/vercel';
import { app } from './_app.ts';

export default handle(app);
