# Hono.md - API Backend Architecture

## Overview

**Hono** is a lightweight, ultrafast web framework that can be used with Convex in two ways:

1. **Convex-Native** (Recommended): Hono runs inside Convex as HTTP actions (`convex/http.ts`)
2. **Separate API**: Hono runs on Cloudflare Workers, calls Convex via `ConvexHttpClient`

This document covers **both approaches** with complete implementation guides.

### Quick Comparison

| Feature | Convex-Native | Separate API |
|---------|---------------|--------------|
| **Deployment** | Single (Convex only) | Two (Workers + Convex) |
| **Access to Convex** | `c.env.runQuery/Mutation` | `ConvexHttpClient` (HTTP) |
| **Infrastructure** | Minimal | More complex |
| **Multi-Tenancy** | Limited | Full support |
| **Team Separation** | Harder | Easier |
| **API Reusability** | Limited | High (web/mobile/desktop) |
| **Official Pattern** | ✅ Yes ([Convex Stack](https://stack.convex.dev/hono-with-convex)) | Custom |
| **Best For** | Single-tenant apps | Multi-tenant platforms |

**Key Principle:** Use **Convex for ALL data storage** (including auth), not external databases.

**Official Documentation:**
- [Hono with Convex (Convex Stack)](https://stack.convex.dev/hono-with-convex) - Official pattern
- [Hono Documentation](https://hono.dev/) - Hono framework docs
- [convex-helpers](https://stack.convex.dev/convex-helpers) - Helper utilities

## Architecture Vision

```
┌─────────────────────────────────────────────────────────┐
│                   ASTRO FRONTEND                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Pages, Components, UI (User Customizable)       │  │
│  │  - Vibe code with Convex hooks                   │  │
│  │  - shadcn/ui components                          │  │
│  │  - Tailwind styling                              │  │
│  └────────────────┬─────────────────────────────────┘  │
└───────────────────┼─────────────────────────────────────┘
                    │ HTTP API Calls
                    ▼
┌─────────────────────────────────────────────────────────┐
│                    HONO API BACKEND                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Routes (Hono)                                   │  │
│  │  /api/auth/*   - Better Auth endpoints          │  │
│  │  /api/tokens/* - Token economy endpoints        │  │
│  │  /api/agents/* - Agent management               │  │
│  │  /api/content/*- Content creation                │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                     │
│  ┌────────────────┴─────────────────────────────────┐  │
│  │  Business Logic (Effect.ts Services)             │  │
│  │  - TokenService, AgentService, etc.              │  │
│  │  - Pure functional logic                         │  │
│  │  - Type-safe error handling                      │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                     │
│  ┌────────────────┴─────────────────────────────────┐  │
│  │  Data Layer (ConvexHttpClient)                   │  │
│  │  - Queries/mutations via HTTP                    │  │
│  │  - Better Auth → Convex adapter                  │  │
│  └────────────────┬─────────────────────────────────┘  │
└───────────────────┼─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│                  CONVEX BACKEND                         │
│  - 4-table ontology (entities, connections, events, tags)│
│  - Auth data stored as entities                         │
│  - Real-time subscriptions                              │
│  - Typed functions                                      │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

**Frontend:**
- Astro 5.14+ (SSR pages)
- React 19 (interactive components)
- shadcn/ui (UI components)
- Tailwind CSS v4 (styling)
- Effect.ts (client-side error handling)

**API Backend:**
- Hono (routing on Cloudflare Workers)
- Better Auth (authentication with Convex adapter)
- Effect.ts (100% business logic coverage - see [effect.md](../connections/effect.md))
- ConvexHttpClient (data access via Effect.ts wrapper)

**Data Backend:**
- Convex (real-time database)
- 4-table ontology (entities, connections, events, tags)

**Deployment:**
- Cloudflare Pages (Astro frontend)
- Cloudflare Workers (Hono API)
- Convex Cloud (database)

**Key Principle:** Effect.ts is used throughout the entire pipeline (frontend → API → services → data) for consistent error handling, composability, and testability. See **[effect.md](../connections/effect.md)** for complete Effect.ts coverage patterns.

## Two Deployment Approaches

There are **two ways** to use Hono with Convex, each with different trade-offs:

### Approach 1: Convex-Native (Recommended for Most Apps)

**Pattern:** Hono runs inside Convex as HTTP actions (`convex/http.ts`)

**Pros:**
- ✅ Single deployment (Convex only)
- ✅ Direct access to Convex functions via `c.env.runQuery/runMutation`
- ✅ No separate API infrastructure needed
- ✅ Simpler authentication (uses Convex auth directly)
- ✅ Official Convex pattern (see [stack.convex.dev/hono-with-convex](https://stack.convex.dev/hono-with-convex))

**Cons:**
- ❌ Less flexible for multi-tenancy
- ❌ Harder to separate concerns for large teams
- ❌ Couples API lifecycle to Convex

**Best For:**
- Single-tenant applications
- Simpler architectures
- Teams that want to minimize infrastructure

**Documentation:** See "Convex-Native Implementation" section below.

### Approach 2: Separate API (Cloudflare Workers)

**Pattern:** Hono runs on Cloudflare Workers, calls Convex via `ConvexHttpClient`

**Pros:**
- ✅ Complete separation of frontend and backend
- ✅ Multi-tenancy support (different frontends, shared API)
- ✅ Independent deployment of API and database
- ✅ API can be reused across web, mobile, desktop
- ✅ Better for large teams (frontend/backend specialization)

**Cons:**
- ❌ More infrastructure to manage (Workers + Convex)
- ❌ HTTP overhead calling Convex
- ❌ More complex authentication setup

**Best For:**
- Multi-tenant platforms
- Large teams with frontend/backend separation
- APIs serving multiple client types

**Documentation:** See "Separate API Implementation" section below.

---

## Convex-Native Implementation

This approach runs Hono **inside Convex** as HTTP actions, following the official Convex pattern.

### Setup

**1. Install dependencies:**
```bash
npm install hono convex-helpers @hono/zod-validator zod
```

**2. Create `convex/http.ts`:**
```typescript
import { Hono } from "hono";
import { HonoWithConvex, HttpRouterWithHono } from "convex-helpers/server/hono";
import { ActionCtx } from "./_generated/server";
import { api } from "./_generated/api";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

// Hono app with Convex context
const app: HonoWithConvex<ActionCtx> = new Hono();

// CORS middleware
app.use('/api/*', cors({
  origin: ['http://localhost:4321', 'https://your-frontend.pages.dev'],
  credentials: true,
}));

/**
 * GET /api/tokens/:id
 * Fetch token via Convex query
 */
app.get("/api/tokens/:id", async (c) => {
  const tokenId = c.req.param("id");

  // Direct access to Convex via c.env
  const token = await c.env.runQuery(api.queries.entities.get, {
    id: tokenId
  });

  if (!token || token.type !== "token") {
    return c.json({ error: "Token not found" }, 404);
  }

  return c.json(token);
});

/**
 * POST /api/tokens/purchase
 * Purchase tokens with validation
 */
app.post(
  "/api/tokens/purchase",
  zValidator(
    "json",
    z.object({
      tokenId: z.string(),
      amount: z.number().min(1).max(10000),
    })
  ),
  async (c) => {
    const { tokenId, amount } = c.req.valid("json");

    // Get user from auth (example - implement based on your auth strategy)
    const userId = c.req.header("X-User-Id");
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Call Convex mutation
    const result = await c.env.runMutation(api.mutations.tokens.purchase, {
      userId,
      tokenId,
      amount,
    });

    return c.json(result);
  }
);

/**
 * GET /api/messages/:userId
 * Dynamic route example
 */
app.get("/api/messages/:userId{[0-9]+}", async (c) => {
  const userId = c.req.param("userId");

  const messages = await c.env.runQuery(api.queries.messages.getByAuthor, {
    authorNumber: userId,
  });

  return c.json(messages);
});

// Export as Convex HTTP router
export default new HttpRouterWithHono(app);
```

**3. Update `convex.json`:**
```json
{
  "functions": "convex/",
  "node": {
    "externalPackages": ["hono"]
  }
}
```

### Authentication with Convex Auth

**Using Convex Auth in Hono routes:**

```typescript
import { getAuthUserId } from "@convex-dev/auth/server";

app.post("/api/protected", async (c) => {
  // Get authenticated user ID
  const userId = await getAuthUserId(c.env);

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Use userId in queries/mutations
  const data = await c.env.runQuery(api.queries.getUserData, { userId });

  return c.json(data);
});
```

### Cookie Handling

```typescript
import { setCookie, getCookie } from 'hono/cookie';

app.post("/api/session", async (c) => {
  const { token } = await c.req.json();

  // Set cookie
  setCookie(c, 'session_token', token, {
    httpOnly: true,
    secure: true,
    maxAge: 86400, // 1 day
    sameSite: 'Lax',
  });

  return c.json({ success: true });
});

app.get("/api/session", async (c) => {
  // Get cookie
  const token = getCookie(c, 'session_token');

  if (!token) {
    return c.json({ error: "No session" }, 401);
  }

  return c.json({ token });
});
```

### Error Handling

```typescript
app.onError((err, c) => {
  console.error(`${err}`);

  // Handle specific error types
  if (err.name === 'ConvexError') {
    return c.json({ error: err.message }, 400);
  }

  return c.json({ error: 'Internal Server Error' }, 500);
});
```

### Benefits of Convex-Native Approach

1. **Direct Function Access**: No HTTP overhead calling Convex
2. **Shared Type Safety**: Same types for routes and Convex functions
3. **Simple Deployment**: Single `npx convex deploy`
4. **Built-in Auth**: Easy integration with Convex Auth
5. **Environment Variables**: Access via `process.env` in actions

### When to Use Convex-Native

✅ **Use this approach when:**
- Building a single-tenant application
- Want simplest possible deployment
- Don't need multi-frontend support
- Team is focused on rapid development
- Frontend and backend tightly coupled

❌ **Don't use when:**
- Need multi-tenancy (different frontends per org)
- Want to reuse API across mobile/web/desktop
- Large team needs frontend/backend separation
- Need API versioning or complex routing

---

## Separate API Implementation (Cloudflare Workers)

This approach runs Hono on **Cloudflare Workers** separately from Convex, providing maximum flexibility.

## Why Hono + Separation?

### Problems Solved

1. **Frontend Lock-In**: Currently Astro is tightly coupled to backend logic
2. **Multi-Tenancy**: Organizations can't easily customize their frontend
3. **Development Speed**: Frontend changes require backend understanding
4. **API Portability**: Backend logic can't be reused across different frontends

### Benefits

1. **Rapid Prototyping**: Users can "vibe code" frontend with Convex hooks without touching backend
2. **Multi-Frontend Support**: Same API serves web, mobile, desktop apps
3. **Clear Contracts**: API endpoints define clear boundaries
4. **Independent Deployment**: Deploy frontend and backend separately
5. **Team Specialization**: Frontend devs work on UI, backend devs work on logic
6. **Single Database**: All data (including auth) in Convex - no separate database needed

## Implementation Pattern

### 1. Hono API Backend Structure

```
api/
├── src/
│   ├── index.ts              # Main Hono app
│   ├── auth.ts               # Better Auth with Convex adapter
│   ├── routes/
│   │   ├── auth.ts           # /api/auth/* routes
│   │   ├── tokens.ts         # /api/tokens/* routes
│   │   ├── agents.ts         # /api/agents/* routes
│   │   └── content.ts        # /api/content/* routes
│   ├── services/
│   │   ├── convex.ts         # Convex integration service
│   │   ├── token.ts          # Token business logic (Effect.ts)
│   │   ├── agent.ts          # Agent business logic (Effect.ts)
│   │   └── content.ts        # Content business logic (Effect.ts)
│   └── middleware/
│       ├── auth.ts           # Auth middleware
│       └── cors.ts           # CORS configuration
├── convex/                   # Shared Convex backend
│   ├── schema.ts             # 4-table ontology schema
│   ├── queries/
│   │   ├── auth.ts           # Auth queries (for Better Auth adapter)
│   │   ├── entities.ts
│   │   └── ...
│   ├── mutations/
│   │   ├── auth.ts           # Auth mutations (for Better Auth adapter)
│   │   ├── entities.ts
│   │   └── ...
│   └── services/             # Shared Effect.ts services
├── wrangler.toml             # Cloudflare Workers config
└── package.json
```

### 2. Installation

```bash
# Create Hono project
npm create hono@latest api
cd api

# Install dependencies
npm install hono
npm install better-auth
npm install convex
npm install effect
npm install @effect/schema

# For development
npm install -D @cloudflare/workers-types
npm install -D wrangler
```

### 3. Better Auth with Convex Adapter

#### `api/src/auth.ts`

```typescript
import { betterAuth } from 'better-auth';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';

type CloudflareBindings = {
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  CONVEX_URL: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
};

/**
 * Custom Convex adapter for Better Auth
 * Stores all auth data in Convex entities table
 */
function createConvexAdapter(convexUrl: string) {
  const client = new ConvexHttpClient(convexUrl);

  return {
    // User operations
    async createUser(data: any) {
      return client.mutation(api.mutations.auth.createUser, data);
    },
    async getUser(id: string) {
      return client.query(api.queries.auth.getUser, { id });
    },
    async getUserByEmail(email: string) {
      return client.query(api.queries.auth.getUserByEmail, { email });
    },
    async updateUser(id: string, data: any) {
      return client.mutation(api.mutations.auth.updateUser, { id, data });
    },
    async deleteUser(id: string) {
      return client.mutation(api.mutations.auth.deleteUser, { id });
    },

    // Session operations
    async createSession(data: any) {
      return client.mutation(api.mutations.auth.createSession, data);
    },
    async getSession(token: string) {
      return client.query(api.queries.auth.getSession, { token });
    },
    async updateSession(token: string, data: any) {
      return client.mutation(api.mutations.auth.updateSession, { token, data });
    },
    async deleteSession(token: string) {
      return client.mutation(api.mutations.auth.deleteSession, { token });
    },

    // Account operations (OAuth)
    async linkAccount(data: any) {
      return client.mutation(api.mutations.auth.linkAccount, data);
    },
    async unlinkAccount(data: any) {
      return client.mutation(api.mutations.auth.unlinkAccount, data);
    },

    // Verification tokens
    async createVerificationToken(data: any) {
      return client.mutation(api.mutations.auth.createVerificationToken, data);
    },
    async getVerificationToken(token: string) {
      return client.query(api.queries.auth.getVerificationToken, { token });
    },
    async deleteVerificationToken(token: string) {
      return client.mutation(api.mutations.auth.deleteVerificationToken, { token });
    },
  };
}

export const auth = (env: CloudflareBindings) => {
  return betterAuth({
    database: createConvexAdapter(env.CONVEX_URL),
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
    },
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
  });
};
```

### 4. Convex Auth Mutations/Queries

#### `convex/mutations/auth.ts`

```typescript
import { v } from 'convex/values';
import { mutation } from '../_generated/server';

/**
 * Auth mutations for Better Auth Convex adapter
 * Stores auth data in entities table following ontology
 */

export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert('entities', {
      type: 'user',
      name: args.name || args.email,
      properties: {
        email: args.email,
        image: args.image,
        emailVerified: args.emailVerified || false,
        role: 'user',
      },
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { id: userId, ...args };
  },
});

export const updateUser = mutation({
  args: {
    id: v.id('entities'),
    data: v.object({
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      emailVerified: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user || user.type !== 'user') {
      throw new Error('User not found');
    }

    await ctx.db.patch(args.id, {
      name: args.data.name || user.name,
      properties: {
        ...user.properties,
        ...args.data,
      },
      updatedAt: Date.now(),
    });

    return { id: args.id, ...args.data };
  },
});

export const deleteUser = mutation({
  args: { id: v.id('entities') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const createSession = mutation({
  args: {
    userId: v.id('entities'),
    token: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert('entities', {
      type: 'session',
      name: `Session for ${args.userId}`,
      properties: {
        userId: args.userId,
        token: args.token,
        expiresAt: args.expiresAt,
      },
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create connection: user → session
    await ctx.db.insert('connections', {
      fromEntityId: args.userId,
      toEntityId: sessionId,
      relationshipType: 'has_session',
      createdAt: Date.now(),
    });

    return { id: sessionId, ...args };
  },
});

export const updateSession = mutation({
  args: {
    token: v.string(),
    data: v.object({
      expiresAt: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('entities')
      .filter((q) =>
        q.and(
          q.eq(q.field('type'), 'session'),
          q.eq(q.field('properties.token'), args.token)
        )
      )
      .first();

    if (!session) {
      throw new Error('Session not found');
    }

    await ctx.db.patch(session._id, {
      properties: {
        ...session.properties,
        ...args.data,
      },
      updatedAt: Date.now(),
    });

    return { token: args.token, ...args.data };
  },
});

export const deleteSession = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('entities')
      .filter((q) =>
        q.and(
          q.eq(q.field('type'), 'session'),
          q.eq(q.field('properties.token'), args.token)
        )
      )
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return { success: true };
  },
});

// OAuth account linking
export const linkAccount = mutation({
  args: {
    userId: v.id('entities'),
    provider: v.string(),
    providerAccountId: v.string(),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const accountId = await ctx.db.insert('entities', {
      type: 'oauth_account',
      name: `${args.provider} account`,
      properties: {
        provider: args.provider,
        providerAccountId: args.providerAccountId,
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
      },
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Connection: user → oauth_account
    await ctx.db.insert('connections', {
      fromEntityId: args.userId,
      toEntityId: accountId,
      relationshipType: 'linked_account',
      createdAt: Date.now(),
    });

    return { id: accountId, ...args };
  },
});

export const unlinkAccount = mutation({
  args: {
    provider: v.string(),
    providerAccountId: v.string(),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db
      .query('entities')
      .filter((q) =>
        q.and(
          q.eq(q.field('type'), 'oauth_account'),
          q.eq(q.field('properties.provider'), args.provider),
          q.eq(q.field('properties.providerAccountId'), args.providerAccountId)
        )
      )
      .first();

    if (account) {
      await ctx.db.delete(account._id);
    }

    return { success: true };
  },
});

// Verification tokens
export const createVerificationToken = mutation({
  args: {
    identifier: v.string(), // email
    token: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const tokenId = await ctx.db.insert('entities', {
      type: 'verification_token',
      name: `Verification for ${args.identifier}`,
      properties: {
        identifier: args.identifier,
        token: args.token,
        expiresAt: args.expiresAt,
      },
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { id: tokenId, ...args };
  },
});

export const deleteVerificationToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const token = await ctx.db
      .query('entities')
      .filter((q) =>
        q.and(
          q.eq(q.field('type'), 'verification_token'),
          q.eq(q.field('properties.token'), args.token)
        )
      )
      .first();

    if (token) {
      await ctx.db.delete(token._id);
    }

    return { success: true };
  },
});
```

#### `convex/queries/auth.ts`

```typescript
import { v } from 'convex/values';
import { query } from '../_generated/server';

/**
 * Auth queries for Better Auth Convex adapter
 */

export const getUser = query({
  args: { id: v.id('entities') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user || user.type !== 'user') return null;

    return {
      id: user._id,
      email: user.properties.email,
      name: user.name,
      image: user.properties.image,
      emailVerified: user.properties.emailVerified,
    };
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('entities')
      .filter((q) =>
        q.and(
          q.eq(q.field('type'), 'user'),
          q.eq(q.field('properties.email'), args.email)
        )
      )
      .first();

    if (!user) return null;

    return {
      id: user._id,
      email: user.properties.email,
      name: user.name,
      image: user.properties.image,
      emailVerified: user.properties.emailVerified,
    };
  },
});

export const getSession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('entities')
      .filter((q) =>
        q.and(
          q.eq(q.field('type'), 'session'),
          q.eq(q.field('properties.token'), args.token)
        )
      )
      .first();

    if (!session) return null;

    // Check if expired
    if (session.properties.expiresAt < Date.now()) {
      await ctx.db.delete(session._id);
      return null;
    }

    return {
      id: session._id,
      userId: session.properties.userId,
      token: args.token,
      expiresAt: session.properties.expiresAt,
    };
  },
});

export const getVerificationToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const token = await ctx.db
      .query('entities')
      .filter((q) =>
        q.and(
          q.eq(q.field('type'), 'verification_token'),
          q.eq(q.field('properties.token'), args.token)
        )
      )
      .first();

    if (!token) return null;

    // Check if expired
    if (token.properties.expiresAt < Date.now()) {
      await ctx.db.delete(token._id);
      return null;
    }

    return {
      identifier: token.properties.identifier,
      token: args.token,
      expiresAt: token.properties.expiresAt,
    };
  },
});
```

### 5. Hono Main App

#### `api/src/index.ts`

```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from './auth';
import { tokenRoutes } from './routes/tokens';
import { agentRoutes } from './routes/agents';
import { contentRoutes } from './routes/content';

type CloudflareBindings = {
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  CONVEX_URL: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
};

const app = new Hono<{ Bindings: CloudflareBindings }>();

// CORS for Astro frontend
app.use('/*', cors({
  origin: ['http://localhost:4321', 'https://your-astro-frontend.pages.dev'],
  credentials: true,
}));

// Better Auth endpoints (handles sign-in, sign-up, OAuth, etc.)
app.on(['GET', 'POST'], '/api/auth/*', (c) => {
  return auth(c.env).handler(c.req.raw);
});

// Business logic routes
app.route('/api/tokens', tokenRoutes);
app.route('/api/agents', agentRoutes);
app.route('/api/content', contentRoutes);

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

export default app;
```

### 6. Convex Integration Service (Effect.ts Wrapper)

#### `api/src/services/convex.ts`

```typescript
import { Effect, Context, Layer } from 'effect';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';

/**
 * Convex Database Error
 */
export class ConvexDatabaseError {
  readonly _tag = 'ConvexDatabaseError';
  constructor(readonly operation: string, readonly cause: unknown) {}
}

/**
 * Convex Database Service (Effect.ts wrapper)
 * Provides typed access to Convex functions with Effect error handling
 *
 * See effect.md for complete Effect.ts integration patterns
 */
export class ConvexDatabase extends Context.Tag('ConvexDatabase')<
  ConvexDatabase,
  {
    // Generic operations
    query: <T>(name: any, args: any) => Effect.Effect<T, ConvexDatabaseError>;
    mutation: <T>(name: any, args: any) => Effect.Effect<T, ConvexDatabaseError>;
    action: <T>(name: any, args: any) => Effect.Effect<T, ConvexDatabaseError>;

    // Convenience methods for common operations
    getEntity: (id: Id<'entities'>) => Effect.Effect<any, ConvexDatabaseError>;
    listEntities: (type: string) => Effect.Effect<any[], ConvexDatabaseError>;
  }
>() {
  /**
   * Live implementation (production)
   */
  static readonly Live = Layer.effect(
    ConvexDatabase,
    Effect.gen(function* () {
      // Get Convex URL from environment
      const convexUrl = yield* Effect.sync(() => process.env.CONVEX_URL);

      if (!convexUrl) {
        return yield* Effect.fail(
          new ConvexDatabaseError('init', 'CONVEX_URL not set')
        );
      }

      const client = new ConvexHttpClient(convexUrl);

      return {
        // Generic query/mutation/action
        query: <T>(name: any, args: any) =>
          Effect.tryPromise({
            try: () => client.query(name, args) as Promise<T>,
            catch: (error) => new ConvexDatabaseError('query', error),
          }),

        mutation: <T>(name: any, args: any) =>
          Effect.tryPromise({
            try: () => client.mutation(name, args) as Promise<T>,
            catch: (error) => new ConvexDatabaseError('mutation', error),
          }),

        action: <T>(name: any, args: any) =>
          Effect.tryPromise({
            try: () => client.action(name, args) as Promise<T>,
            catch: (error) => new ConvexDatabaseError('action', error),
          }),

        // Convenience methods
        getEntity: (id: Id<'entities'>) =>
          Effect.tryPromise({
            try: () => client.query(api.queries.entities.get, { id }),
            catch: (error) => new ConvexDatabaseError('getEntity', error),
          }),

        listEntities: (type: string) =>
          Effect.tryPromise({
            try: () => client.query(api.queries.entities.list, { type }),
            catch: (error) => new ConvexDatabaseError('listEntities', error),
          }),
      };
    })
  );

  /**
   * Create layer from environment
   */
  static fromEnv = (convexUrl: string) =>
    Layer.succeed(ConvexDatabase, {
      query: <T>(name: any, args: any) => {
        const client = new ConvexHttpClient(convexUrl);
        return Effect.tryPromise({
          try: () => client.query(name, args) as Promise<T>,
          catch: (error) => new ConvexDatabaseError('query', error),
        });
      },
      mutation: <T>(name: any, args: any) => {
        const client = new ConvexHttpClient(convexUrl);
        return Effect.tryPromise({
          try: () => client.mutation(name, args) as Promise<T>,
          catch: (error) => new ConvexDatabaseError('mutation', error),
        });
      },
      action: <T>(name: any, args: any) => {
        const client = new ConvexHttpClient(convexUrl);
        return Effect.tryPromise({
          try: () => client.action(name, args) as Promise<T>,
          catch: (error) => new ConvexDatabaseError('action', error),
        });
      },
      getEntity: (id: Id<'entities'>) => {
        const client = new ConvexHttpClient(convexUrl);
        return Effect.tryPromise({
          try: () => client.query(api.queries.entities.get, { id }),
          catch: (error) => new ConvexDatabaseError('getEntity', error),
        });
      },
      listEntities: (type: string) => {
        const client = new ConvexHttpClient(convexUrl);
        return Effect.tryPromise({
          try: () => client.query(api.queries.entities.list, { type }),
          catch: (error) => new ConvexDatabaseError('listEntities', error),
        });
      },
    });
}
```

#### `api/src/lib/effect-handler.ts`

```typescript
import { Effect, Exit } from 'effect';
import type { Context } from 'hono';

/**
 * Run Effect program in Hono route handler
 * Automatically converts Effect errors to HTTP responses
 *
 * See effect.md for complete usage patterns
 */
export async function runEffectHandler<E, A>(
  c: Context,
  program: Effect.Effect<A, E>,
  errorHandler?: (error: E) => { status: number; body: any }
): Promise<Response> {
  const exit = await Effect.runPromiseExit(program);

  return Exit.match(exit, {
    onSuccess: (value) => c.json(value),
    onFailure: (cause) => {
      // Extract the error
      const failures = cause.failures;
      const error = failures.length > 0 ? failures[0] : null;

      // Use custom error handler if provided
      if (errorHandler && error) {
        const { status, body } = errorHandler(error as E);
        return c.json(body, status);
      }

      // Default error handling based on error tag
      if (error && typeof error === 'object' && '_tag' in error) {
        switch ((error as any)._tag) {
          case 'UnauthorizedError':
            return c.json({ error: 'Unauthorized' }, 401);
          case 'NotFoundError':
            return c.json({ error: 'Not found' }, 404);
          case 'ValidationError':
            return c.json({ error: (error as any).message }, 400);
          case 'QuotaExceededError':
            return c.json({
              error: (error as any).message,
              code: 'QUOTA_EXCEEDED'
            }, 403);
          case 'ConvexDatabaseError':
            return c.json({
              error: 'Database error',
              operation: (error as any).operation
            }, 500);
          default:
            return c.json({ error: 'Internal server error' }, 500);
        }
      }

      return c.json({ error: 'Internal server error' }, 500);
    },
  });
}

/**
 * Hono Context as Effect Service
 */
import { Context as EffectContext } from 'effect';

export class HonoContextService extends EffectContext.Tag('HonoContext')<
  HonoContextService,
  {
    req: Context['req'];
    env: any;
    orgId?: string;
    session?: any;
  }
>() {}

/**
 * Extract Hono context into Effect layer
 */
export const createHonoLayer = (c: Context) => {
  return Layer.succeed(HonoContextService, {
    req: c.req,
    env: c.env,
    orgId: c.get('orgId'),
    session: c.get('session'),
  });
};
```

### 7. Business Logic with Effect.ts

#### `api/src/services/token.ts`

```typescript
import { Effect } from 'effect';
import { ConvexService } from './convex';

/**
 * Token business logic service
 * Pure Effect.ts service - no side effects
 */

// Tagged errors
export class TokenNotFoundError {
  readonly _tag = 'TokenNotFoundError';
  constructor(readonly tokenId: string) {}
}

export class InsufficientFundsError {
  readonly _tag = 'InsufficientFundsError';
  constructor(readonly required: number, readonly available: number) {}
}

export class TokenService {
  constructor(private convex: ConvexService) {}

  /**
   * Purchase tokens with validation
   */
  purchase = (args: {
    userId: string;
    tokenId: string;
    amount: number;
  }): Effect.Effect<
    { success: true; newBalance: number },
    TokenNotFoundError | InsufficientFundsError
  > =>
    Effect.gen(this, function* () {
      // Validate token exists
      const token = yield* Effect.promise(() => this.convex.getEntity(args.tokenId));

      if (!token || token.type !== 'token') {
        return yield* Effect.fail(new TokenNotFoundError(args.tokenId));
      }

      // Calculate cost
      const cost = args.amount * token.properties.price;

      // TODO: Verify user has funds (integrate with payment provider)
      // For now, assume purchase succeeds

      // Execute purchase via Convex
      const result = yield* Effect.promise(() =>
        this.convex.purchaseTokens(args.userId, args.tokenId, args.amount)
      );

      return {
        success: true as const,
        newBalance: result.balance,
      };
    });

  /**
   * Get token balance
   */
  getBalance = (args: {
    userId: string;
    tokenId: string;
  }): Effect.Effect<number, TokenNotFoundError> =>
    Effect.gen(this, function* () {
      const balance = yield* Effect.promise(() =>
        this.convex.getTokenBalance(args.userId, args.tokenId)
      );

      return balance;
    });
}
```

### 8. API Routes with Effect.ts

#### `api/src/routes/tokens.ts`

```typescript
import { Hono } from 'hono';
import { Effect, Layer } from 'effect';
import { runEffectHandler, createHonoLayer, HonoContextService } from '../lib/effect-handler';
import { ConvexDatabase } from '../services/convex';
import { TokenService } from '../../../convex/services/tokens/token';
import { AuthService } from '../services/auth';
import { StripeProvider } from '../services/providers/stripe';
import { auth } from '../auth';

const app = new Hono();

/**
 * GET /api/tokens/:id
 * Fetch token details
 */
app.get('/:id', async (c) => {
  const tokenId = c.req.param('id');

  // Build Effect program
  const program = Effect.gen(function* () {
    const db = yield* ConvexDatabase;

    // Get token entity
    const token = yield* db.getEntity(tokenId);

    if (!token || token.type !== 'token') {
      return yield* Effect.fail(new NotFoundError('Token not found'));
    }

    return token;
  });

  // Create layer with dependencies
  const layer = ConvexDatabase.fromEnv(c.env.CONVEX_URL);

  // Run Effect program with automatic error handling
  return runEffectHandler(c, program.pipe(Effect.provide(layer)));
});

/**
 * POST /api/tokens/purchase
 * Purchase tokens (complete Effect.ts flow)
 */
app.post('/purchase', async (c) => {
  const { tokenId, amount } = await c.req.json();

  // Build Effect program
  const program = Effect.gen(function* () {
    // Get dependencies
    const ctx = yield* HonoContextService;
    const authService = yield* AuthService;
    const tokenService = yield* TokenService;

    // Verify authentication
    const session = yield* authService.getSession(ctx.req.raw.headers);
    if (!session) {
      return yield* Effect.fail(new UnauthorizedError());
    }

    // Check organization membership (if multi-tenant)
    if (ctx.orgId) {
      const isMember = yield* authService.checkOrgMembership({
        userId: session.user.id,
        orgId: ctx.orgId,
      });

      if (!isMember) {
        return yield* Effect.fail(
          new ForbiddenError('Not a member of this organization')
        );
      }
    }

    // Execute token purchase (Effect.ts service)
    const result = yield* tokenService.purchase({
      userId: session.user.id,
      tokenId,
      amount,
      orgId: ctx.orgId,
    });

    // Log success
    yield* Effect.logInfo('Token purchase completed', {
      userId: session.user.id,
      tokenId,
      amount,
      newBalance: result.newBalance,
    });

    return result;
  });

  // Create layer with all dependencies
  const layer = Layer.mergeAll(
    createHonoLayer(c),
    ConvexDatabase.fromEnv(c.env.CONVEX_URL),
    StripeProvider.Live,
    AuthService.Default,
    TokenService.Default
  );

  // Run Effect program (errors automatically converted to HTTP responses)
  return runEffectHandler(c, program.pipe(Effect.provide(layer)));
});

/**
 * GET /api/tokens/balance/:tokenId
 * Get user's token balance
 */
app.get('/balance/:tokenId', async (c) => {
  const tokenId = c.req.param('tokenId');

  const program = Effect.gen(function* () {
    const ctx = yield* HonoContextService;
    const authService = yield* AuthService;
    const tokenService = yield* TokenService;

    // Verify authentication
    const session = yield* authService.getSession(ctx.req.raw.headers);
    if (!session) {
      return yield* Effect.fail(new UnauthorizedError());
    }

    // Get balance
    const balance = yield* tokenService.getBalance({
      userId: session.user.id,
      tokenId,
      orgId: ctx.orgId,
    });

    return { balance };
  });

  const layer = Layer.mergeAll(
    createHonoLayer(c),
    ConvexDatabase.fromEnv(c.env.CONVEX_URL),
    AuthService.Default,
    TokenService.Default
  );

  return runEffectHandler(c, program.pipe(Effect.provide(layer)));
});

export const tokenRoutes = app;

/**
 * Tagged Errors
 */
class NotFoundError {
  readonly _tag = 'NotFoundError';
  constructor(readonly message: string) {}
}

class UnauthorizedError {
  readonly _tag = 'UnauthorizedError';
}

class ForbiddenError {
  readonly _tag = 'ForbiddenError';
  constructor(readonly message: string) {}
}
```

**Key Benefits of This Pattern:**

1. **Type-Safe Error Handling** - All errors are typed with `_tag`
2. **Automatic HTTP Conversion** - `runEffectHandler` converts Effect errors to HTTP responses
3. **Composable Logic** - Effect programs compose cleanly
4. **Testable** - Easy to test with mock layers
5. **Observable** - Built-in logging via `Effect.logInfo`

For complete Effect.ts patterns and examples, see **[effect.md](../connections/effect.md)**.

### 9. Astro Frontend Integration

#### `src/lib/api.ts` (API Client)

```typescript
/**
 * API client for Hono backend
 * Provides typed methods for all API endpoints
 */
export class APIClient {
  private baseURL: string;

  constructor(baseURL: string = import.meta.env.PUBLIC_API_URL) {
    this.baseURL = baseURL;
  }

  private async request(
    path: string,
    options: RequestInit = {}
  ): Promise<Response> {
    return fetch(`${this.baseURL}${path}`, {
      ...options,
      credentials: 'include', // Important for Better Auth cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }

  // Auth methods (Better Auth endpoints)
  async signIn(email: string, password: string) {
    return this.request('/api/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signUp(email: string, password: string, name: string) {
    return this.request('/api/auth/sign-up', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async signOut() {
    return this.request('/api/auth/sign-out', { method: 'POST' });
  }

  async getSession() {
    const res = await this.request('/api/auth/session');
    return res.json();
  }

  // Token methods
  async getToken(id: string) {
    const res = await this.request(`/api/tokens/${id}`);
    return res.json();
  }

  async purchaseTokens(tokenId: string, amount: number) {
    const res = await this.request('/api/tokens/purchase', {
      method: 'POST',
      body: JSON.stringify({ tokenId, amount }),
    });
    return res.json();
  }

  async getTokenBalance(tokenId: string) {
    const res = await this.request(`/api/tokens/balance/${tokenId}`);
    return res.json();
  }

  // Agent methods
  async createAgent(config: any) {
    const res = await this.request('/api/agents', {
      method: 'POST',
      body: JSON.stringify(config),
    });
    return res.json();
  }

  async getAgent(id: string) {
    const res = await this.request(`/api/agents/${id}`);
    return res.json();
  }

  // Content methods
  async createContent(content: any) {
    const res = await this.request('/api/content', {
      method: 'POST',
      body: JSON.stringify(content),
    });
    return res.json();
  }

  async listContent() {
    const res = await this.request('/api/content');
    return res.json();
  }
}

export const api = new APIClient();
```

### 10. Dual Integration Pattern (Hono + Convex + Effect.ts)

#### `src/components/features/tokens/TokenPurchase.tsx`

```typescript
import { useState } from 'react';
import { Effect } from 'effect';
import { useQuery } from 'convex/react';
import { api as convexApi } from '@/convex/_generated/api'; // Convex hooks
import { TokenClientService } from '@/lib/effects/token-client';
import { ClientLayer } from '@/lib/effects/layers';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Id } from '@/convex/_generated/dataModel';

/**
 * Token purchase component demonstrating triple integration:
 * 1. Convex hooks for real-time data (live balance updates)
 * 2. Effect.ts client service for API calls (type-safe errors)
 * 3. Hono API backend for business logic (auth, validation, payment)
 *
 * See effect.md for complete Effect.ts client patterns
 */
export function TokenPurchase({ tokenId }: { tokenId: Id<'entities'> }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Real-time token data via Convex (live updates!)
  const token = useQuery(convexApi.queries.tokens.get, { id: tokenId });

  /**
   * Purchase handler using Effect.ts client service
   * Provides type-safe error handling and automatic retry
   */
  const handlePurchase = async (amount: number) => {
    setLoading(true);

    // Build Effect program
    const program = Effect.gen(function* () {
      const tokenService = yield* TokenClientService;

      // Purchase tokens (calls Hono API)
      const result = yield* tokenService.purchase({ tokenId, amount });

      return result;
    });

    // Run Effect program with error handling
    const result = await Effect.runPromise(
      program.pipe(
        // Provide client dependencies
        Effect.provide(ClientLayer),

        // Automatic retry on network errors
        Effect.retry({
          times: 3,
          schedule: Effect.Schedule.exponential('1 second'),
        }),

        // Timeout after 30 seconds
        Effect.timeout('30 seconds'),

        // Handle success
        Effect.tap(() =>
          Effect.sync(() =>
            toast({
              title: 'Success!',
              description: `Purchased ${amount} tokens`,
            })
          )
        ),

        // Type-safe error handling
        Effect.catchTag('UnauthorizedError', () =>
          Effect.sync(() => {
            toast({
              title: 'Unauthorized',
              description: 'Please sign in to purchase tokens',
              variant: 'destructive',
            });
            window.location.href = '/signin';
            return { success: false as const };
          })
        ),

        Effect.catchTag('TokenPurchaseError', (error) =>
          Effect.sync(() => {
            toast({
              title: 'Purchase Failed',
              description: error.message,
              variant: 'destructive',
            });
            return { success: false as const };
          })
        ),

        Effect.catchTag('NetworkError', (error) =>
          Effect.sync(() => {
            toast({
              title: 'Network Error',
              description: 'Please check your connection and try again',
              variant: 'destructive',
            });
            return { success: false as const };
          })
        ),

        Effect.catchTag('TimeoutException', () =>
          Effect.sync(() => {
            toast({
              title: 'Request Timeout',
              description: 'Purchase took too long, please try again',
              variant: 'destructive',
            });
            return { success: false as const };
          })
        )
      )
    );

    setLoading(false);

    // Convex subscription automatically updates balance in real-time!
  };

  if (!token) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{token.name}</h2>
      <p className="text-muted-foreground">
        Price: ${token.properties.price}
      </p>

      {/* Real-time balance via Convex subscription */}
      <p className="text-sm text-muted-foreground">
        Your balance: {token.properties.balance || 0} tokens
      </p>

      <Button onClick={() => handlePurchase(100)} disabled={loading}>
        {loading ? 'Processing...' : 'Buy 100 Tokens'}
      </Button>
    </div>
  );
}
```

**Key Benefits of Triple Integration:**

1. **Real-Time Data** - Convex hooks provide live subscriptions (balance updates automatically)
2. **Type-Safe Errors** - Effect.ts client catches all error types with `catchTag`
3. **Automatic Retry** - Effect retries network failures with exponential backoff
4. **Timeout Protection** - Effect prevents hanging requests
5. **Composable Logic** - Effect programs combine cleanly
6. **Better UX** - User sees optimistic updates + error messages

For complete Effect.ts client patterns, see **[effect.md](../connections/effect.md)**.

### 11. Environment Variables

#### Hono API (`.dev.vars` / Cloudflare Workers settings)

```bash
# Better Auth
BETTER_AUTH_URL=http://localhost:8787
BETTER_AUTH_SECRET=your-secret-key

# Convex
CONVEX_URL=https://xxx.convex.cloud
CONVEX_DEPLOY_KEY=xxx

# OAuth (optional)
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
```

#### Astro Frontend (`.env`)

```bash
# Public URLs
PUBLIC_API_URL=http://localhost:8787
PUBLIC_CONVEX_URL=https://xxx.convex.cloud
```

## Development Workflow

### Terminal Setup

```bash
# Terminal 1: Hono API
cd api
bun run dev        # Runs on localhost:8787

# Terminal 2: Convex backend
npx convex dev     # Runs Convex functions locally

# Terminal 3: Astro frontend
cd ..
bun run dev        # Runs on localhost:4321
```

### "Vibe Code" Workflow

```
1. User designs UI mockup
2. User writes React component with Convex hooks
3. Component shows real-time data (no backend changes!)
4. User deploys frontend to Cloudflare Pages
5. Done! ✅
```

**Example: Building a dashboard page**

```astro
---
// src/pages/dashboard.astro
import CreatorStats from '@/components/dashboard/CreatorStats';
---

<Layout>
  <div class="container py-8">
    <h1>Dashboard</h1>

    {/* Real-time stats with Convex hooks - zero backend code! */}
    <CreatorStats client:load />
  </div>
</Layout>
```

```typescript
// src/components/dashboard/CreatorStats.tsx
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function CreatorStats() {
  // Real-time data - updates automatically!
  const stats = useQuery(api.queries.dashboard.getStats);

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardTitle>Revenue</CardTitle>
        <CardContent>${stats?.revenue || 0}</CardContent>
      </Card>
      {/* More cards... */}
    </div>
  );
}
```

## When to Use Hono API vs Convex Direct

### Use Hono API For:

- **Authentication**: Login, signup, password reset, OAuth
- **Business Logic**: Token purchases, payment processing, complex workflows
- **External APIs**: Stripe, Resend, third-party services
- **Heavy Computation**: Data aggregation, report generation
- **Rate Limiting**: API throttling, abuse prevention
- **REST API Contracts**: External integrations, mobile apps

### Use Convex Direct For:

- **Real-time Updates**: Live data, subscriptions, WebSocket-like behavior
- **Simple Queries**: Fetching entities, connections, events
- **Client-Side Logic**: Filtering, sorting, pagination
- **Optimistic Updates**: Instant UI feedback
- **Dashboard Data**: Live metrics, analytics

### Example: Token Purchase Flow

```
User clicks "Buy Tokens"
    ↓
Component calls Hono API (POST /api/tokens/purchase)
    ↓
Hono validates session (Better Auth)
    ↓
Effect.ts service processes business logic
    ↓
Service calls Convex mutation to update balance
    ↓
Convex updates entities table
    ↓
Convex real-time subscription pushes update to UI
    ↓
Component re-renders with new balance ✅
```

## Deployment

### Production Architecture

```
┌────────────────────────────────────────┐
│  Cloudflare Pages (Astro Frontend)     │
│  https://oneie.pages.dev        │
└──────────────┬─────────────────────────┘
               │ HTTPS
               ▼
┌────────────────────────────────────────┐
│  Cloudflare Workers (Hono API)         │
│  https://api.oneieworkers.dev  │
└──────────────┬─────────────────────────┘
               │ HTTPS
               ▼
┌────────────────────────────────────────┐
│  Convex Cloud (Database + Functions)   │
│  https://xxx.convex.cloud              │
└────────────────────────────────────────┘
```

### Deploy Commands

```bash
# 1. Deploy Convex functions
npx convex deploy

# 2. Deploy Hono API to Cloudflare Workers
cd api
wrangler deploy

# 3. Deploy Astro frontend to Cloudflare Pages
cd ..
bun run build
wrangler pages deploy dist --project-name=one-platform
```

## Migration Strategy

### Phase 1: Add Hono API (Parallel)

- Create `api/` directory
- Set up Hono with Better Auth + Convex adapter
- Keep existing Astro auth working
- Deploy Hono API to Workers
- Test API endpoints independently

### Phase 2: Migrate Authentication

- Update Astro to use Hono API for auth
- Migrate Better Auth logic from Astro to Hono
- Update all auth-related components
- Test session management across both systems

### Phase 3: Extract Business Logic

- Move token purchase logic to Hono routes + Effect.ts
- Move agent creation to Hono routes + Effect.ts
- Move content creation to Hono routes + Effect.ts
- Keep Convex for data layer + real-time subscriptions

### Phase 4: Optimize Frontend

- Remove server-side business logic from Astro
- Use API client for all mutations/actions
- Use Convex hooks for real-time data
- Deploy as static site to Pages (if desired)

### Phase 5: Multi-Tenant Support

- Add org-specific API keys
- Enable frontend customization per org
- Deploy custom frontends to subdomains
- Share same Hono API + Convex backend

## Integration with 4-Table Ontology

The Hono API fully respects the ontology:

### Entities

- Auth data (users, sessions, accounts) stored as entities
- All business objects (tokens, agents, content) are entities
- Hono routes operate on entities via Convex

### Connections

- User → session connections (has_session)
- User → OAuth account connections (linked_account)
- User → token connections (holds_tokens)
- Creator → content connections (authored)

### Events

- Every API call logs an event
- Auth events: sign_in, sign_up, sign_out
- Business events: tokens_purchased, agent_created, content_published
- Events enable audit trails and analytics

### Tags

- Entities can be tagged via API
- Tags enable categorization and filtering
- Query entities by tags

## Benefits Summary

1. **Single Database**: All data (including auth) in Convex - no external DB needed
2. **Type Safety**: End-to-end TypeScript from frontend → Hono → Effect.ts → Convex
3. **Real-Time**: Convex subscriptions for live updates
4. **Functional**: Pure Effect.ts services with explicit error handling
5. **Separation**: API backend vs frontend - deploy independently
6. **Multi-Tenant**: Custom frontends sharing backend
7. **Vibe Code**: Rapid frontend development with Convex hooks
8. **Performance**: Edge SSR on Cloudflare Workers
9. **Security**: Better Auth session management
10. **Scalability**: Independent scaling of frontend, API, and database

## Next Steps

1. Create `api/` directory for Hono backend
2. Implement Better Auth with Convex adapter
3. Create Convex auth mutations/queries (entities table)
4. Set up ConvexService integration layer
5. Implement Effect.ts business logic services
6. Create Hono API routes
7. Build Astro API client (`src/lib/api.ts`)
8. Update React components to use dual integration
9. Test authentication flow end-to-end
10. Deploy to Cloudflare Workers + Pages

**Result:** A clean, scalable architecture where users can rapidly customize frontends while the platform team maintains a robust, shared backend powered by Convex + Effect.ts.

---

## Decision Guide: Which Approach to Use?

### Choose Convex-Native When:

✅ **Simple Single-Tenant App**
- You're building one application for one organization
- Don't need multiple custom frontends
- Want fastest development velocity

✅ **MVP or Prototype**
- Need to validate idea quickly
- Minimum infrastructure complexity
- Can iterate rapidly

✅ **Small Team**
- 1-5 developers
- Everyone works on full-stack features
- Don't need strict frontend/backend separation

✅ **Direct Convex Access is Critical**
- Need real-time subscriptions in API routes
- Want to avoid HTTP overhead
- Leveraging Convex-specific features

**Example Use Cases:**
- SaaS dashboard for single company
- Internal tools
- Rapid prototypes
- Blog with custom API endpoints

### Choose Separate API When:

✅ **Multi-Tenant Platform**
- Different organizations need custom frontends
- Shared backend across tenants
- White-label solutions

✅ **Large Team**
- 10+ developers
- Clear frontend/backend team split
- Need independent deployment cycles

✅ **Multi-Client Architecture**
- API serves web, mobile, desktop
- Third-party integrations
- Public API for external developers

✅ **Complex Business Logic**
- Need Effect.ts services everywhere
- External API integrations (Stripe, OpenAI, etc.)
- Advanced error handling and retry logic

**Example Use Cases:**
- Creator economy platform (ONE)
- E-commerce with mobile app
- API-first products
- Enterprise SaaS with customization

### Hybrid Approach (Advanced)

You can use **both** approaches together:

```
Convex-Native (convex/http.ts):
  ├─ Internal admin endpoints
  ├─ Webhooks from external services
  └─ Simple read-only APIs

Separate API (Cloudflare Workers):
  ├─ Public-facing REST API
  ├─ Complex business logic (Effect.ts)
  └─ Multi-tenant routing
```

**Benefits:**
- Simple endpoints stay in Convex (less overhead)
- Complex logic in separate API (better separation)
- Best of both worlds

**Trade-offs:**
- More complexity to manage
- Two deployment processes
- Documentation overhead

### Migration Path

**Start with Convex-Native → Move to Separate API:**

1. **Phase 1:** Build MVP with Convex-Native
2. **Phase 2:** Extract business logic to Effect.ts services
3. **Phase 3:** Move services to separate Hono API on Workers
4. **Phase 4:** Keep simple endpoints in Convex, complex in Workers

**This is the recommended path for most projects.**

---

## Summary

**Convex-Native:**
- ✅ Official Convex pattern
- ✅ Simplest deployment
- ✅ Direct Convex access
- ❌ Limited multi-tenancy
- ❌ Harder to separate teams

**Separate API:**
- ✅ Multi-tenant support
- ✅ Team separation
- ✅ API reusability
- ❌ More infrastructure
- ❌ HTTP overhead to Convex

**Both approaches use:**
- Hono for routing
- Convex for data storage (4-table ontology)
- Effect.ts for business logic (optional but recommended)
- Type-safe validation (Zod)
- CORS middleware

**Official Resources:**
- [Hono with Convex](https://stack.convex.dev/hono-with-convex) - Convex Stack guide
- [convex-helpers](https://stack.convex.dev/convex-helpers) - Helper library
- [Hono Documentation](https://hono.dev/) - Hono framework
- [Effect.ts Documentation](https://effect.website/) - Functional programming

Choose the approach that matches your team size, architecture needs, and deployment preferences. When in doubt, **start with Convex-Native** and migrate to Separate API when you need multi-tenancy or team separation.
