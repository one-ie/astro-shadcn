# Hono-Effect.md - Full Effect.ts Pipeline Coverage

## Overview

This document demonstrates **100% Effect.ts coverage** throughout the entire stack:

```
Frontend (React + Effect.ts)
    ↓
Hono API (Effect.ts route handlers)
    ↓
Business Logic (Effect.ts services)
    ↓
Convex Integration (Effect.ts wrappers)
    ↓
External Providers (Effect.ts providers)
```

**Key Principle:** Effect.ts is used **everywhere** - not just in business logic, but throughout the entire request pipeline for consistent error handling, composition, and testability.

## Architecture Vision

```
┌─────────────────────────────────────────────────────────┐
│               FRONTEND (REACT + EFFECT.TS)              │
│  ┌───────────────────────────────────────────────────┐  │
│  │  React Component                                  │  │
│  │  ↓                                                │  │
│  │  useEffect(() => {                                │  │
│  │    Effect.runPromise(                             │  │
│  │      TokenService.purchase({ tokenId, amount })   │  │
│  │        .pipe(Effect.provide(ClientLayer))         │  │
│  │    )                                              │  │
│  │  })                                               │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP Request
                     ▼
┌─────────────────────────────────────────────────────────┐
│            HONO API (EFFECT.TS HANDLERS)                │
│  ┌───────────────────────────────────────────────────┐  │
│  │  app.post('/tokens/purchase', async (c) => {      │  │
│  │    const program = Effect.gen(function* () {      │  │
│  │      const session = yield* AuthService;          │  │
│  │      const result = yield* TokenService.purchase; │  │
│  │      return result;                               │  │
│  │    });                                            │  │
│  │                                                   │  │
│  │    return Effect.runPromise(                      │  │
│  │      program.pipe(Effect.provide(ServerLayer))    │  │
│  │    );                                             │  │
│  │  });                                              │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│          BUSINESS LOGIC (EFFECT.TS SERVICES)            │
│  ┌───────────────────────────────────────────────────┐  │
│  │  export class TokenService extends Effect.Service │  │
│  │    purchase: (args) =>                            │  │
│  │      Effect.gen(function* () {                    │  │
│  │        const db = yield* ConvexDatabase;          │  │
│  │        const stripe = yield* StripeProvider;      │  │
│  │        // Pure functional logic                   │  │
│  │      })                                           │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│       CONVEX + PROVIDERS (EFFECT.TS WRAPPERS)           │
│  ┌────────────────────┐    ┌──────────────────────┐    │
│  │  ConvexDatabase    │    │  StripeProvider      │    │
│  │  (Effect wrapper)  │    │  (Effect wrapper)    │    │
│  └────────────────────┘    └──────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## 1. Frontend: Effect.ts in React

### Why Effect.ts in Frontend?

**Benefits:**
- Type-safe error handling
- Composable async operations
- Testable without mocking HTTP
- Consistent patterns with backend
- Built-in retry/timeout logic

### Basic Pattern: Effect.ts Client Service

#### `src/lib/effects/token-client.ts`

```typescript
import { Effect, Context } from 'effect';
import type { Id } from '@/convex/_generated/dataModel';

/**
 * HTTP Client provider (dependency)
 */
export class HttpClient extends Context.Tag('HttpClient')<
  HttpClient,
  {
    fetch: (url: string, options?: RequestInit) => Promise<Response>;
    baseURL: string;
  }
>() {}

/**
 * Tagged errors for frontend
 */
export class NetworkError {
  readonly _tag = 'NetworkError';
  constructor(readonly message: string) {}
}

export class TokenPurchaseError {
  readonly _tag = 'TokenPurchaseError';
  constructor(readonly code: string, readonly message: string) {}
}

export class UnauthorizedError {
  readonly _tag = 'UnauthorizedError';
}

/**
 * Token Client Service (Effect.ts)
 * Handles all token-related API calls
 */
