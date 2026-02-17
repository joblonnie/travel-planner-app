import { pgTable, text, jsonb, timestamp, integer, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  provider: text('provider').notNull(),       // 'google' | 'kakao' | 'naver'
  providerId: text('provider_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('provider_idx').on(table.provider, table.providerId),
]);

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),                      // 40-char hex token
  userId: text('user_id').references(() => users.id).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const trips = pgTable('trips', {
  id: text('id').primaryKey(),                 // Trip.id (UUID)
  userId: text('user_id').references(() => users.id).notNull(),
  tripName: text('trip_name').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  data: jsonb('data').notNull(),               // 전체 Trip 객체 JSONB
  schemaVersion: integer('schema_version').default(6).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
