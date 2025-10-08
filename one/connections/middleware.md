# Middleware.md - The Glue Layer

**Purpose:** Explain how middleware connects the frontend (Astro + React) to the backend (Hono + Convex) using Effect.ts as the primary glue mechanism.

---

## Overview

The **middleware layer** is the glue that binds our three-layer architecture together:

```
┌─────────────────────────────────────────────────────────┐
│                 ASTRO FRONTEND                          │
│  - Pages (.astro files)                                 │
│  - React components                                     │
│  - Content collections                                  │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓ MIDDLEWARE LAYER (The Glue)
┌─────────────────────────────────────────────────────────┐
│  1. Convex Hooks (useQuery, useMutation)               │
│  2. Hono API Client (REST calls)                       │
│  3. Effect.ts Client Services (type-safe errors)       │
│  4. Authentication Middleware (session management)     │
│  5. Error Boundaries (React error handling)            │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓ BACKEND INTEGRATION
┌─────────────────────────────────────────────────────────┐
│              HONO API + CONVEX                          │[[
]]│  - Business logic (Effect.ts services)                  │
│  - Database (4-table ontology)                          │
│  - Real-time subscriptions                              │
└─────────────────────────────────────────────────────────┘
```

**Key Principle:** Effect.ts provides consistent error handling, retry logic, and type safety across the entire middleware layer.

---

## The Five Middleware Components

### 1. Convex Hooks (Real-Time Data)

**Purpose:** Direct connection to Convex for real-time data subscriptions.

**When to Use:**
- ✅ Reading data that updates in real-time (dashboard stats, live messages)
- ✅ Simple queries without complex business logic
- ✅ Optimistic UI updates
- ❌ Don't use for complex mutations (use Hono API instead)

**Implementation:**

```typescript
// src/hooks/useConvexQuery.ts
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

/**
 * Hook for real-time Convex data
 * Automatically re-renders when data changes
 */
export function useTokenBalance(tokenId: Id<'entities'>) {
  return useQuery(api.queries.tokens.getBalance, { id: tokenId });
}

export function useCreatorStats(creatorId: Id<'entities'>) {
  return useQuery(api.queries.dashboard.getStats, { creatorId });
}

export function useLiveMessages(roomId: string) {
  return useQuery(api.queries.messages.list, { roomId });
}
```

**Usage in Components:**

```tsx
// src/components/dashboard/TokenBalance.tsx
import { useTokenBalance } from '@/hooks/useConvexQuery';

export function TokenBalance({ tokenId }: { tokenId: Id<'entities'> }) {
  // Real-time data - automatically updates!
  const balance = useTokenBalance(tokenId);

  if (balance === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <p>Balance: {balance} tokens</p>
    </div>
  );
}
```

**Benefits:**
- Automatic re-renders on data changes (no manual polling)
- Optimistic updates built-in
- Type-safe with generated types
- WebSocket-based (efficient)

**Limitations:**
- Only for reads (queries), not complex mutations
- Can't add custom retry logic or error handling easily
- Limited to Convex-specific patterns

---

### 2. Hono API Client (Complex Operations)

**Purpose:** HTTP client for calling Hono API routes with complex business logic.

**When to Use:**
- ✅ Complex mutations (token purchases, payments, agent creation)
- ✅ Operations requiring authentication/authorization
- ✅ External API integrations (Stripe, OpenAI, blockchain)
- ✅ Multi-step workflows with rollback logic

**Implementation:**