export class TokenClientService extends Effect.Service<TokenClientService>()(
  'TokenClientService',
  {
    effect: Effect.gen(function* () {
      const http = yield* HttpClient;

      return {
        /**
         * Purchase tokens
         */
        purchase: (args: { tokenId: Id<'entities'>; amount: number }) =>
          Effect.gen(function* () {
            // Make HTTP request
            const response = yield* Effect.tryPromise({
              try: () =>
                http.fetch(`${http.baseURL}/api/tokens/purchase`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify(args),
                }),
              catch: (error) => new NetworkError(String(error)),
            });

            // Handle HTTP errors
            if (response.status === 401) {
              return yield* Effect.fail(new UnauthorizedError());
            }

            if (!response.ok) {
              const errorData = yield* Effect.tryPromise(() => response.json());
              return yield* Effect.fail(
                new TokenPurchaseError(
                  errorData.code || 'UNKNOWN',
                  errorData.error || 'Purchase failed'
                )
              );
            }

            // Parse success response
            const result = yield* Effect.tryPromise({
              try: () => response.json(),
              catch: () => new NetworkError('Failed to parse response'),
            });

            return result as { success: true; newBalance: number };
          }),

        /**
         * Get token balance
         */
        getBalance: (tokenId: Id<'entities'>) =>
          Effect.gen(function* () {
            const response = yield* Effect.tryPromise({
              try: () =>
                http.fetch(`${http.baseURL}/api/tokens/balance/${tokenId}`, {
                  credentials: 'include',
                }),
              catch: (error) => new NetworkError(String(error)),
            });

            if (response.status === 401) {
              return yield* Effect.fail(new UnauthorizedError());
            }

            if (!response.ok) {
              return yield* Effect.fail(
                new NetworkError('Failed to fetch balance')
              );
            }

            const data = yield* Effect.tryPromise(() => response.json());
            return data.balance as number;
          }),
      };
    }),
    dependencies: [HttpClient],
  }
) {}
```

### Frontend Layer (Dependency Injection)

#### `src/lib/effects/layers.ts`

```typescript
import { Layer } from 'effect';
import { HttpClient } from './token-client';
import { TokenClientService } from './token-client';

/**
 * HTTP Client implementation for browser
 */
export const HttpClientLive = Layer.succeed(HttpClient, {
  fetch: (url, options) => fetch(url, options),
  baseURL: import.meta.env.PUBLIC_API_URL || 'http://localhost:8787',
});

/**
 * Main client layer (combines all dependencies)
 */
export const ClientLayer = Layer.mergeAll(
  HttpClientLive,
  TokenClientService.Default
);
```

### React Component with Effect.ts

#### `src/components/features/tokens/TokenPurchase.tsx`

```typescript
import { useState, useEffect } from 'react';
import { Effect } from 'effect';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { TokenClientService, UnauthorizedError, TokenPurchaseError } from '@/lib/effects/token-client';
import { ClientLayer } from '@/lib/effects/layers';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Id } from '@/convex/_generated/dataModel';

interface TokenPurchaseProps {
  tokenId: Id<'entities'>;
}

export function TokenPurchase({ tokenId }: TokenPurchaseProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Real-time balance via Convex (for live updates)
  const token = useQuery(api.queries.tokens.get, { id: tokenId });

  /**
   * Purchase handler using Effect.ts
   */
  const handlePurchase = async (amount: number) => {
    setLoading(true);

    // Build Effect program
    const program = Effect.gen(function* () {
      const tokenService = yield* TokenClientService;

      // Purchase tokens
      const result = yield* tokenService.purchase({ tokenId, amount });

      return result;
    });

    // Run Effect program with error handling
    const result = await Effect.runPromise(
      program.pipe(
        Effect.provide(ClientLayer),
        Effect.tap(() =>
          Effect.sync(() =>
            toast({
              title: 'Success!',
              description: `Purchased ${amount} tokens`,
            })
          )
        ),
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
        )
      )
    );

    setLoading(false);
  };

  if (!token) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{token.name}</h2>
      <p className="text-muted-foreground">Price: ${token.properties.price}</p>

      {/* Real-time balance */}
      <p className="text-sm">Balance: {token.properties.balance || 0}</p>

      <Button onClick={() => handlePurchase(100)} disabled={loading}>
        {loading ? 'Processing...' : 'Buy 100 Tokens'}
      </Button>
    </div>
  );
}
```

### Advanced: Custom Hook for Effect.ts

#### `src/hooks/use-effect.ts`

```typescript
import { useState, useCallback } from 'react';
import { Effect } from 'effect';

