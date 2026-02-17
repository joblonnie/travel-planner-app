import { handle } from 'hono/vercel';
import { app } from './_server/app.js';

export default handle(app);