```typescript
// src/lib/api-client.ts
import { Effect } from 'effect';

/**
 * Tagged errors for API client
 */
export class NetworkError {
  readonly _tag = 'NetworkError';
  constructor(readonly message: string, readonly cause?: unknown) {}
}

export class UnauthorizedError {
  readonly _tag = 'UnauthorizedError';
}

export class ValidationError {
  readonly _tag = 'ValidationError';
  constructor(readonly message: string, readonly fields?: Record<string, string>) {}
}

/**
 * API Client for Hono backend
 * All methods return Effect for type-safe error handling
 */
export class APIClient {
  private baseURL: string;

  constructor(baseURL: string = import.meta.env.PUBLIC_API_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Generic request wrapper with Effect.ts
   */
  private request<T>(
    path: string,
    options: RequestInit = {}
  ): Effect.Effect<T, NetworkError | UnauthorizedError | ValidationError> {
    return Effect.tryPromise({
      try: async () => {
        const response = await fetch(`${this.baseURL}${path}`, {
          ...options,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new UnauthorizedError();
          }

          const error = await response.json();
          if (response.status === 400 && error.fields) {
            throw new ValidationError(error.message, error.fields);
          }

          throw new NetworkError(error.message || 'Request failed');
        }

        return response.json() as Promise<T>;
      },
      catch: (error) => {
        if (error instanceof UnauthorizedError) return error;
        if (error instanceof ValidationError) return error;
        if (error instanceof NetworkError) return error;
        return new NetworkError('Network request failed', error);
      },
    });
  }

  /**
   * Token operations
   */
  purchaseTokens(
    tokenId: string,
    amount: number
  ): Effect.Effect<
    { success: true; newBalance: number },
    NetworkError | UnauthorizedError | ValidationError
  > {
    return this.request('/api/tokens/purchase', {
      method: 'POST',
      body: JSON.stringify({ tokenId, amount }),
    });
  }

  /**
   * Agent operations
   */
  createAgent(
    config: { name: string; description: string; model: string }
  ): Effect.Effect<
    { id: string; name: string },
    NetworkError | UnauthorizedError | ValidationError
  > {
    return this.request('/api/agents', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  /**
   * Content operations
   */
  publishContent(
    content: { title: string; body: string }
  ): Effect.Effect<
    { id: string; publishedAt: number },
    NetworkError | UnauthorizedError | ValidationError
  > {
    return this.request('/api/content', {
      method: 'POST',
      body: JSON.stringify(content),
    });
  }
}

export const apiClient = new APIClient();
```

**Usage in Components:**

```tsx
// src/components/features/tokens/TokenPurchaseButton.tsx
import { useState } from 'react';
import { Effect } from 'effect';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function TokenPurchaseButton({ tokenId }: { tokenId: string }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);

    // Build Effect program with automatic error handling
    const program = apiClient.purchaseTokens(tokenId, 100).pipe(
      // Automatic retry on network errors
      Effect.retry({
        times: 3,
        schedule: Effect.Schedule.exponential('1 second'),
      }),

      // Timeout after 30 seconds
      Effect.timeout('30 seconds'),

      // Type-safe error handling
      Effect.catchTag('UnauthorizedError', () =>
        Effect.sync(() => {
          toast({
            title: 'Unauthorized',
            description: 'Please sign in to purchase tokens',
            variant: 'destructive',
          });
          window.location.href = '/signin';
        })
      ),

      Effect.catchTag('ValidationError', (error) =>
        Effect.sync(() => {
          toast({
            title: 'Validation Error',
            description: error.message,
            variant: 'destructive',
          });
        })
      ),

      Effect.catchTag('NetworkError', (error) =>
        Effect.sync(() => {
          toast({
            title: 'Network Error',
            description: 'Please check your connection',
            variant: 'destructive',
          });
        })
      ),

      Effect.catchTag('TimeoutException', () =>
        Effect.sync(() => {
          toast({
            title: 'Request Timeout',
            description: 'Purchase took too long, please try again',
            variant: 'destructive',
          });
        })
      ),

      // Success handler
      Effect.tap((result) =>
        Effect.sync(() => {
          toast({
            title: 'Success!',
            description: `Purchased 100 tokens. New balance: ${result.newBalance}`,
          });
        })
      )
    );

    // Run Effect program
    await Effect.runPromise(program);

    setLoading(false);
  };

  return (
    <Button onClick={handlePurchase} disabled={loading}>
      {loading ? 'Processing...' : 'Buy 100 Tokens'}
    </Button>
  );
}
```

