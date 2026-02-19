import { z } from '@hono/zod-openapi';

export const ExchangeRatesResponseSchema = z.object({
  base: z.string().openapi({ example: 'KRW' }),
  date: z.string().openapi({ example: '2026-02-17' }),
  rates: z.record(z.string(), z.number()).openapi({
    example: { EUR: 0.00069, USD: 0.00074, JPY: 0.114, CNY: 0.0054 },
  }),
}).openapi('ExchangeRatesResponse');