/**
 * Custom hook to run Effect programs in React
 * Provides loading state and error handling
 */
export function useEffectRunner<E, A>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<E | null>(null);
  const [data, setData] = useState<A | null>(null);

  const run = useCallback(async (program: Effect.Effect<A, E>) => {
    setLoading(true);
    setError(null);

    try {
      const result = await Effect.runPromise(
        program.pipe(
          Effect.tapError((e) =>
            Effect.sync(() => setError(e))
          )
        )
      );
      setData(result);
      return result;
    } catch (e) {
      setError(e as E);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, data, run };
}
```

**Usage:**

```typescript
export function TokenPurchase({ tokenId }: TokenPurchaseProps) {
  const { run, loading, error } = useEffectRunner<
    UnauthorizedError | TokenPurchaseError | NetworkError,
    { success: true; newBalance: number }
  >();

  const handlePurchase = () => {
    const program = Effect.gen(function* () {
      const service = yield* TokenClientService;
      return yield* service.purchase({ tokenId, amount: 100 });
    }).pipe(Effect.provide(ClientLayer));

    run(program);
  };

  return (
    <div>
      {error && <Alert>{error._tag}: {error.message}</Alert>}
      <Button onClick={handlePurchase} disabled={loading}>
        Purchase
      </Button>
    </div>
  );
}
```

## 2. Hono API: Effect.ts Route Handlers

### Why Effect.ts in Hono?

**Benefits:**
- Consistent error handling across routes
- Composable middleware
- Type-safe context management
- Easy testing
- Automatic logging/tracing

### Effect.ts Hono Wrapper

#### `api/src/lib/effect-handler.ts`

```typescript
import { Effect, Exit } from 'effect';
import type { Context } from 'hono';

/**
 * Run Effect program in Hono route handler
 * Automatically converts Effect errors to HTTP responses
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
      const error = cause.defects[0] || cause.failures[0];

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
            return c.json({ error: error.message }, 400);
          case 'QuotaExceededError':
            return c.json({ error: error.message, code: 'QUOTA_EXCEEDED' }, 403);
          default:
            return c.json({ error: 'Internal server error' }, 500);
        }
      }

      return c.json({ error: 'Internal server error' }, 500);
    },
  });
}
```

### Hono Context as Effect Service

#### `api/src/services/hono-context.ts`

```typescript
import { Context as EffectContext, Effect } from 'effect';
import type { Context as HonoContext } from 'hono';
import type { CloudflareBindings } from '../index';

/**
 * Hono Context service (provides request context to Effect programs)
 */
export class HonoContextService extends EffectContext.Tag('HonoContext')<
  HonoContextService,
  {
    req: HonoContext['req'];
    env: CloudflareBindings;
    orgId?: string;
    session?: any;
  }
>() {}

/**
 * Extract Hono context into Effect layer
 */
export const createHonoLayer = (c: HonoContext) => {
  return Effect.succeed(HonoContextService, {
    req: c.req,
    env: c.env as CloudflareBindings,
    orgId: c.get('orgId'),
    session: c.get('session'),
  });
};
```

### Effect.ts Route Handler Example

#### `api/src/routes/tokens.ts`

```typescript
import { Hono } from 'hono';
import { Effect } from 'effect';
import { runEffectHandler, createHonoLayer } from '../lib/effect-handler';
import { TokenService } from '../../../convex/services/tokens/token';
import { AuthService } from '../services/auth';
import { ConvexDatabase } from '../services/convex-database';
import { StripeProvider } from '../services/stripe';
import { auth } from '../auth';

const app = new Hono();

// POST /api/tokens/purchase
app.post('/purchase', async (c) => {
  // Parse request body
  const body = await c.req.json();
  const { tokenId, amount } = body;

  // Build Effect program
  const program = Effect.gen(function* () {
    // Get dependencies
    const honoCtx = yield* HonoContextService;
    const authService = yield* AuthService;
    const tokenService = yield* TokenService;

    // Verify authentication
    const session = yield* authService.getSession(honoCtx.req.raw.headers);
    if (!session) {
      return yield* Effect.fail(new UnauthorizedError());
    }

    // Verify organization membership (if multi-tenant)
    if (honoCtx.orgId) {
      const isMember = yield* authService.checkOrgMembership({
        userId: session.user.id,
        orgId: honoCtx.orgId,
      });

      if (!isMember) {
        return yield* Effect.fail(new ForbiddenError('Not a member of this organization'));
      }
    }

    // Purchase tokens
    const result = yield* tokenService.purchase({
      userId: session.user.id,
      tokenId,
      amount,
      orgId: honoCtx.orgId,
    });

    // Log event
    yield* Effect.logInfo('Token purchase successful', {
      userId: session.user.id,
      tokenId,
      amount,
      newBalance: result.newBalance,
    });

    return result;
  });

  // Create layer with all dependencies
  const layer = Effect.mergeAll(
    createHonoLayer(c),
    ConvexDatabase.Live,
    StripeProvider.Live,
    AuthService.Default,
    TokenService.Default
  );

  // Run Effect program
  return runEffectHandler(c, program.pipe(Effect.provide(layer)));
});

// GET /api/tokens/balance/:tokenId
app.get('/balance/:tokenId', async (c) => {
  const tokenId = c.req.param('tokenId');

  const program = Effect.gen(function* () {
    const honoCtx = yield* HonoContextService;
    const authService = yield* AuthService;
    const tokenService = yield* TokenService;

    // Auth check
    const session = yield* authService.getSession(honoCtx.req.raw.headers);
    if (!session) {
      return yield* Effect.fail(new UnauthorizedError());
    }

    // Get balance
    const balance = yield* tokenService.getBalance({
      userId: session.user.id,
      tokenId,
      orgId: honoCtx.orgId,
    });

    return { balance };
  });

  const layer = Effect.mergeAll(
    createHonoLayer(c),
    ConvexDatabase.Live,
    AuthService.Default,
    TokenService.Default
  );

  return runEffectHandler(c, program.pipe(Effect.provide(layer)));
});

export const tokenRoutes = app;
```

### Effect.ts Middleware

#### `api/src/middleware/organization-effect.ts`

```typescript
import { Effect } from 'effect';
import { OrganizationService } from '../services/organization';
import { HonoContextService } from '../services/hono-context';

/**
 * Organization middleware as Effect program
 */
export const extractOrganization = Effect.gen(function* () {
  const ctx = yield* HonoContextService;

  // Extract org slug from subdomain
  const host = ctx.req.header('host') || '';
  const subdomain = host.split('.')[0];

  // Skip for main domain
  if (subdomain === 'api' || subdomain === 'www') {
    return null;
  }

  // Get organization
  const orgService = yield* OrganizationService;
  const org = yield* orgService.getBySlug(subdomain);

  // Check if org is active
  if (org.status !== 'active') {
    return yield* Effect.fail(new ForbiddenError('Organization is inactive'));
  }

  return org;
});
```

**Usage in route:**

```typescript
app.get('/dashboard', async (c) => {
  const program = Effect.gen(function* () {
    // Run organization middleware
    const org = yield* extractOrganization;

    if (!org) {
      return yield* Effect.fail(new NotFoundError('Organization not found'));
    }

    // Rest of handler logic...
  });

  // ...
});
```

## 3. Business Logic: Effect.ts Services (Already Covered)

See `Service Layer.md` for complete patterns. Key points:

- **All services extend `Effect.Service`**
- **All operations return `Effect<A, E>`**
- **All errors are typed with `_tag`**
- **Dependency injection via Effect layers**

## 4. Convex Integration: Effect.ts Wrappers

### Convex Database Service

#### `api/src/services/convex-database.ts`

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
 * Convex Database Service (Effect wrapper)
 */
export class ConvexDatabase extends Context.Tag('ConvexDatabase')<
  ConvexDatabase,
  {
    query: <T>(name: any, args: any) => Effect.Effect<T, ConvexDatabaseError>;
    mutation: <T>(name: any, args: any) => Effect.Effect<T, ConvexDatabaseError>;
    action: <T>(name: any, args: any) => Effect.Effect<T, ConvexDatabaseError>;
  }
>() {
  /**
   * Live implementation
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
      };
    })
  );
}
```

**Usage in services:**

```typescript
export class TokenService extends Effect.Service<TokenService>()(
  'TokenService',
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;

      return {
        getBalance: (args: { userId: string; tokenId: string }) =>
          Effect.gen(function* () {
            const balance = yield* db.query(api.queries.tokens.getBalance, args);
            return balance;
          }),

        purchase: (args: { userId: string; tokenId: string; amount: number }) =>
          Effect.gen(function* () {
            const result = yield* db.mutation(api.mutations.tokens.purchase, args);
            return result;
          }),
      };
    }),
    dependencies: [ConvexDatabase],
  }
) {}
```

## 5. External Providers: Effect.ts Wrappers

### Stripe Provider Example

#### `api/src/services/providers/stripe.ts`

```typescript
import { Effect, Context, Layer } from 'effect';
import Stripe from 'stripe';

/**
 * Stripe errors
 */
export class StripePaymentError {
  readonly _tag = 'StripePaymentError';
  constructor(readonly code: string, readonly message: string) {}
}

export class StripeConfigError {
  readonly _tag = 'StripeConfigError';
  constructor(readonly message: string) {}
}

/**
 * Stripe Provider Service
 */
export class StripeProvider extends Context.Tag('StripeProvider')<
  StripeProvider,
  {
    createPaymentIntent: (args: {
      amount: number;
      currency: string;
      customerId?: string;
    }) => Effect.Effect<{ clientSecret: string; id: string }, StripePaymentError>;

    createCustomer: (args: {
      email: string;
      name?: string;
    }) => Effect.Effect<{ id: string }, StripePaymentError>;

    charge: (args: {
      amount: number;
      currency: string;
      source: string;
    }) => Effect.Effect<{ id: string; status: string }, StripePaymentError>;
  }
>() {
  /**
   * Live implementation
   */
  static readonly Live = Layer.effect(
    StripeProvider,
    Effect.gen(function* () {
      // Get API key from environment
      const apiKey = yield* Effect.sync(() => process.env.STRIPE_SECRET_KEY);

      if (!apiKey) {
        return yield* Effect.fail(
          new StripeConfigError('STRIPE_SECRET_KEY not set')
        );
      }

      const stripe = new Stripe(apiKey, { apiVersion: '2024-11-20.acacia' });

      return {
        createPaymentIntent: (args) =>
          Effect.tryPromise({
            try: async () => {
              const intent = await stripe.paymentIntents.create({
                amount: args.amount,
                currency: args.currency,
                customer: args.customerId,
              });

              return {
                clientSecret: intent.client_secret!,
                id: intent.id,
              };
            },
            catch: (error: any) =>
              new StripePaymentError(
                error.code || 'UNKNOWN',
                error.message || 'Payment failed'
              ),
          }),

        createCustomer: (args) =>
          Effect.tryPromise({
            try: async () => {
              const customer = await stripe.customers.create({
                email: args.email,
                name: args.name,
              });

              return { id: customer.id };
            },
            catch: (error: any) =>
              new StripePaymentError(
                error.code || 'UNKNOWN',
                error.message || 'Failed to create customer'
              ),
          }),

        charge: (args) =>
          Effect.tryPromise({
            try: async () => {
              const charge = await stripe.charges.create({
                amount: args.amount,
                currency: args.currency,
                source: args.source,
              });

              return {
                id: charge.id,
                status: charge.status,
              };
            },
            catch: (error: any) =>
              new StripePaymentError(
                error.code || 'UNKNOWN',
                error.message || 'Charge failed'
              ),
          }),
      };
    })
  );
}
```

## 6. Full Pipeline Example: Token Purchase

### Complete Flow with Effect.ts

```typescript
/**
 * STEP 1: Frontend (React Component)
 */
// src/components/features/tokens/TokenPurchase.tsx
export function TokenPurchase({ tokenId }: Props) {
  const handlePurchase = async () => {
    const program = Effect.gen(function* () {
      const service = yield* TokenClientService;
      return yield* service.purchase({ tokenId, amount: 100 });
    });

    await Effect.runPromise(
      program.pipe(
        Effect.provide(ClientLayer),
        Effect.retry({ times: 3 }),
        Effect.timeout('30 seconds')
      )
    );
  };

  return <Button onClick={handlePurchase}>Purchase</Button>;
}

/**
 * STEP 2: Hono API Route
 */
// api/src/routes/tokens.ts
app.post('/purchase', async (c) => {
  const { tokenId, amount } = await c.req.json();

  const program = Effect.gen(function* () {
    // Get dependencies
    const ctx = yield* HonoContextService;
    const auth = yield* AuthService;
    const tokenService = yield* TokenService;

    // Verify session
    const session = yield* auth.getSession(ctx.req.raw.headers);
    if (!session) {
      return yield* Effect.fail(new UnauthorizedError());
    }

    // Execute purchase
    const result = yield* tokenService.purchase({
      userId: session.user.id,
      tokenId,
      amount,
    });

    return result;
  });

  // Provide all dependencies
  const layer = Effect.mergeAll(
    createHonoLayer(c),
    ConvexDatabase.Live,
    StripeProvider.Live,
    AuthService.Default,
    TokenService.Default
  );

  return runEffectHandler(c, program.pipe(Effect.provide(layer)));
});

/**
 * STEP 3: Token Service (Business Logic)
 */
// convex/services/tokens/token.ts
export class TokenService extends Effect.Service<TokenService>()(
  'TokenService',
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;
      const stripe = yield* StripeProvider;

      return {
        purchase: (args: PurchaseArgs) =>
          Effect.gen(function* () {
            // Validate token exists
            const token = yield* db.query(api.queries.tokens.get, {
              id: args.tokenId,
            });

            if (!token) {
              return yield* Effect.fail(new TokenNotFoundError(args.tokenId));
            }

            // Calculate price
            const price = args.amount * token.properties.price;

            // Charge payment via Stripe
            const payment = yield* stripe.charge({
              amount: price * 100, // cents
              currency: 'usd',
              source: 'tok_visa', // TODO: get from user
            });

            // Update balance in Convex
            const result = yield* db.mutation(api.mutations.tokens.purchase, {
              userId: args.userId,
              tokenId: args.tokenId,
              amount: args.amount,
              paymentId: payment.id,
            });

            // Log event
            yield* Effect.logInfo('Token purchase completed', {
              userId: args.userId,
              amount: args.amount,
              paymentId: payment.id,
            });

            return result;
          }),
      };
    }),
    dependencies: [ConvexDatabase, StripeProvider],
  }
) {}

/**
 * STEP 4: Convex Mutation (Data Layer)
 */
// convex/mutations/tokens.ts
export const purchase = mutation({
  args: {
    userId: v.id('entities'),
    tokenId: v.id('entities'),
    amount: v.number(),
    paymentId: v.string(),
  },
  handler: async (ctx, args) => {
    // Update or create balance connection
    const existing = await ctx.db
      .query('connections')
      .withIndex('from_to', (q) =>
        q.eq('fromEntityId', args.userId).eq('toEntityId', args.tokenId)
      )
      .filter((q) => q.eq(q.field('relationshipType'), 'holds_tokens'))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        metadata: {
          ...existing.metadata,
          balance: (existing.metadata?.balance || 0) + args.amount,
        },
      });
    } else {
      await ctx.db.insert('connections', {
        fromEntityId: args.userId,
        toEntityId: args.tokenId,
        relationshipType: 'holds_tokens',
        metadata: { balance: args.amount },
        createdAt: Date.now(),
      });
    }

    // Log event
    await ctx.db.insert('events', {
      entityId: args.tokenId,
      eventType: 'tokens_purchased',
      timestamp: Date.now(),
      actorType: 'user',
      actorId: args.userId,
      metadata: {
        amount: args.amount,
        paymentId: args.paymentId,
      },
    });

    return { success: true, newBalance: args.amount };
  },
});
```

### Error Flow Example

```typescript
/**
 * Error propagates through entire pipeline
 */

// Frontend makes request
const program = TokenClientService.purchase({ tokenId, amount: 100 });
    ↓
// Hono receives, validates auth
Effect.fail(new UnauthorizedError())
    ↓
// Error bubbles up through service layer
Effect.catchTag('UnauthorizedError', ...)
    ↓
// Hono converts to HTTP response
{ status: 401, body: { error: 'Unauthorized' } }
    ↓
// Frontend receives typed error
Effect.catchTag('UnauthorizedError', () => {
  window.location.href = '/signin';
})
```

## 7. Testing with Effect.ts

### Benefits of Effect.ts Testing

- **No mocking needed** - Use test layers instead
- **Deterministic** - Pure functions always produce same output
- **Composable** - Test individual services in isolation
- **Type-safe** - Compiler ensures test correctness

### Unit Test Example

#### `tests/services/token.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { Effect, Layer } from 'effect';
import { TokenService, TokenNotFoundError } from '@/services/tokens/token';
import { ConvexDatabase } from '@/services/convex-database';
import { StripeProvider } from '@/services/providers/stripe';

describe('TokenService.purchase', () => {
  it('should purchase tokens successfully', async () => {
    // Mock Convex Database
    const MockConvexDB = Layer.succeed(ConvexDatabase, {
      query: (name, args) =>
        Effect.succeed({
          _id: args.id,
          type: 'token',
          name: 'Test Token',
          properties: { price: 1.0 },
        }),
      mutation: (name, args) =>
        Effect.succeed({ success: true, newBalance: args.amount }),
    });

    // Mock Stripe
    const MockStripe = Layer.succeed(StripeProvider, {
      charge: (args) =>
        Effect.succeed({ id: 'ch_123', status: 'succeeded' }),
      createPaymentIntent: () => Effect.succeed({ clientSecret: '', id: '' }),
      createCustomer: () => Effect.succeed({ id: '' }),
    });

    // Test layer
    const TestLayer = Effect.mergeAll(
      MockConvexDB,
      MockStripe,
      TokenService.Default
    );

    // Run test
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const service = yield* TokenService;
        return yield* service.purchase({
          userId: 'user_123',
          tokenId: 'token_456',
          amount: 100,
        });
      }).pipe(Effect.provide(TestLayer))
    );

    expect(result.success).toBe(true);
    expect(result.newBalance).toBe(100);
  });

  it('should fail when token not found', async () => {
    // Mock returning null
    const MockConvexDB = Layer.succeed(ConvexDatabase, {
      query: () => Effect.succeed(null),
      mutation: () => Effect.succeed({}),
    });

    const TestLayer = Effect.mergeAll(
      MockConvexDB,
      StripeProvider.Live, // Won't be called
      TokenService.Default
    );

    // Expect failure
    const result = await Effect.runPromiseExit(
      Effect.gen(function* () {
        const service = yield* TokenService;
        return yield* service.purchase({
          userId: 'user_123',
          tokenId: 'token_999',
          amount: 100,
        });
      }).pipe(Effect.provide(TestLayer))
    );

    expect(result._tag).toBe('Failure');
    expect(result.cause.failures[0]).toBeInstanceOf(TokenNotFoundError);
  });
});
```

### Integration Test Example

#### `tests/integration/token-purchase.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { Effect } from 'effect';
import { TokenClientService } from '@/lib/effects/token-client';
import { ClientLayer } from '@/lib/effects/layers';

