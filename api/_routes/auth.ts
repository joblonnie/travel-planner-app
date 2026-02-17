import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { Google, generateCodeVerifier, generateState } from 'arctic';
import { eq, and } from 'drizzle-orm';
import { getDb } from '../_db/index.ts';
import { users } from '../_db/schema.ts';
import {
  createSession,
  deleteSession,
  SESSION_COOKIE_NAME,
  COOKIE_OPTIONS,
} from '../_lib/session.ts';
import { optionalAuth } from '../_middleware/auth.ts';
import { UserResponseSchema, LogoutResponseSchema } from '../_schemas/auth.ts';
import { ErrorResponseSchema } from '../_schemas/common.ts';

function getGoogle() {
  return new Google(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.AUTH_REDIRECT_URI!,
  );
}

// --- Route definitions ---

const googleLogin = createRoute({
  operationId: 'googleLogin',
  method: 'get',
  path: '/auth/google',
  tags: ['Auth'],
  summary: 'Start Google OAuth flow',
  responses: {
    302: { description: 'Redirect to Google' },
  },
});

const googleCallback = createRoute({
  operationId: 'googleCallback',
  method: 'get',
  path: '/auth/google/callback',
  tags: ['Auth'],
  summary: 'Google OAuth callback',
  responses: {
    302: { description: 'Redirect to app after login' },
    400: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Invalid callback',
    },
  },
});

const getMe = createRoute({
  operationId: 'getMe',
  method: 'get',
  path: '/auth/me',
  tags: ['Auth'],
  summary: 'Get current authenticated user',
  responses: {
    200: {
      content: { 'application/json': { schema: UserResponseSchema } },
      description: 'Current user or null',
    },
  },
});

const logout = createRoute({
  operationId: 'logout',
  method: 'post',
  path: '/auth/logout',
  tags: ['Auth'],
  summary: 'Log out current user',
  responses: {
    200: {
      content: { 'application/json': { schema: LogoutResponseSchema } },
      description: 'Logged out',
    },
  },
});

// --- Route handlers ---

export const authRoute = new OpenAPIHono()
  .openapi(googleLogin, async (c) => {
    const google = getGoogle();
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const url = google.createAuthorizationURL(state, codeVerifier, [
      'openid',
      'email',
      'profile',
    ]);

    // Store state and codeVerifier in short-lived cookies
    setCookie(c, 'oauth_state', state, {
      ...COOKIE_OPTIONS,
      maxAge: 600, // 10 minutes
    });
    setCookie(c, 'oauth_code_verifier', codeVerifier, {
      ...COOKIE_OPTIONS,
      maxAge: 600,
    });

    return c.redirect(url.toString(), 302);
  })
  .openapi(googleCallback, async (c) => {
    const code = c.req.query('code');
    const state = c.req.query('state');
    const storedState = getCookie(c, 'oauth_state');
    const codeVerifier = getCookie(c, 'oauth_code_verifier');

    // Clean up OAuth cookies
    deleteCookie(c, 'oauth_state', { path: '/' });
    deleteCookie(c, 'oauth_code_verifier', { path: '/' });

    if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
      return c.json({ error: 'Invalid OAuth callback' }, 400);
    }

    const google = getGoogle();

    let tokens;
    try {
      tokens = await google.validateAuthorizationCode(code, codeVerifier);
    } catch {
      return c.json({ error: 'Failed to validate authorization code' }, 400);
    }

    // Fetch user info from Google
    const res = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokens.accessToken()}` },
    });
    if (!res.ok) {
      return c.json({ error: 'Failed to fetch user info' }, 400);
    }

    const googleUser = (await res.json()) as {
      sub: string;
      email: string;
      name?: string;
    };

    // Upsert user
    const db = getDb();
    const [existing] = await db
      .select()
      .from(users)
      .where(and(eq(users.provider, 'google'), eq(users.providerId, googleUser.sub)));

    let userId: string;
    if (existing) {
      userId = existing.id;
      // Update name/email if changed
      await db
        .update(users)
        .set({ name: googleUser.name ?? null, email: googleUser.email })
        .where(eq(users.id, existing.id));
    } else {
      userId = crypto.randomUUID();
      await db.insert(users).values({
        id: userId,
        email: googleUser.email,
        name: googleUser.name ?? null,
        provider: 'google',
        providerId: googleUser.sub,
      });
    }

    // Create session
    const sessionId = await createSession(userId);
    setCookie(c, SESSION_COOKIE_NAME, sessionId, COOKIE_OPTIONS);

    return c.redirect('/', 302);
  })
  .use('/auth/me', optionalAuth)
  .openapi(getMe, async (c) => {
    const userId = c.get('userId') as string | undefined;
    if (!userId) {
      return c.json({ user: null }, 200);
    }

    const db = getDb();
    const [user] = await db
      .select({ id: users.id, email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return c.json({ user: null }, 200);
    }

    return c.json({ user }, 200);
  })
  .openapi(logout, async (c) => {
    const sessionId = getCookie(c, SESSION_COOKIE_NAME);
    if (sessionId) {
      await deleteSession(sessionId);
    }
    deleteCookie(c, SESSION_COOKIE_NAME, { path: '/' });
    return c.json({ success: true }, 200);
  });
