import { pgTable, text, jsonb, timestamp, integer, uniqueIndex, primaryKey } from 'drizzle-orm/pg-core';

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

export const tripMembers = pgTable('trip_members', {
  tripId: text('trip_id').references(() => trips.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: text('role').notNull(),  // 'owner' | 'editor' | 'viewer'
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
}, (table) => [
  primaryKey({ columns: [table.tripId, table.userId] }),
]);

export const tripInvitations = pgTable('trip_invitations', {
  id: text('id').primaryKey(),
  tripId: text('trip_id').references(() => trips.id, { onDelete: 'cascade' }).notNull(),
  inviterId: text('inviter_id').references(() => users.id).notNull(),
  inviteeEmail: text('invitee_email').notNull(),
  role: text('role').notNull(),  // 'editor' | 'viewer'
  status: text('status').notNull().default('pending'),  // 'pending' | 'accepted' | 'declined'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
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