**Benefits:**
- Type-safe errors with exhaustive pattern matching
- Automatic retry logic with exponential backoff
- Timeout protection
- Composable (can chain multiple operations)
- Testable (easy to mock)

---

### 3. Effect.ts Client Services (Advanced Patterns)

**Purpose:** Reusable Effect.ts services for complex client-side logic.

**When to Use:**
- ✅ Complex multi-step workflows on client
- ✅ Local state management with Effect
- ✅ Client-side caching with retry
- ✅ Composing multiple API calls

**Implementation:**

```typescript
// src/lib/effects/token-client.ts
import { Effect, Context, Layer } from 'effect';
import { apiClient, NetworkError, UnauthorizedError, ValidationError } from '@/lib/api-client';
import type { Id } from '@/convex/_generated/dataModel';

/**
 * Token Purchase Error (domain-specific)
 */
export class TokenPurchaseError {
  readonly _tag = 'TokenPurchaseError';
  constructor(readonly message: string) {}
}

/**
 * Token Client Service
 * Wraps API client with additional client-side logic
 */
export class TokenClientService extends Context.Tag('TokenClientService')<
  TokenClientService,
  {
    purchase: (args: {
      tokenId: string;
      amount: number;
    }) => Effect.Effect<
      { success: true; newBalance: number },
      TokenPurchaseError | UnauthorizedError
    >;

    getBalance: (tokenId: string) => Effect.Effect<number, NetworkError>;
  }
>() {
  static readonly Live = Layer.succeed(TokenClientService, {
    purchase: (args) =>
      Effect.gen(function* () {
        // Client-side validation
        if (args.amount <= 0) {
          return yield* Effect.fail(
            new TokenPurchaseError('Amount must be positive')
          );
        }

        if (args.amount > 10000) {
          return yield* Effect.fail(
            new TokenPurchaseError('Amount too large (max 10,000)')
          );
        }

        // Call API with retry
        const result = yield* apiClient.purchaseTokens(args.tokenId, args.amount).pipe(
          Effect.retry({
            times: 3,
            schedule: Effect.Schedule.exponential('1 second'),
          }),
          Effect.timeout('30 seconds'),
          Effect.catchTags({
            NetworkError: (e) => Effect.fail(new TokenPurchaseError(e.message)),
            ValidationError: (e) => Effect.fail(new TokenPurchaseError(e.message)),
          })
        );

        return result;
      }),

    getBalance: (tokenId) =>
      Effect.gen(function* () {
        // Fetch balance from API
        const result = yield* apiClient.request<{ balance: number }>(
          `/api/tokens/balance/${tokenId}`
        ).pipe(
          Effect.retry({ times: 2 }),
          Effect.timeout('10 seconds')
        );

        return result.balance;
      }),
  });
}
```

**Usage with Layer:**

```typescript
// src/lib/effects/layers.ts
import { Layer } from 'effect';
import { TokenClientService } from './token-client';
import { AgentClientService } from './agent-client';
import { ContentClientService } from './content-client';

/**
 * Client layer with all services
 */
export const ClientLayer = Layer.mergeAll(
  TokenClientService.Live,
  AgentClientService.Live,
  ContentClientService.Live
);
```

**Usage in Components:**

```tsx
// src/components/features/tokens/AdvancedPurchase.tsx
import { Effect } from 'effect';
import { TokenClientService } from '@/lib/effects/token-client';
import { ClientLayer } from '@/lib/effects/layers';

export function AdvancedPurchase({ tokenId }: { tokenId: string }) {
  const handlePurchase = async (amount: number) => {
    const program = Effect.gen(function* () {
      const tokenService = yield* TokenClientService;

      // Use service (includes validation, retry, etc.)
      const result = yield* tokenService.purchase({ tokenId, amount });

      return result;
    }).pipe(Effect.provide(ClientLayer));

    const result = await Effect.runPromise(program);

    console.log('Purchase completed:', result);
  };

  return <button onClick={() => handlePurchase(100)}>Buy 100 Tokens</button>;
}
```

