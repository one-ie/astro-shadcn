# ONE Platform - API Reference

**Version:** 1.0.0
**Last Updated:** 2025-01-15
**Purpose:** Complete API reference for Convex backend, service layer, and external integrations

---

## Table of Contents

1. [Convex Backend API](#convex-backend-api)
2. [Effect.ts Service Layer](#effectts-service-layer)
3. [External Service Providers](#external-service-providers)
4. [Frontend Integration](#frontend-integration)
5. [Authentication API](#authentication-api)
6. [Schema Reference](#schema-reference)
7. [Error Handling](#error-handling)

---

## Convex Backend API

### Core Function Types

The ONE platform uses Convex for real-time backend operations with three primary function types:

#### Queries (Read Operations)

**Purpose:** Read data, automatically cached, real-time reactive subscriptions

```typescript
// convex/queries/creators.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { id: v.id("entities") },
  handler: async (ctx, args) => {
    const creator = await ctx.db.get(args.id);

    if (!creator || creator.type !== "creator") {
      return null;
    }

    // Get relationships
    const contentConnections = await ctx.db
      .query("connections")
      .withIndex("from_type", q =>
        q.eq("fromEntityId", args.id)
         .eq("relationshipType", "authored")
      )
      .collect();

    return {
      ...creator,
      contentCount: contentConnections.length
    };
  }
});

export const list = query({
  args: {
    limit: v.optional(v.number()),
    niche: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("entities")
      .withIndex("by_type", q => q.eq("type", "creator"))
      .filter(q => q.eq(q.field("status"), "active"));

    if (args.niche) {
      query = query.filter(q =>
        q.eq(q.field("properties.niche"), args.niche)
      );
    }

    return await query.take(args.limit || 20);
  }
});
```

**Key Features:**
- Automatic caching and invalidation
- Real-time subscriptions (updates push to clients)
- Can run in parallel
- Read-only (no database modifications)

#### Mutations (Write Operations)

**Purpose:** Write/modify data, transactional (all-or-nothing), optimistic UI updates

```typescript
// convex/mutations/creators.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    niche: v.array(v.string())
  },
  handler: async (ctx, args) => {
    // Check uniqueness
    const existing = await ctx.db
      .query("entities")
      .withIndex("by_type", q => q.eq("type", "creator"))
      .filter(q => q.eq(q.field("properties.email"), args.email))
      .first();

    if (existing) {
      throw new Error(`Creator with email ${args.email} already exists`);
    }

    // Create entity
    const creatorId = await ctx.db.insert("entities", {
      type: "creator",
      name: args.name,
      properties: {
        email: args.email,
        username: args.email.split("@")[0],
        displayName: args.name,
        niche: args.niche,
        expertise: [],
        totalFollowers: 0,
        totalContent: 0,
        totalRevenue: 0
      },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    // Log creation event
    await ctx.db.insert("events", {
      type: "creator_created",
      actorId: creatorId,
      timestamp: Date.now(),
      metadata: {
        email: args.email,
        niche: args.niche
      }
    });

    return { creatorId };
  }
});

export const update = mutation({
  args: {
    id: v.id("entities"),
    bio: v.optional(v.string()),
    niche: v.optional(v.array(v.string())),
    avatar: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const current = await ctx.db.get(id);
    if (!current || current.type !== "creator") {
      throw new Error("Creator not found");
    }

    // Merge updates
    const newProperties = {
      ...current.properties,
      ...updates
    };

    await ctx.db.patch(id, {
      properties: newProperties,
      updatedAt: Date.now()
    });

    // Log update event
    await ctx.db.insert("events", {
      type: "creator_updated",
      actorId: id,
      timestamp: Date.now(),
      metadata: {
        updatedFields: Object.keys(updates)
      }
    });

    return { success: true };
  }
});
```

**Key Features:**
- Transactional (all succeed or all fail)
- Optimistic UI updates
- Validated with Convex validators
- Can schedule background actions

#### Actions (External API Calls)

**Purpose:** Call external services (OpenAI, Stripe, etc.), non-transactional, can be long-running

```typescript
// convex/actions/ai/clone-voice.ts
import { action } from "../../_generated/server";
import { v } from "convex/values";
import { api } from "../../_generated/api";

export const cloneVoice = action({
  args: {
    creatorId: v.id("entities"),
    audioSamples: v.array(v.string())
  },
  handler: async (ctx, args) => {
    // Call external ElevenLabs API
    const response = await fetch("https://api.elevenlabs.io/v1/voices/add", {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `Creator-${args.creatorId}`,
        files: args.audioSamples,
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const data = await response.json();
    const voiceId = data.voice_id;

    // Update creator entity with voice ID
    await ctx.runMutation(api.creators.update, {
      id: args.creatorId,
      voiceId
    });

    return { voiceId };
  }
});
```

**Key Features:**
- Can call external services
- Can call mutations/queries via `ctx.runMutation()` and `ctx.runQuery()`
- Not transactional (no automatic rollback)
- Access to `process.env` for secrets

#### Internal Functions

**Purpose:** Functions only callable from other Convex functions (not from clients)

```typescript
// convex/auth.ts (internal functions)
import { internalMutation, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "@convex-dev/resend";
import { components } from "./_generated/api";

export const createPasswordResetToken = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", args.email))
      .unique();

    if (!user) return null;

    const token = crypto.randomUUID();
    const expires = Date.now() + 3600000; // 1 hour

    await ctx.db.insert("verificationTokens", {
      identifier: args.email,
      token,
      expires,
      type: "password_reset"
    });

    return { token, email: args.email };
  }
});

export const sendPasswordResetEmailAction = internalAction({
  args: { email: v.string(), resetLink: v.string() },
  handler: async (ctx, args) => {
    const resend = new Resend(components.resend, { testMode: false });

    await resend.sendEmail(ctx, {
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: args.email,
      subject: "Reset your password",
      html: `
        <h1>Reset your password</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${args.resetLink}">Reset Password</a>
        <p>This link expires in 1 hour.</p>
      `,
    });
  }
});
```

### Database Operations

#### Basic CRUD

```typescript
// Insert
const id = await ctx.db.insert("entities", {
  type: "creator",
  name: "John Doe",
  properties: {},
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now()
});

// Get by ID
const entity = await ctx.db.get(id);

// Update (partial)
await ctx.db.patch(id, {
  properties: { bio: "Updated bio" },
  updatedAt: Date.now()
});

// Replace (full)
await ctx.db.replace(id, {
  type: "creator",
  name: "John Doe",
  properties: { bio: "New bio" },
  status: "active",
  createdAt: entity.createdAt,
  updatedAt: Date.now()
});

// Delete
await ctx.db.delete(id);
```

#### Queries with Indexes

```typescript
// Query by index
const creators = await ctx.db
  .query("entities")
  .withIndex("by_type", q => q.eq("type", "creator"))
  .collect();

// Compound index query
const activeCreators = await ctx.db
  .query("entities")
  .withIndex("by_type_status", q =>
    q.eq("type", "creator").eq("status", "active")
  )
  .collect();

// Filter after index
const recentCreators = await ctx.db
  .query("entities")
  .withIndex("by_type", q => q.eq("type", "creator"))
  .filter(q => q.gt(q.field("createdAt"), Date.now() - 86400000))
  .order("desc")
  .take(10);

// Unique result
const creator = await ctx.db
  .query("entities")
  .withIndex("by_type", q => q.eq("type", "creator"))
  .filter(q => q.eq(q.field("properties.email"), email))
  .unique();

// First result (optional)
const firstCreator = await ctx.db
  .query("entities")
  .withIndex("by_type", q => q.eq("type", "creator"))
  .first();
```

#### Pagination

```typescript
import { paginationOptsValidator } from "convex/server";

export const listPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("entities")
      .withIndex("by_type", q => q.eq("type", "creator"))
      .order("desc")
      .paginate(args.paginationOpts);
  }
});
```

#### Relationship Queries

```typescript
// Get all content authored by creator
const contentConnections = await ctx.db
  .query("connections")
  .withIndex("from_type", q =>
    q.eq("fromEntityId", creatorId)
     .eq("relationshipType", "authored")
  )
  .collect();

const content = await Promise.all(
  contentConnections.map(conn => ctx.db.get(conn.toEntityId))
);

// Get all followers of creator
const followerConnections = await ctx.db
  .query("connections")
  .withIndex("to_type", q =>
    q.eq("toEntityId", creatorId)
     .eq("relationshipType", "following")
  )
  .collect();

// Bidirectional relationship check
const existingConnection = await ctx.db
  .query("connections")
  .withIndex("bidirectional", q =>
    q.eq("fromEntityId", userId)
     .eq("toEntityId", creatorId)
     .eq("relationshipType", "following")
  )
  .unique();
```

### File Storage

```typescript
// Generate upload URL (mutation)
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  }
});

// Save file reference (mutation)
export const saveFile = mutation({
  args: {
    storageId: v.id("_storage"),
    name: v.string(),
    type: v.string(),
    size: v.number()
  },
  handler: async (ctx, args) => {
    const fileId = await ctx.db.insert("entities", {
      type: "media_asset",
      name: args.name,
      properties: {
        storageId: args.storageId,
        fileType: args.type,
        fileSize: args.size
      },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    return { fileId };
  }
});

// Get file URL (mutation or action)
export const getFileUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  }
});
```

### Scheduled Functions (Crons)

```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Every hour
crons.interval(
  "cleanup expired tokens",
  { minutes: 60 },
  internal.auth.cleanupExpiredTokens
);

// Every day at midnight UTC
crons.daily(
  "daily content generation",
  { hourUTC: 0, minuteUTC: 0 },
  internal.content.generateDailyContent
);

// Every Monday at 9 AM UTC
crons.weekly(
  "weekly analytics report",
  { hourUTC: 9, minuteUTC: 0, dayOfWeek: "monday" },
  internal.analytics.generateWeeklyReport
);

// Every month on the 1st at 10 AM UTC
crons.monthly(
  "monthly billing",
  { hourUTC: 10, minuteUTC: 0, day: 1 },
  internal.billing.processMonthlyBilling
);

export default crons;
```

---

## Effect.ts Service Layer

### Service Architecture

Effect.ts services provide typed, composable business logic with automatic dependency injection.

#### Creating a Service

```typescript
// convex/services/tokens/purchase.ts
import { Effect } from "effect";
import { ConvexDatabase } from "../core/database";
import { StripeProvider } from "../providers/stripe";
import { BlockchainProvider } from "../providers/blockchain";

export class TokenService extends Effect.Service<TokenService>()(
  "TokenService",
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;
      const stripe = yield* StripeProvider;
      const blockchain = yield* BlockchainProvider;

      return {
        purchase: ({
          userId,
          tokenId,
          amount,
          usdAmount
        }: {
          userId: Id<"entities">;
          tokenId: Id<"entities">;
          amount: number;
          usdAmount: number;
        }) =>
          Effect.gen(function* () {
            // All operations must succeed atomically
            const [payment, tokens] = yield* Effect.all(
              [
                stripe.charge({
                  amount: usdAmount * 100,
                  currency: "usd",
                  metadata: { userId, tokenId, amount }
                }),
                blockchain.mint({
                  contractAddress: tokenId,
                  toAddress: userId,
                  amount
                })
              ],
              { concurrency: 2 }
            );

            // Record in database
            yield* db.insert("events", {
              type: "tokens_purchased",
              actorId: userId,
              targetId: tokenId,
              timestamp: Date.now(),
              metadata: {
                amount,
                usdAmount,
                paymentId: payment.id,
                txHash: tokens.transactionHash
              }
            });

            // Update balance
            yield* db.upsert("connections", {
              fromEntityId: userId,
              toEntityId: tokenId,
              relationshipType: "holds_tokens",
              metadata: { balance: amount }
            });

            return {
              paymentId: payment.id,
              txHash: tokens.transactionHash,
              amount
            };
          }).pipe(
            // Automatic rollback on error
            Effect.onError((error) =>
              Effect.all([
                stripe.refund(payment.id),
                blockchain.burn({ contractAddress: tokenId, amount })
              ])
            ),
            Effect.retry({ times: 3 }),
            Effect.timeout("5 minutes"),
            Effect.withSpan("purchaseTokens", {
              attributes: { userId, tokenId, amount }
            })
          )
      };
    }),
    dependencies: [
      ConvexDatabase.Default,
      StripeProvider.Default,
      BlockchainProvider.Default
    ]
  }
) {}
```

#### Using Services in Convex Functions

```typescript
// convex/mutations/tokens.ts
import { confect } from "convex-helpers/server/confect";
import { v } from "convex/values";
import { Effect } from "effect";
import { TokenService } from "../services/tokens/purchase";
import { MainLayer } from "../services";

export const purchase = confect.mutation({
  args: {
    tokenId: v.id("entities"),
    amount: v.number(),
    usdAmount: v.number()
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const userId = yield* getUserId(ctx);
      const tokenService = yield* TokenService;

      return yield* tokenService.purchase({
        userId,
        tokenId: args.tokenId,
        amount: args.amount,
        usdAmount: args.usdAmount
      });
    }).pipe(
      Effect.provide(MainLayer),
      Effect.catchTags({
        StripeError: (error) =>
          Effect.fail(new ConvexError({
            message: `Payment failed: ${error.message}`
          })),
        BlockchainError: (error) =>
          Effect.fail(new ConvexError({
            message: `Token minting failed: ${error.message}`
          }))
      })
    )
});
```

### Typed Errors

```typescript
// convex/services/errors.ts
export class NotFoundError {
  readonly _tag = "NotFoundError";
  constructor(
    readonly message: string,
    readonly entityId?: string
  ) {}
}

export class ValidationError {
  readonly _tag = "ValidationError";
  constructor(
    readonly field: string,
    readonly message: string
  ) {}
}

export class InsufficientTokensError {
  readonly _tag = "InsufficientTokensError";
  constructor(
    readonly userId: string,
    readonly required: number,
    readonly available: number
  ) {}
}

export class PaymentFailedError {
  readonly _tag = "PaymentFailedError";
  constructor(
    readonly message: string,
    readonly code?: string
  ) {}
}

// Usage with typed error handling
Effect.gen(function* () {
  const result = yield* tokenService.purchase(args);
  return result;
}).pipe(
  Effect.catchTag("InsufficientTokensError", (error) =>
    Effect.succeed({
      error: `You need ${error.required} tokens but only have ${error.available}`
    })
  ),
  Effect.catchTag("PaymentFailedError", (error) =>
    Effect.succeed({
      error: `Payment failed: ${error.message}`
    })
  )
)
```

---

## External Service Providers

### OpenAI Provider

```typescript
// convex/services/providers/openai.ts
import { Effect } from "effect";

export class OpenAIProvider extends Effect.Service<OpenAIProvider>()(
  "OpenAIProvider",
  {
    effect: Effect.gen(function* () {
      return {
        chat: ({
          systemPrompt,
          messages,
          temperature = 0.7
        }: {
          systemPrompt: string;
          messages: Array<{ role: string; content: string }>;
          temperature?: number;
        }) =>
          Effect.tryPromise({
            try: async () => {
              const response = await fetch(
                "https://api.openai.com/v1/chat/completions",
                {
                  method: "POST",
                  headers: {
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    model: "gpt-4-turbo-preview",
                    messages: [
                      { role: "system", content: systemPrompt },
                      ...messages
                    ],
                    temperature
                  }),
                }
              );

              const data = await response.json();
              return {
                content: data.choices[0].message.content,
                usage: data.usage
              };
            },
            catch: (error) => new OpenAIError(String(error))
          }),

        embed: (text: string) =>
          Effect.tryPromise({
            try: async () => {
              const response = await fetch(
                "https://api.openai.com/v1/embeddings",
                {
                  method: "POST",
                  headers: {
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    model: "text-embedding-ada-002",
                    input: text
                  }),
                }
              );

              const data = await response.json();
              return data.data[0].embedding;
            },
            catch: (error) => new OpenAIError(String(error))
          })
      };
    })
  }
) {}

class OpenAIError {
  readonly _tag = "OpenAIError";
  constructor(readonly message: string) {}
}
```

### Stripe Provider

```typescript
// convex/services/providers/stripe.ts
import { Effect } from "effect";
import Stripe from "stripe";

export class StripeProvider extends Effect.Service<StripeProvider>()(
  "StripeProvider",
  {
    effect: Effect.gen(function* () {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2023-10-16"
      });

      return {
        charge: ({
          amount,
          currency,
          metadata
        }: {
          amount: number;
          currency: string;
          metadata?: Record<string, string>;
        }) =>
          Effect.tryPromise({
            try: async () => {
              const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency,
                metadata
              });
              return paymentIntent;
            },
            catch: (error) => new StripeError(String(error))
          }),

        refund: (paymentIntentId: string) =>
          Effect.tryPromise({
            try: async () => {
              const refund = await stripe.refunds.create({
                payment_intent: paymentIntentId
              });
              return refund;
            },
            catch: (error) => new StripeError(String(error))
          })
      };
    })
  }
) {}

class StripeError {
  readonly _tag = "StripeError";
  constructor(readonly message: string) {}
}
```

### Blockchain Provider

```typescript
// convex/services/providers/blockchain.ts
import { Effect } from "effect";
import { ethers } from "ethers";

export class BlockchainProvider extends Effect.Service<BlockchainProvider>()(
  "BlockchainProvider",
  {
    effect: Effect.gen(function* () {
      const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
      const wallet = new ethers.Wallet(
        process.env.DEPLOYER_PRIVATE_KEY!,
        provider
      );

      return {
        mint: ({
          contractAddress,
          toAddress,
          amount
        }: {
          contractAddress: string;
          toAddress: string;
          amount: number;
        }) =>
          Effect.tryPromise({
            try: async () => {
              const contract = new ethers.Contract(
                contractAddress,
                ["function mint(address to, uint256 amount)"],
                wallet
              );

              const tx = await contract.mint(toAddress, amount);
              const receipt = await tx.wait();

              return {
                transactionHash: receipt.hash,
                blockNumber: receipt.blockNumber
              };
            },
            catch: (error) => new BlockchainError(String(error))
          }),

        burn: ({
          contractAddress,
          amount
        }: {
          contractAddress: string;
          amount: number;
        }) =>
          Effect.tryPromise({
            try: async () => {
              const contract = new ethers.Contract(
                contractAddress,
                ["function burn(uint256 amount)"],
                wallet
              );

              const tx = await contract.burn(amount);
              const receipt = await tx.wait();

              return {
                transactionHash: receipt.hash,
                blockNumber: receipt.blockNumber
              };
            },
            catch: (error) => new BlockchainError(String(error))
          })
      };
    })
  }
) {}

class BlockchainError {
  readonly _tag = "BlockchainError";
  constructor(readonly message: string) {}
}
```

---

## Frontend Integration

### React Components with Convex Hooks

```typescript
// src/components/features/tokens/TokenPurchase.tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";

interface TokenPurchaseProps {
  tokenId: Id<"entities">;
}

export function TokenPurchase({ tokenId }: TokenPurchaseProps) {
  const token = useQuery(api.tokens.get, { id: tokenId });
  const balance = useQuery(api.tokens.getBalance, { tokenId });
  const purchase = useMutation(api.tokens.purchase);

  const [amount, setAmount] = useState(100);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Loading state
  if (token === undefined || balance === undefined) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (token === null) {
    return (
      <Card>
        <CardContent className="py-6">
          <Alert variant="destructive">
            <AlertDescription>Token not found</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);

    try {
      await purchase({
        tokenId,
        amount,
        usdAmount: amount * token.properties.priceUsd
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase {token.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Current Balance</p>
          <p className="text-2xl font-bold">{balance?.amount || 0}</p>
        </div>

        <div>
          <label className="text-sm font-medium">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Total Cost</p>
          <p className="text-xl font-bold">
            ${(amount * token.properties.priceUsd).toFixed(2)}
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handlePurchase}
          disabled={loading || amount <= 0}
          className="w-full"
        >
          {loading ? "Processing..." : `Buy ${amount} Tokens`}
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Astro Pages with SSR

```astro
---
// src/pages/tokens/[id].astro
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import Layout from "@/layouts/Layout.astro";
import { TokenPurchase } from "@/components/features/tokens/TokenPurchase";

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const token = await convex.query(api.tokens.get, { id: Astro.params.id as any });

if (!token) {
  return Astro.redirect("/404");
}
---

<Layout title={`${token.name} - Token Details`}>
  <div class="container mx-auto py-12">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h1 class="text-4xl font-bold mb-4">{token.name}</h1>
        <p class="text-lg text-muted-foreground mb-6">
          {token.properties.description}
        </p>

        <div class="space-y-4">
          <div>
            <p class="text-sm text-muted-foreground">Price</p>
            <p class="text-2xl font-bold">
              ${token.properties.priceUsd.toFixed(2)}
            </p>
          </div>

          <div>
            <p class="text-sm text-muted-foreground">Total Supply</p>
            <p class="text-2xl font-bold">
              {token.properties.totalSupply.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div>
        <TokenPurchase client:load tokenId={token._id} />
      </div>
    </div>
  </div>
</Layout>
```

---

## Authentication API

### Better Auth Integration

The ONE platform uses Better Auth for authentication, not Convex Auth.

#### Auth Configuration

```typescript
// convex/auth.config.ts
import { betterAuth } from "better-auth";
import { convexAdapter } from "better-auth/adapters/convex";

export const auth = betterAuth({
  database: convexAdapter(),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
```

#### Auth Helpers

```typescript
// convex/auth.ts
import { query, mutation, internalMutation, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "@convex-dev/resend";
import { components } from "./_generated/api";
import { internal } from "./_generated/api";

export const getUserId = async (ctx: any): Promise<string | null> => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", q => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();

  return user?._id || null;
};

export const requestPasswordReset = mutation({
  args: { email: v.string(), baseUrl: v.string() },
  handler: async (ctx, args) => {
    const result = await ctx.runMutation(internal.auth.createPasswordResetToken, {
      email: args.email,
    });

    if (!result) return { success: true };

    const resetLink = `${args.baseUrl}/reset-password?token=${result.token}`;

    await ctx.scheduler.runAfter(0, internal.auth.sendPasswordResetEmailAction, {
      email: result.email,
      resetLink,
    });

    return { success: true };
  },
});

export const createPasswordResetToken = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", args.email))
      .unique();

    if (!user) return null;

    const token = crypto.randomUUID();
    const expires = Date.now() + 3600000; // 1 hour

    await ctx.db.insert("verificationTokens", {
      identifier: args.email,
      token,
      expires,
      type: "password_reset"
    });

    return { token, email: args.email };
  },
});

export const sendPasswordResetEmailAction = internalAction({
  args: { email: v.string(), resetLink: v.string() },
  handler: async (ctx, args) => {
    const resend = new Resend(components.resend, { testMode: false });

    await resend.sendEmail(ctx, {
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: args.email,
      subject: "Reset your password",
      html: `<a href="${args.resetLink}">Reset Password</a>`,
    });
  },
});
```

---

## Schema Reference (4-Table Ontology)

The ONE platform uses a **4-table ontology** where every feature maps to one of these tables:

```
┌──────────────────────────────────────────────────────────────┐
│                      ENTITIES TABLE                          │
│  Every "thing" - users, agents, content, tokens, courses    │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                    CONNECTIONS TABLE                         │
│  Every relationship - owns, follows, taught_by, powers      │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                      EVENTS TABLE                            │
│  Every action - purchased, created, viewed, completed        │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                       TAGS TABLE                             │
│  Every category - industry:fitness, skill:video, etc.       │
└──────────────────────────────────────────────────────────────┘
```

**Golden Rule:** If you can't map your feature to these 4 tables, you're thinking about it wrong.

### Entities Table

**46 entity types** representing all objects in the ONE platform.

**What goes in Entities?**
- Simple test: If you can point at it and say "this is a ___", it's an entity.
- Examples: "This is a creator" ✅ | "This is a relationship" ❌ (that's a connection)

```typescript
entities: defineTable({
  type: v.union(
    // Core (3)
    v.literal("creator"),           // Human creator
    v.literal("ai_clone"),          // Digital twin of creator
    v.literal("audience_member"),   // Fan/user

    // Business Agents (10)
    v.literal("strategy_agent"),      // Vision, planning, OKRs
    v.literal("research_agent"),      // Market, trends, competitors
    v.literal("marketing_agent"),     // Content strategy, SEO
    v.literal("sales_agent"),         // Funnels, conversion
    v.literal("service_agent"),       // Support, onboarding
    v.literal("design_agent"),        // Brand, UI/UX, assets
    v.literal("engineering_agent"),   // Tech, integration
    v.literal("finance_agent"),       // Revenue, costs, forecasting
    v.literal("legal_agent"),         // Compliance, contracts, IP
    v.literal("intelligence_agent"),  // Analytics, insights

    // Content (7)
    v.literal("blog_post"),
    v.literal("video"),
    v.literal("podcast"),
    v.literal("social_post"),
    v.literal("email"),
    v.literal("course"),
    v.literal("lesson"),

    // Products (4)
    v.literal("digital_product"),
    v.literal("membership"),
    v.literal("consultation"),
    v.literal("nft"),

    // Community (3)
    v.literal("community"),
    v.literal("conversation"),
    v.literal("message"),

    // Token (2)
    v.literal("token"),
    v.literal("token_contract"),

    // Knowledge (2)
    v.literal("knowledge_item"),
    v.literal("embedding"),

    // Platform (6)
    v.literal("website"),
    v.literal("landing_page"),
    v.literal("template"),
    v.literal("livestream"),
    v.literal("recording"),
    v.literal("media_asset"),

    // Business (7)
    v.literal("payment"),
    v.literal("subscription"),
    v.literal("invoice"),
    v.literal("metric"),
    v.literal("insight"),
    v.literal("prediction"),
    v.literal("report"),

    // Marketing (5)
    v.literal("notification"),
    v.literal("email_campaign"),
    v.literal("announcement"),
    v.literal("referral"),
    v.literal("campaign"),
    v.literal("lead")
  ),

  name: v.string(),                // Display name
  properties: v.any(),             // Type-specific data (JSON)
  status: v.optional(v.union(
    v.literal("active"),
    v.literal("inactive"),
    v.literal("draft"),
    v.literal("published"),
    v.literal("archived")
  )),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number())
})
  .index("by_type", ["type"])
  .index("by_status", ["status"])
  .index("by_type_status", ["type", "status"])
  .index("by_created", ["createdAt"])
  .index("by_updated", ["updatedAt"])
  .searchIndex("search_entities", {
    searchField: "name",
    filterFields: ["type", "status"]
  })
```

#### Example Entity Properties by Type

**Creator:**
```typescript
{
  email: string,
  username: string,
  displayName: string,
  bio?: string,
  avatar?: string,
  niche: string[],              // ["fitness", "nutrition"]
  expertise: string[],
  targetAudience: string,
  brandColors?: {
    primary: string,
    secondary: string,
    accent: string
  },
  totalFollowers: number,
  totalContent: number,
  totalRevenue: number
}
```

**AI Clone:**
```typescript
{
  voiceId?: string,
  voiceProvider?: "elevenlabs" | "azure" | "custom",
  appearanceId?: string,
  appearanceProvider?: "d-id" | "heygen" | "custom",
  systemPrompt: string,
  temperature: number,
  knowledgeBaseSize: number,
  lastTrainingDate: number,
  totalInteractions: number,
  satisfactionScore: number
}
```

**Token:**
```typescript
{
  contractAddress: string,
  blockchain: "sui" | "base" | "solana",
  standard: "ERC20" | "ERC721" | "ERC1155",
  totalSupply: number,
  circulatingSupply: number,
  price: number,
  marketCap: number,
  utility: string[],
  burnRate: number,
  holders: number,
  transactions24h: number,
  volume24h: number
}
```

**Course:**
```typescript
{
  title: string,
  description: string,
  thumbnail?: string,
  modules: number,
  lessons: number,
  totalDuration: number,
  price: number,
  currency: string,
  tokenPrice?: number,
  enrollments: number,
  completions: number,
  averageRating: number,
  generatedBy: "ai" | "human" | "hybrid",
  personalizationLevel: "none" | "basic" | "advanced"
}
```

### Connections Table

**24 relationship types** (consolidated from 33).

```typescript
connections: defineTable({
  fromEntityId: v.id("entities"),
  toEntityId: v.id("entities"),
  relationshipType: v.union(
    // Ownership (2)
    v.literal("owns"),
    v.literal("created_by"),

    // AI (3)
    v.literal("clone_of"),
    v.literal("trained_on"),
    v.literal("powers"),

    // Content (5)
    v.literal("authored"),
    v.literal("generated_by"),
    v.literal("published_to"),
    v.literal("part_of"),
    v.literal("references"),

    // Community (4)
    v.literal("member_of"),
    v.literal("following"),
    v.literal("moderates"),
    v.literal("participated_in"),

    // Business (4)
    v.literal("manages"),
    v.literal("reports_to"),
    v.literal("collaborates_with"),
    v.literal("assigned_to"),

    // Token (3)
    v.literal("holds_tokens"),
    v.literal("staked_in"),
    v.literal("earned_from"),

    // Product (4)
    v.literal("purchased"),
    v.literal("enrolled_in"),
    v.literal("completed"),
    v.literal("teaching"),

    // Consolidated (3)
    v.literal("transacted"), // payment, subscription, invoice
    v.literal("referred"), // direct, conversion, campaign
    v.literal("notified"), // email, sms, push, in_app

    // Media (2)
    v.literal("featured_in"),
    v.literal("hosted_on"),

    // Analytics (3)
    v.literal("analyzed_by"),
    v.literal("optimized_by"),
    v.literal("influences")
  ),
  metadata: v.optional(v.any()),
  createdAt: v.number(),
  deletedAt: v.optional(v.number())
})
  .index("from_entity", ["fromEntityId"])
  .index("to_entity", ["toEntityId"])
  .index("from_type", ["fromEntityId", "relationshipType"])
  .index("to_type", ["toEntityId", "relationshipType"])
  .index("bidirectional", ["fromEntityId", "toEntityId", "relationshipType"])
  .index("by_created", ["createdAt"])
```

### Events Table

**35 event types** (consolidated from 54).

```typescript
events: defineTable({
  type: v.union(
    // Creator (3)
    v.literal("creator_created"),
    v.literal("creator_updated"),
    v.literal("content_uploaded"),

    // AI Clone (5)
    v.literal("clone_created"),
    v.literal("clone_interaction"),
    v.literal("clone_generated_content"),
    v.literal("voice_cloned"),
    v.literal("appearance_cloned"),

    // Agent (4)
    v.literal("agent_created"),
    v.literal("agent_executed"),
    v.literal("agent_completed"),
    v.literal("agent_failed"),

    // Content (2 - consolidated)
    v.literal("content_changed"), // created, updated, deleted
    v.literal("content_interacted"), // viewed, shared, liked

    // Audience (4)
    v.literal("user_joined"),
    v.literal("user_engaged"),
    v.literal("ugc_created"),
    v.literal("comment_posted"),

    // Course (5)
    v.literal("course_created"),
    v.literal("course_enrolled"),
    v.literal("lesson_completed"),
    v.literal("course_completed"),
    v.literal("certificate_earned"),

    // Token (7)
    v.literal("token_deployed"),
    v.literal("tokens_purchased"),
    v.literal("tokens_earned"),
    v.literal("tokens_burned"),
    v.literal("tokens_staked"),
    v.literal("tokens_unstaked"),
    v.literal("governance_vote"),

    // Business (3)
    v.literal("revenue_generated"),
    v.literal("cost_incurred"),
    v.literal("referral_made"),

    // Growth (4)
    v.literal("viral_share"),
    v.literal("referral_converted"),
    v.literal("achievement_unlocked"),
    v.literal("level_up"),

    // Analytics (5)
    v.literal("metric_calculated"),
    v.literal("insight_generated"),
    v.literal("prediction_made"),
    v.literal("optimization_applied"),
    v.literal("report_generated"),

    // Consolidated events
    v.literal("payment_processed"), // initiated, completed, failed, refunded
    v.literal("subscription_updated"), // started, renewed, cancelled
    v.literal("livestream_status_changed"), // scheduled, started, ended
    v.literal("livestream_interaction"), // joined, left, message
    v.literal("notification_delivered"), // email, sms, push, in_app
    v.literal("referral_activity"), // created, converted
    v.literal("lead_captured")
  ),
  actorId: v.id("entities"),
  targetId: v.optional(v.id("entities")),
  timestamp: v.number(),
  metadata: v.any() // Event-specific data
})
  .index("by_type", ["type"])
  .index("by_actor", ["actorId"])
  .index("by_target", ["targetId"])
  .index("by_timestamp", ["timestamp"])
  .index("by_actor_type", ["actorId", "type"])
  .index("by_target_type", ["targetId", "type"])
```

### Tags Table

Simple key-value tagging system for categorization.

```typescript
tags: defineTable({
  entityId: v.id("entities"),
  key: v.string(),
  value: v.string()
})
  .index("by_entity", ["entityId"])
  .index("by_key", ["key"])
  .index("by_key_value", ["key", "value"])
```

---

## Error Handling

### Typed Errors in Effect.ts

```typescript
// Define error classes
export class NotFoundError {
  readonly _tag = "NotFoundError";
  constructor(readonly message: string) {}
}

export class ValidationError {
  readonly _tag = "ValidationError";
  constructor(
    readonly field: string,
    readonly message: string
  ) {}
}

// Use in service
Effect.gen(function* () {
  const user = yield* db.get(userId);
  if (!user) {
    return yield* Effect.fail(new NotFoundError("User not found"));
  }
  return user;
}).pipe(
  Effect.catchTag("NotFoundError", (error) =>
    Effect.succeed({ error: error.message })
  )
)
```

### Convex Error Handling

```typescript
import { ConvexError } from "convex/values";

export const myMutation = mutation({
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new ConvexError({
        message: "User not found",
        code: "NOT_FOUND"
      });
    }

    // ... continue
  }
});
```

---

## Environment Variables

### Required Variables

```bash
# Convex
CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=your-deployment-name

# Better Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=https://your-domain.com

# OAuth Providers
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...

# Blockchain (Base L2)
BASE_RPC_URL=https://mainnet.base.org
DEPLOYER_PRIVATE_KEY=0x...

# AI Services
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
```

---

## Quick Reference

### Common Validators

```typescript
import { v } from "convex/values";

// Primitives
v.string()
v.number()
v.boolean()
v.null()
v.any()

// Complex types
v.id("tableName")
v.array(v.string())
v.object({ name: v.string(), age: v.number() })
v.union(v.literal("a"), v.literal("b"))
v.optional(v.string())

// Pagination
paginationOptsValidator
```

### Best Practices

1. **Always use indexes** for queries on non-_id fields
2. **Email sending** must be in internal actions, scheduled from mutations
3. **Use Effect.ts** for all business logic with multiple steps or external calls
4. **Type all errors** with `_tag` for exhaustive error handling
5. **Validate args** with Convex validators
6. **Log events** for all significant actions
7. **Use .unique()** when expecting exactly one result, `.first()` for optional
8. **Schedule background work** with `ctx.scheduler.runAfter()`
9. **Keep mutations fast** - use actions for long-running operations
10. **Always provide MainLayer** when using Effect.ts services in Convex functions

---

## How Features Map to Ontology

Understanding how to map features to the 4-table ontology is critical for implementing new functionality.

### Example: AI Clone Creation

**Feature Goal:** Allow creators to create AI clones of themselves.

**Ontology Mapping:**

**Entities Created:**
1. `ai_clone` entity (the digital twin)
2. Multiple `knowledge_item` entities (training data from creator's content)

**Connections Created:**
1. creator → ai_clone (`owns`)
2. ai_clone → knowledge_items (`trained_on`)
3. agent → ai_clone (`powers`) - which agent runs the clone

**Events Logged:**
1. `clone_created` - when clone entity created
2. `voice_cloned` - when voice cloning completes
3. `appearance_cloned` - when appearance cloning completes

**Tags Added:**
- Clone inherits creator's `industry` and `skill` tags
- Additional tags: `status:training`, `status:active`

### Example: Token Purchase

**Feature Goal:** Allow users to purchase creator tokens.

**Ontology Mapping:**

**Entities Involved:**
1. `token` entity (the token being purchased)
2. `audience_member` entity (the buyer)

**Connections Created/Updated:**
1. buyer → token (`holds_tokens`, metadata: { balance: 100, blockchain: "sui" })

**Events Logged:**
1. `tokens_purchased` (amount, blockchain, payment details)
2. `revenue_generated` (for creator)
3. `payment_processed` (fiat) OR blockchain transaction event (crypto)

**Tags Added:**
- None (tokens already have tags)

### Example: Course Generation

**Feature Goal:** AI generates a personalized course for a creator.

**Ontology Mapping:**

**Entities Created:**
1. `course` entity
2. Multiple `lesson` entities (one per lesson)
3. `content` entities for each lesson (video, text, quiz)

**Connections Created:**
1. creator → course (`owns`)
2. ai_agent → course (`generated_by`)
3. ai_clone → course (`teaching`)
4. course → lessons (`part_of`)
5. lessons → content (`part_of`)

**Events Logged:**
1. `course_created`
2. `clone_generated_content` (for each lesson)

**Tags Added:**
- `skill` tags - what the course teaches
- `industry` tags - course category
- `audience` tags - target skill level
- `format` tag - video, text, interactive

### Example: Livestream Session

**Feature Goal:** Creator hosts a livestream with AI clone co-host.

**Ontology Mapping:**

**Entities Created:**
1. `livestream` entity
2. `recording` entity (after stream ends)
3. Multiple `message` entities (chat messages)

**Connections Created:**
1. creator → livestream (`owns`)
2. ai_clone → livestream (`participated_in`)
3. livestream → platform (`hosted_on`)
4. viewers → livestream (`participated_in`)

**Events Logged:**
1. `livestream_status_changed` (scheduled → started → ended)
2. `livestream_interaction` (viewers joining, leaving, chatting)
3. `content_changed` (recording created after stream)

**Tags Added:**
- `topic` tags for stream content
- `format:live` tag

---

## Query Patterns for Common Operations

### Get Creator with All Their Content

```typescript
export const getCreatorWithContent = query({
  args: { creatorId: v.id("entities") },
  handler: async (ctx, args) => {
    // Get creator
    const creator = await ctx.db.get(args.creatorId);
    if (!creator || creator.type !== "creator") {
      return null;
    }

    // Get all authored connections
    const authoredConnections = await ctx.db
      .query("connections")
      .withIndex("from_type", q =>
        q.eq("fromEntityId", args.creatorId)
         .eq("relationshipType", "authored")
      )
      .collect();

    // Get all content entities
    const content = await Promise.all(
      authoredConnections.map(conn => ctx.db.get(conn.toEntityId))
    );

    // Get follower count
    const followers = await ctx.db
      .query("connections")
      .withIndex("to_type", q =>
        q.eq("toEntityId", args.creatorId)
         .eq("relationshipType", "following")
      )
      .collect();

    return {
      ...creator,
      content: content.filter(Boolean),
      followerCount: followers.length
    };
  }
});
```

### Get User's Token Holdings

```typescript
export const getUserTokenHoldings = query({
  args: { userId: v.id("entities") },
  handler: async (ctx, args) => {
    // Get all token holding connections
    const holdings = await ctx.db
      .query("connections")
      .withIndex("from_type", q =>
        q.eq("fromEntityId", args.userId)
         .eq("relationshipType", "holds_tokens")
      )
      .collect();

    // Get token details
    const tokens = await Promise.all(
      holdings.map(async (holding) => {
        const token = await ctx.db.get(holding.toEntityId);
        return {
          ...token,
          balance: holding.metadata?.balance || 0,
          blockchain: holding.metadata?.blockchain || "unknown"
        };
      })
    );

    return tokens.filter(Boolean);
  }
});
```

### Get Content Interaction History

```typescript
export const getContentHistory = query({
  args: { contentId: v.id("entities"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_target_type", q =>
        q.eq("targetId", args.contentId)
         .eq("type", "content_interacted")
      )
      .order("desc")
      .take(args.limit || 100);

    // Get actor details for each event
    const history = await Promise.all(
      events.map(async (event) => {
        const actor = await ctx.db.get(event.actorId);
        return {
          timestamp: event.timestamp,
          interactionType: event.metadata.interactionType,
          actor: actor?.name || "Unknown",
          duration: event.metadata.duration
        };
      })
    );

    return history;
  }
});
```

### Get AI Clone Performance Metrics

```typescript
export const getCloneMetrics = query({
  args: { cloneId: v.id("entities") },
  handler: async (ctx, args) => {
    const clone = await ctx.db.get(args.cloneId);
    if (!clone || clone.type !== "ai_clone") {
      return null;
    }

    // Get interaction count (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const interactions = await ctx.db
      .query("events")
      .withIndex("by_target_type", q =>
        q.eq("targetId", args.cloneId)
         .eq("type", "clone_interaction")
      )
      .filter(q => q.gte(q.field("timestamp"), thirtyDaysAgo))
      .collect();

    // Calculate average sentiment
    const sentiments = interactions
      .map(e => e.metadata.sentiment)
      .filter(Boolean);

    const avgSentiment = sentiments.length > 0
      ? sentiments.filter(s => s === "positive").length / sentiments.length
      : 0;

    // Get tokens earned from clone interactions
    const tokensEarned = await ctx.db
      .query("events")
      .withIndex("by_type", q => q.eq("type", "tokens_earned"))
      .filter(q =>
        q.and(
          q.gte(q.field("timestamp"), thirtyDaysAgo),
          q.eq(q.field("metadata.source"), "clone_interaction")
        )
      )
      .collect()
      .then(events =>
        events.reduce((sum, e) => sum + (e.metadata.amount || 0), 0)
      );

    return {
      ...clone,
      metrics: {
        interactions30d: interactions.length,
        avgSentiment,
        tokensEarned30d: tokensEarned,
        satisfactionScore: clone.properties.satisfactionScore
      }
    };
  }
});
```

---

## Migration Guide: Old System → 4-Table Ontology

### Step 1: Identify Entity Types

Map your existing models to the 46 entity types:

| Old Model | New Entity Type | Notes |
|-----------|-----------------|-------|
| User (creator) | `creator` | If they create content |
| User (consumer) | `audience_member` | If they consume content |
| Post | `blog_post` | Or `social_post` depending on platform |
| Video | `video` | Content type |
| Follow | N/A | This becomes a `connection` |
| Like | N/A | This becomes an `event` |
| Comment | `message` | Part of a `conversation` |
| Subscription | `subscription` | Business entity |

### Step 2: Transform Properties

Extract structured data into the `properties` JSON field:

```typescript
// OLD USER MODEL
{
  id: "123",
  name: "John Doe",
  email: "john@example.com",
  bio: "Fitness coach",
  follower_count: 5000,
  created_at: "2024-01-15"
}

// NEW ENTITY
{
  _id: "creator-123",
  type: "creator",
  name: "John Doe",
  properties: {
    email: "john@example.com",
    username: "johndoe",
    displayName: "John Doe",
    bio: "Fitness coach",
    niche: ["fitness", "health"],
    expertise: ["training", "nutrition"],
    targetAudience: "fitness enthusiasts",
    totalFollowers: 5000,
    totalContent: 0,
    totalRevenue: 0
  },
  status: "active",
  createdAt: new Date("2024-01-15").getTime(),
  updatedAt: Date.now()
}
```

### Step 3: Convert Relationships

Transform foreign keys into connections:

```typescript
// OLD: posts table with user_id foreign key
{
  id: "post-456",
  user_id: "user-123",
  title: "My First Post",
  content: "..."
}

// NEW: Separate entities + connection
// 1. Creator entity (user-123 → creator-123)
// 2. Post entity
{
  _id: "post-456",
  type: "blog_post",
  name: "My First Post",
  properties: {
    content: "...",
    publishedAt: Date.now(),
    views: 0
  },
  status: "published",
  createdAt: Date.now(),
  updatedAt: Date.now()
}

// 3. Connection
{
  fromEntityId: "creator-123",
  toEntityId: "post-456",
  relationshipType: "authored",
  createdAt: Date.now()
}
```

### Step 4: Preserve History

Convert activity logs to events:

```typescript
// OLD: Activity log entry
{
  user_id: "123",
  action: "viewed",
  post_id: "456",
  timestamp: 1705334400000
}

// NEW: Event
{
  type: "content_interacted",
  actorId: "user-123",
  targetId: "post-456",
  timestamp: 1705334400000,
  metadata: {
    interactionType: "viewed",
    source: "feed",
    duration: 120
  }
}
```

---

**Last Updated:** 2025-01-15
**Maintainer:** AI Agents + Human Developers

**See Also:**
- `Ontology.md` - Complete ontology specification
- `Schema.md` - Convex schema details
- `Patterns.md` - Code patterns to replicate
- `Architecture.md` - System architecture overview
- `AGENTS.md` - Quick Convex reference for agents
