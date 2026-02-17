import { app } from './_app.ts';

const spec = app.getOpenAPI31Document({
  openapi: '3.1.0',
  info: {
    title: 'Travel Planner API',
    version: '1.0.0',
    description: 'API for travel planning application',
  },
});

console.log(JSON.stringify(spec, null, 2));
