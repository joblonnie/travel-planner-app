import type { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { getSession, SESSION_COOKIE_NAME } from '../lib/session.ts';

/**
 * Require a valid session. Returns 401 if not authenticated.
 * Sets `c.set('userId', ...)` on success.
 */
export async function requireAuth(c: Context, next: Next) {
  const sessionId = getCookie(c, SESSION_COOKIE_NAME);
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const session = await getSession(sessionId);
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('userId', session.userId);
  await next();
}

/**
 * Optional auth: sets userId if session is valid, otherwise continues without it.
 * Used for endpoints like /api/auth/me.
 */
export async function optionalAuth(c: Context, next: Next) {
  const sessionId = getCookie(c, SESSION_COOKIE_NAME);
  if (sessionId) {
    const session = await getSession(sessionId);
    if (session) {
      c.set('userId', session.userId);
    }
  }
  await next();
}
