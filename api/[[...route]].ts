import { handle } from 'hono/vercel';
import { app } from './_app';

export default handle(app);
