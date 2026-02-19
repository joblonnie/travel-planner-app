import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { eq, and } from 'drizzle-orm';
import type { AppEnv } from '../app.js';
import { getDb } from '../db/index.js';
import { users } from '../db/schema.js';
import {
  createSession,
  deleteSession,
  getSession,
  SESSION_COOKIE_NAME,
  COOKIE_OPTIONS,
} from '../lib/session.js';
import { UserResponseSchema, LogoutResponseSchema, UpdateProfileSchema, UpdateProfileResponseSchema } from '../schemas/auth.js';
import { ErrorResponseSchema } from '../schemas/common.js';

// --- Edge-compatible OAuth helpers (replaces arctic) ---

function randomBase64url(bytes: number): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  // base64url encode
  let binary = '';
  for (const b of buf) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generateState(): string {
  return randomBase64url(32);
}

function generateCodeVerifier(): string {
  return randomBase64url(32);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  let binary = '';
  for (const b of new Uint8Array(digest)) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function getRedirectUri(requestUrl: string): string {
  if (process.env.AUTH_REDIRECT_URI) return process.env.AUTH_REDIRECT_URI;
  const url = new URL(requestUrl);
  return `${url.protocol}//${url.host}/api/auth/google/callback`;
}

function buildGoogleAuthUrl(state: string, codeChallenge: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    access_type: 'offline',
    prompt: 'consent',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function exchangeCodeForTokens(code: string, codeVerifier: string, redirectUri: string) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code,
      code_verifier: codeVerifier,
    }).toString(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Token exchange failed: ${errText}`);
  }

  return (await res.json()) as { access_token: string; id_token?: string };
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

const updateMe = createRoute({
  operationId: 'updateMe',
  method: 'patch',
  path: '/auth/me',
  tags: ['Auth'],
  summary: 'Update current user profile',
  request: {
    body: { content: { 'application/json': { schema: UpdateProfileSchema } } },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: UpdateProfileResponseSchema } },
      description: 'Updated user',
    },
    401: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Unauthorized',
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

export const authRoute = new OpenAPIHono<AppEnv>()
  .openapi(googleLogin, async (c) => {
    const redirectUri = getRedirectUri(c.req.url);
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const url = buildGoogleAuthUrl(state, codeChallenge, redirectUri);

    // Store state, codeVerifier, and redirectUri in short-lived cookies
    const oauthCookieOpts = { ...COOKIE_OPTIONS, maxAge: 600 };
    setCookie(c, 'oauth_state', state, oauthCookieOpts);
    setCookie(c, 'oauth_code_verifier', codeVerifier, oauthCookieOpts);
    setCookie(c, 'oauth_redirect_uri', redirectUri, oauthCookieOpts);

    return c.redirect(url, 302);
  })
  .openapi(googleCallback, async (c) => {
    const code = c.req.query('code');
    const state = c.req.query('state');
    const storedState = getCookie(c, 'oauth_state');
    const codeVerifier = getCookie(c, 'oauth_code_verifier');
    const redirectUri = getCookie(c, 'oauth_redirect_uri') ?? getRedirectUri(c.req.url);

    // Clean up OAuth cookies
    deleteCookie(c, 'oauth_state', { path: '/' });
    deleteCookie(c, 'oauth_code_verifier', { path: '/' });
    deleteCookie(c, 'oauth_redirect_uri', { path: '/' });

    if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
      return c.json({
        error: 'Invalid OAuth callback',
        debug: {
          hasCode: !!code,
          hasState: !!state,
          hasStoredState: !!storedState,
          stateMatch: state === storedState,
          hasCodeVerifier: !!codeVerifier,
        },
      }, 400);
    }

    let tokens;
    try {
      tokens = await exchangeCodeForTokens(code, codeVerifier, redirectUri);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Token exchange failed:', msg);
      return c.json({ error: 'Failed to validate authorization code', detail: msg }, 400);
    }

    // Fetch user info from Google
    const res = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
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

    return c.redirect('/trips', 302);
  })
  .openapi(getMe, async (c) => {
    // Inline optionalAuth: check session without requiring it
    const sessionId = getCookie(c, SESSION_COOKIE_NAME);
    if (sessionId) {
      const session = await getSession(sessionId);
      if (session) c.set('userId', session.userId);
    }
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
  .openapi(updateMe, async (c) => {
    const sessionId = getCookie(c, SESSION_COOKIE_NAME);
    if (!sessionId) return c.json({ error: 'Unauthorized' }, 401);
    const session = await getSession(sessionId);
    if (!session) return c.json({ error: 'Unauthorized' }, 401);

    const { name } = c.req.valid('json');
    const db = getDb();
    await db.update(users).set({ name }).where(eq(users.id, session.userId));

    const [user] = await db
      .select({ id: users.id, email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, session.userId));

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