describe('Token Purchase Integration', () => {
  it('should complete full purchase flow', async () => {
    const program = Effect.gen(function* () {
      const service = yield* TokenClientService;

      // Purchase tokens
      const result = yield* service.purchase({
        tokenId: 'test_token_123',
        amount: 100,
      });

      return result;
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(ClientLayer))
    );

    expect(result.success).toBe(true);
    expect(result.newBalance).toBeGreaterThan(0);
  });
});
```

## 8. Advanced Patterns

### Parallel Execution

```typescript
const program = Effect.gen(function* () {
  const tokenService = yield* TokenService;
  const userService = yield* UserService;

  // Execute in parallel
  const [balance, profile] = yield* Effect.all([
    tokenService.getBalance({ userId, tokenId }),
    userService.getProfile({ userId }),
  ]);

  return { balance, profile };
});
```

### Retry with Backoff

```typescript
const program = service.purchase(args).pipe(
  Effect.retry({
    times: 5,
    schedule: Effect.Schedule.exponential('1 second'),
  }),
  Effect.timeout('60 seconds')
);
```

### Resource Management

```typescript
const program = Effect.gen(function* () {
  // Acquire resource
  const connection = yield* Effect.acquireRelease(
    Effect.sync(() => createConnection()),
    (conn) => Effect.sync(() => conn.close())
  );

  // Use resource
  const result = yield* performQuery(connection);

  return result;
  // Connection automatically closed
});
```

### Logging & Tracing

```typescript
const program = Effect.gen(function* () {
  yield* Effect.logInfo('Starting token purchase', { tokenId, amount });

  const result = yield* tokenService.purchase(args);

  yield* Effect.logInfo('Purchase completed', { result });

  return result;
}).pipe(
  Effect.withSpan('token-purchase', { attributes: { tokenId, amount } })
);
```

## Benefits of Full Effect.ts Coverage

### 1. Consistent Error Handling

✅ **Same patterns everywhere** - Frontend, API, business logic all use `Effect.catchTag`
✅ **Type-safe errors** - Compiler ensures all error cases are handled
✅ **No try/catch** - Effect handles errors functionally

### 2. Composability

✅ **Small functions combine** - Build complex flows from simple pieces
✅ **Reusable logic** - Services compose cleanly
✅ **Testable units** - Each piece tested in isolation

### 3. Dependency Injection

✅ **No global state** - All dependencies explicit
✅ **Easy mocking** - Test layers replace real implementations
✅ **Swappable providers** - Change Stripe to PayPal with one layer change

### 4. Observability

✅ **Built-in logging** - `Effect.logInfo` throughout pipeline
✅ **Distributed tracing** - `Effect.withSpan` for APM integration
✅ **Metrics collection** - Effect runtime provides metrics

### 5. Resilience

✅ **Automatic retry** - `Effect.retry` with exponential backoff
✅ **Timeouts** - `Effect.timeout` prevents hanging
✅ **Circuit breakers** - Effect patterns for fault tolerance

### 6. Developer Experience

✅ **Type inference** - Compiler knows all types
✅ **IDE support** - Auto-complete everywhere
✅ **Refactoring confidence** - Compiler catches breaking changes

## Migration Strategy

### Phase 1: Add Effect.ts to New Code

- All new services use Effect.ts
- New Hono routes use `runEffectHandler`
- New React components use Effect.ts hooks

### Phase 2: Wrap Existing Code

- Wrap existing async functions in `Effect.tryPromise`
- Create Effect layers for existing providers
- Convert one service at a time

### Phase 3: Full Coverage

- All business logic in Effect.ts services
- All API routes use Effect handlers
- All frontend API calls use Effect clients

## Next Steps

1. Install Effect.ts dependencies (`effect`, `@effect/schema`)
2. Create base layers (`ConvexDatabase.Live`, provider layers)
3. Implement `runEffectHandler` for Hono
4. Create first Effect.ts service
5. Build frontend Effect client service
6. Write Effect.ts tests
7. Document patterns for team
8. Migrate existing code incrementally

**Result:** A fully functional pipeline where Effect.ts provides type-safe error handling, composability, and testability from frontend to database. 🎯
