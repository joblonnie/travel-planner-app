import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { ExchangeRatesResponseSchema } from '../_schemas/exchange-rates.js';
import { ErrorResponseSchema } from '../_schemas/common.js';

const getExchangeRates = createRoute({
  operationId: 'getExchangeRates',
  method: 'get',
  path: '/exchange-rates',
  tags: ['Currency'],
  summary: 'Get current EUR exchange rates',
  description: 'Proxies Frankfurter API with 24h edge caching. Returns EUR-based rates for KRW, USD, JPY, CNY.',
  responses: {
    200: {
      content: { 'application/json': { schema: ExchangeRatesResponseSchema } },
      description: 'Current exchange rates',
    },
    502: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Upstream Frankfurter API error',
    },
    503: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Exchange rate service unavailable',
    },
  },
});

export const exchangeRatesRoute = new OpenAPIHono().openapi(
  getExchangeRates,
  async (c) => {
    try {
      const res = await fetch(
        'https://api.frankfurter.dev/v1/latest?base=EUR&symbols=KRW,USD,JPY,CNY'
      );
      if (!res.ok) {
        return c.json({ error: 'Failed to fetch rates' }, 502);
      }
      const data = await res.json();
      c.header(
        'Cache-Control',
        'public, s-maxage=86400, stale-while-revalidate=3600'
      );
      return c.json(data, 200);
    } catch {
      return c.json({ error: 'Exchange rate service unavailable' }, 503);
    }
  }
);
