import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { sessions } from '../db/schema.ts';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;   // 30 days
const EXTEND_THRESHOLD_MS = 24 * 60 * 60 * 1000;    // 1 day

export function generateSessionId(): string {
  return randomBytes(20).toString('hex'); // 40-char hex
}

export async function createSession(userId: string): Promise<string> {
  const id = generateSessionId();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const db = getDb();
  await db.insert(sessions).values({ id, userId, expiresAt });
  return id;
}

export async function getSession(sessionId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId));

  if (!row) return null;
  if (row.expiresAt < new Date()) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    return null;
  }

  // Sliding window: extend if >1 day has passed since creation
  const age = Date.now() - row.createdAt.getTime();
  if (age > EXTEND_THRESHOLD_MS) {
    const newExpiry = new Date(Date.now() + SESSION_TTL_MS);
    await db
      .update(sessions)
      .set({ expiresAt: newExpiry })
      .where(eq(sessions.id, sessionId));
  }

  return { userId: row.userId, expiresAt: row.expiresAt };
}

export async function deleteSession(sessionId: string) {
  const db = getDb();
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export const SESSION_COOKIE_NAME = 'session';

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'Lax' as const,
  path: '/',
  maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
};