**Benefits:**
- Reusable business logic on client
- Composable services
- Type-safe error handling
- Easy to test (mock layers)

---

### 4. Authentication Middleware

**Purpose:** Manage user sessions across frontend and backend.

**Implementation:**

```typescript
// src/middleware/auth.ts
import { Effect, Context, Layer } from 'effect';
import { apiClient } from '@/lib/api-client';

/**
 * Session data
 */
export interface Session {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
  expiresAt: number;
}

/**
 * Auth Service (client-side)
 */
export class AuthService extends Context.Tag('AuthService')<
  AuthService,
  {
    getSession: () => Effect.Effect<Session | null, never>;
    signIn: (email: string, password: string) => Effect.Effect<Session, Error>;
    signOut: () => Effect.Effect<void, never>;
    isAuthenticated: () => Effect.Effect<boolean, never>;
  }
>() {
  static readonly Live = Layer.succeed(AuthService, {
    getSession: () =>
      Effect.sync(() => {
        const sessionJson = localStorage.getItem('session');
        if (!sessionJson) return null;

        const session = JSON.parse(sessionJson) as Session;

        // Check if expired
        if (session.expiresAt < Date.now()) {
          localStorage.removeItem('session');
          return null;
        }

        return session;
      }),

    signIn: (email, password) =>
      Effect.gen(function* () {
        const result = yield* apiClient.request<Session>('/api/auth/signin', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        // Store session
        yield* Effect.sync(() => {
          localStorage.setItem('session', JSON.stringify(result));
        });

        return result;
      }),

    signOut: () =>
      Effect.gen(function* () {
        // Call API
        yield* apiClient.request('/api/auth/signout', { method: 'POST' });

        // Clear local session
        yield* Effect.sync(() => {
          localStorage.removeItem('session');
        });
      }),

    isAuthenticated: () =>
      Effect.gen(function* () {
        const session = yield* Effect.sync(() => {
          const sessionJson = localStorage.getItem('session');
          return sessionJson ? JSON.parse(sessionJson) : null;
        });

        return session !== null && session.expiresAt > Date.now();
      }),
  });
}
```

**Protected Route Pattern:**

```tsx
// src/components/auth/ProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { Effect } from 'effect';
import { AuthService } from '@/middleware/auth';
import { Layer } from 'effect';

const AuthLayer = AuthService.Live;

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const program = Effect.gen(function* () {
      const auth = yield* AuthService;
      return yield* auth.isAuthenticated();
    }).pipe(Effect.provide(AuthLayer));

    Effect.runPromise(program).then(setIsAuthenticated);
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    window.location.href = '/signin';
    return null;
  }

  return <>{children}</>;
}
```

---

### 5. Error Boundaries (React Error Handling)

**Purpose:** Catch and display React errors gracefully.

**Implementation:**

```tsx
// src/components/ErrorBoundary.tsx
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Alert variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            {this.state.error?.message || 'An unexpected error occurred'}
          </AlertDescription>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </Button>
        </Alert>
      );
    }

    return this.props.children;
  }
}
```

**Usage:**

```tsx
// src/pages/dashboard.astro
---
import Layout from '@/layouts/Layout.astro';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import DashboardContent from '@/components/dashboard/DashboardContent';
---

<Layout title="Dashboard">
  <ErrorBoundary client:load>
    <DashboardContent client:load />
  </ErrorBoundary>
</Layout>
```

---

## Middleware Patterns

### Pattern 1: Dual Integration (Convex + Hono)

**Use both Convex hooks AND Hono API in the same component:**

