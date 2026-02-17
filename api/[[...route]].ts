import { app } from './_server/app.js';

export const config = {
  runtime: 'edge',
};

export default app.fetch;
