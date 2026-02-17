import { z } from '@hono/zod-openapi';

export const ExchangeRatesResponseSchema = z.object({
  base: z.string().openapi({ example: 'EUR' }),
  date: z.string().openapi({ example: '2026-02-17' }),
  rates: z.record(z.string(), z.number()).openapi({
    example: { KRW: 1450, USD: 1.08, JPY: 160, CNY: 7.8 },
  }),
}).openapi('ExchangeRatesResponse');