```tsx
// src/components/features/TokenDashboard.tsx
import { useQuery } from 'convex/react';
import { api as convexApi } from '@/convex/_generated/api';
import { apiClient } from '@/lib/api-client';
import { Effect } from 'effect';

export function TokenDashboard({ tokenId }: { tokenId: string }) {
  // Real-time balance via Convex hook
  const balance = useQuery(convexApi.queries.tokens.getBalance, { id: tokenId });

  // Purchase via Hono API
  const handlePurchase = async (amount: number) => {
    const program = apiClient.purchaseTokens(tokenId, amount);
    await Effect.runPromise(program);
    // Convex hook automatically updates balance!
  };

  return (
    <div>
      <p>Balance: {balance || 0} tokens</p>
      <button onClick={() => handlePurchase(100)}>Buy 100</button>
    </div>
  );
}
```

**Benefits:**
- Real-time data updates (Convex)
- Complex mutations (Hono)
- Best of both worlds

### Pattern 2: Effect.ts Composition

**Compose multiple Effect services:**

```typescript
// src/lib/workflows/create-agent-with-content.ts
import { Effect } from 'effect';
import { AgentClientService } from '@/lib/effects/agent-client';
import { ContentClientService } from '@/lib/effects/content-client';
import { TokenClientService } from '@/lib/effects/token-client';

/**
 * Complex workflow: Create agent, publish content, deduct tokens
 */
export const createAgentWithContent = (args: {
  agentConfig: { name: string; description: string };
  contentConfig: { title: string; body: string };
  cost: number;
}) =>
  Effect.gen(function* () {
    const agentService = yield* AgentClientService;
    const contentService = yield* ContentClientService;
    const tokenService = yield* TokenClientService;

    // Step 1: Create agent
    const agent = yield* agentService.create(args.agentConfig);

    // Step 2: Publish content
    const content = yield* contentService.publish({
      ...args.contentConfig,
      agentId: agent.id,
    });

    // Step 3: Deduct tokens (will rollback if fails)
    yield* tokenService.spend({
      amount: args.cost,
      reason: `Agent ${agent.id} + Content ${content.id}`,
    });

    return { agent, content };
  }).pipe(
    // Automatic rollback on any failure
    Effect.onError((error) =>
      Effect.gen(function* () {
        console.error('Workflow failed, rolling back:', error);
        // Rollback logic here
      })
    )
  );
```

### Pattern 3: SSR Data Fetching

**Fetch data server-side in Astro:**

```astro
---
// src/pages/dashboard/[id].astro
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import Layout from '@/layouts/Layout.astro';
import DashboardContent from '@/components/dashboard/DashboardContent';

// SSR: Fetch initial data
const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const stats = await convex.query(api.queries.dashboard.getStats, {
  id: Astro.params.id
});

// Check authentication
const session = Astro.cookies.get('session')?.value;
if (!session) {
  return Astro.redirect('/signin');
}
---

<Layout title="Dashboard">
  <!-- Pass SSR data as props -->
  <DashboardContent
    client:load
    initialStats={stats}
    userId={Astro.params.id}
  />
</Layout>
```

---

## Testing Middleware

### Unit Testing Effect.ts Services

```typescript
// tests/middleware/token-client.test.ts
import { describe, it, expect } from 'vitest';
import { Effect, Layer } from 'effect';
import { TokenClientService, TokenPurchaseError } from '@/lib/effects/token-client';

describe('TokenClientService', () => {
  it('should validate amount', async () => {
    const program = Effect.gen(function* () {
      const service = yield* TokenClientService;
      return yield* service.purchase({ tokenId: 'test', amount: -1 });
    }).pipe(Effect.provide(TokenClientService.Live));

    await expect(Effect.runPromise(program)).rejects.toThrow(TokenPurchaseError);
  });

  it('should purchase tokens successfully', async () => {
    // Mock API client
    const MockTokenClient = Layer.succeed(TokenClientService, {
      purchase: () =>
        Effect.succeed({ success: true as const, newBalance: 100 }),
      getBalance: () => Effect.succeed(100),
    });

    const program = Effect.gen(function* () {
      const service = yield* TokenClientService;
      return yield* service.purchase({ tokenId: 'test', amount: 100 });
    }).pipe(Effect.provide(MockTokenClient));

    const result = await Effect.runPromise(program);

    expect(result.success).toBe(true);
    expect(result.newBalance).toBe(100);
  });
});
```

### Integration Testing

```typescript
// tests/integration/token-purchase-flow.test.ts
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TokenPurchaseButton } from '@/components/features/tokens/TokenPurchaseButton';

describe('Token Purchase Flow', () => {
  it('should complete purchase and show success toast', async () => {
    render(<TokenPurchaseButton tokenId="test-token" />);

    const button = screen.getByText('Buy 100 Tokens');
    fireEvent.click(button);

    // Wait for success toast
    await screen.findByText('Success!');

    expect(screen.getByText(/Purchased 100 tokens/)).toBeInTheDocument();
  });
});
```

---

## Best Practices

### 1. Error Handling Strategy

**Always use typed errors:**

```typescript
// ✅ GOOD: Typed errors
export class PaymentError {
  readonly _tag = 'PaymentError';
  constructor(readonly message: string) {}
}

const program = apiClient.purchase(args).pipe(
  Effect.catchTag('PaymentError', (e) => {
    // Type-safe error handling
    toast({ title: 'Payment Failed', description: e.message });
  })
);

// ❌ BAD: Generic errors
try {
  await apiClient.purchase(args);
} catch (error) {
  // Lost type information
  toast({ title: 'Error', description: String(error) });
}
```

### 2. Retry Strategy

**Use exponential backoff for network errors:**

```typescript
const program = apiClient.request('/api/data').pipe(
  Effect.retry({
    times: 3,
    schedule: Effect.Schedule.exponential('1 second', 2.0), // 1s, 2s, 4s
  })
);
```

### 3. Timeout Protection

**Always add timeouts to prevent hanging:**

```typescript
const program = apiClient.longRunningOperation().pipe(
  Effect.timeout('30 seconds'),
  Effect.catchTag('TimeoutException', () => {
    // Handle timeout
    return Effect.succeed({ timedOut: true });
  })
);
```

### 4. Loading States

**Show loading indicators during operations:**

```tsx
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await Effect.runPromise(program);
  } finally {
    setLoading(false);
  }
};

return <Button disabled={loading}>{loading ? 'Loading...' : 'Submit'}</Button>;
```

### 5. Optimistic Updates

**Update UI immediately, rollback on failure:**

```tsx
const handleLike = async (postId: string) => {
  // Optimistic update
  setLiked(true);
  setLikeCount((c) => c + 1);

  const program = apiClient.likePost(postId).pipe(
    Effect.catchAll((error) =>
      Effect.sync(() => {
        // Rollback on failure
        setLiked(false);
        setLikeCount((c) => c - 1);
      })
    )
  );

  await Effect.runPromise(program);
};
```

---

## Summary

The middleware layer provides **five key components**:

1. **Convex Hooks** - Real-time data subscriptions
2. **Hono API Client** - Complex mutations with retry/timeout
3. **Effect.ts Services** - Reusable client-side business logic
4. **Auth Middleware** - Session management
5. **Error Boundaries** - React error handling

**Key Benefits:**

- **Type Safety**: End-to-end TypeScript + Effect.ts
- **Composability**: Services combine cleanly
- **Error Handling**: Typed errors with exhaustive matching
- **Retry Logic**: Automatic with exponential backoff
- **Testability**: Easy to mock Effect layers

**When to Use What:**

| Use Case | Component | Example |
|----------|-----------|---------|
| Real-time data | Convex Hooks | Dashboard stats, live messages |
| Complex mutations | Hono API Client | Token purchase, payment processing |
| Multi-step workflows | Effect.ts Services | Create agent + publish content |
| Session management | Auth Middleware | Protected routes, user context |
| Error display | Error Boundaries | Catch React errors |

**Related Documentation:**
- [frontend.md](../things/frontend.md) - Astro + React frontend patterns
- [hono.md](../things/hono.md) - Hono API backend implementation
- [architecture.md](../things/architecture.md) - Complete system architecture

The middleware layer is the **glue** that makes our three-layer architecture work seamlessly! 🚀
