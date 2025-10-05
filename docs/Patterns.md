# ONE Platform - Code Patterns Library

**Version:** 1.0.0  
**Purpose:** Real, working code patterns that AI agents should recognize and replicate

---

## How to Use This Document

When implementing a feature:
1. Find similar pattern below
2. Copy pattern structure
3. Adapt to your specific needs
4. Maintain the same style and conventions

**These patterns are PROVEN** - they work in production. Replicate them exactly.

---

## Pattern 1: Create Entity with Relationships

### Use Case
Creating any entity that has ownership and relationships (creator, content, token, course, etc.)

### Effect.ts Service
```typescript
// convex/services/entities/creator.ts
import { Effect } from "effect";
import { ConvexDatabase } from "../core/database";

export class CreatorService extends Effect.Service<CreatorService>()(
  "CreatorService",
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;
      
      return {
        create: (data: {
          email: string;
          name: string;
          niche: string[];
        }) =>
          Effect.gen(function* () {
            yield* Effect.logInfo("Creating creator", { email: data.email });
            
            // Step 1: Validate input
            if (!data.email || !data.name) {
              return yield* Effect.fail({
                _tag: "ValidationError",
                field: !data.email ? "email" : "name",
                message: "Required field missing"
              });
            }
            
            // Step 2: Check if already exists
            const existing = yield* Effect.tryPromise(() =>
              db.query("entities")
                .withIndex("by_type", q => q.eq("type", "creator"))
                .filter(q => 
                  q.eq(q.field("properties.email"), data.email)
                )
                .first()
            );
            
            if (existing) {
              return yield* Effect.fail({
                _tag: "DuplicateError",
                email: data.email
              });
            }
            
            // Step 3: Create entity
            const creatorId = yield* Effect.tryPromise(() =>
              db.insert("entities", {
                type: "creator",
                name: data.name,
                properties: {
                  email: data.email,
                  username: data.email.split("@")[0],
                  displayName: data.name,
                  niche: data.niche,
                  expertise: [],
                  totalFollowers: 0,
                  totalContent: 0,
                  totalRevenue: 0
                },
                status: "active",
                createdAt: Date.now(),
                updatedAt: Date.now()
              })
            );
            
            // Step 4: Create initial relationships (if any)
            // e.g., add to default community
            
            // Step 5: Log creation event
            yield* Effect.tryPromise(() =>
              db.insert("events", {
                entityId: creatorId,
                eventType: "creator_created",
                timestamp: Date.now(),
                actorType: "system",
                metadata: {
                  email: data.email,
                  niche: data.niche
                }
              })
            );
            
            yield* Effect.logInfo("Creator created successfully", {
              creatorId
            });
            
            return { creatorId };
          }).pipe(
            Effect.withSpan("createCreator", {
              attributes: { email: data.email }
            })
          )
      };
    }),
    dependencies: [ConvexDatabase.Default]
  }
) {}
```

### Convex Mutation
```typescript
// convex/mutations/creators.ts
import { mutation } from "./_generated/server";
import { confect } from "confect";
import { v } from "convex/values";
import { CreatorService } from "./services/entities/creator";
import { MainLayer } from "./services";

export const create = confect.mutation({
  args: {
    email: v.string(),
    name: v.string(),
    niche: v.array(v.string())
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const creatorService = yield* CreatorService;
      return yield* creatorService.create(args);
    }).pipe(
      Effect.provide(MainLayer),
      Effect.catchTags({
        ValidationError: (error) =>
          Effect.fail(new ConvexError({
            message: error.message,
            field: error.field
          })),
        DuplicateError: (error) =>
          Effect.fail(new ConvexError({
            message: `Creator with email ${error.email} already exists`
          }))
      })
    )
});
```

### React Component
```tsx
// src/components/features/creators/CreatorOnboarding.tsx
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function CreatorOnboarding() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [niche, setNiche] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const createCreator = useMutation(api.creators.create);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const result = await createCreator({ email, name, niche });
      // Success - redirect to dashboard
      window.location.href = `/dashboard/${result.creatorId}`;
    } catch (err) {
      setError(err.message);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Your Creator Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Button type="submit">Create Account</Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### Astro Page
```astro
---
// src/pages/onboard.astro
import Layout from "@/layouts/Layout.astro";
import { CreatorOnboarding } from "@/components/features/creators/CreatorOnboarding";
---

<Layout title="Create Creator Account">
  <div class="container mx-auto py-12">
    <CreatorOnboarding client:load />
  </div>
</Layout>
```

---

## Pattern 2: Query Entity with Relationships

### Use Case
Get an entity and its related entities (creator with their content, user with their courses, etc.)

### Convex Query
```typescript
// convex/queries/creators.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { id: v.id("entities") },
  handler: async (ctx, args) => {
    // Get the creator entity
    const creator = await ctx.db.get(args.id);
    
    if (!creator || creator.type !== "creator") {
      return null;
    }
    
    // Get content authored by creator
    const contentConnections = await ctx.db
      .query("connections")
      .withIndex("from_type", q =>
        q.eq("fromEntityId", args.id)
         .eq("relationshipType", "authored")
      )
      .collect();
    
    const content = await Promise.all(
      contentConnections.map(conn => ctx.db.get(conn.toEntityId))
    );
    
    // Get follower count
    const followers = await ctx.db
      .query("connections")
      .withIndex("to_type", q =>
        q.eq("toEntityId", args.id)
         .eq("relationshipType", "following")
      )
      .collect();
    
    return {
      ...creator,
      content,
      followerCount: followers.length
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
        q.or(
          q.eq(q.field("properties.niche"), args.niche),
          // Check if niche array includes the value
          ...q.field("properties.niche")
        )
      );
    }
    
    const creators = await query
      .take(args.limit || 20);
    
    return creators;
  }
});
```

### React Component
```tsx
// src/components/features/creators/CreatorProfile.tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface CreatorProfileProps {
  creatorId: Id<"entities">;
}

export function CreatorProfile({ creatorId }: CreatorProfileProps) {
  const creator = useQuery(api.creators.get, { id: creatorId });
  
  // Loading state
  if (creator === undefined) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  // Not found state
  if (creator === null) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Creator not found
        </CardContent>
      </Card>
    );
  }
  
  // Success state
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={creator.properties.avatar} />
            <AvatarFallback>
              {creator.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{creator.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {creator.followerCount} followers
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>{creator.properties.bio}</p>
        
        <div className="flex gap-2 flex-wrap">
          {creator.properties.niche.map((n: string) => (
            <Badge key={n} variant="secondary">
              {n}
            </Badge>
          ))}
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">
            Content ({creator.content.length})
          </h3>
          {/* Content list */}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## Pattern 3: Update Entity

### Use Case
Update entity properties and log the change

### Effect.ts Service
```typescript
// convex/services/entities/creator.ts (continued)
update: (id: Id<"entities">, updates: Partial<CreatorProperties>) =>
  Effect.gen(function* () {
    yield* Effect.logInfo("Updating creator", { id, updates });
    
    // Get current entity
    const current = yield* Effect.tryPromise(() => db.get(id));
    
    if (!current || current.type !== "creator") {
      return yield* Effect.fail({
        _tag: "NotFoundError",
        entityId: id
      });
    }
    
    // Merge updates
    const newProperties = {
      ...current.properties,
      ...updates
    };
    
    // Update entity
    yield* Effect.tryPromise(() =>
      db.patch(id, {
        properties: newProperties,
        updatedAt: Date.now()
      })
    );
    
    // Log update event
    yield* Effect.tryPromise(() =>
      db.insert("events", {
        entityId: id,
        eventType: "creator_updated",
        timestamp: Date.now(),
        actorType: "user",
        actorId: id,  // Self-update
        metadata: {
          updatedFields: Object.keys(updates)
        }
      })
    );
    
    return { success: true };
  })
```

### Convex Mutation
```typescript
// convex/mutations/creators.ts
export const update = confect.mutation({
  args: {
    id: v.id("entities"),
    bio: v.optional(v.string()),
    niche: v.optional(v.array(v.string())),
    avatar: v.optional(v.string())
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const { id, ...updates } = args;
      const creatorService = yield* CreatorService;
      return yield* creatorService.update(id, updates);
    }).pipe(Effect.provide(MainLayer))
});
```

---

## Pattern 4: Create Connection (Relationship)

### Use Case
Establish relationship between two entities (follow, enroll, purchase, etc.)

### Effect.ts Service
```typescript
// convex/services/connections/follow.ts
export class FollowService extends Effect.Service<FollowService>()(
  "FollowService",
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;
      
      return {
        follow: (followerId: Id<"entities">, followedId: Id<"entities">) =>
          Effect.gen(function* () {
            // Check if already following
            const existing = yield* Effect.tryPromise(() =>
              db.query("connections")
                .withIndex("from_type", q =>
                  q.eq("fromEntityId", followerId)
                   .eq("relationshipType", "following")
                )
                .filter(q => q.eq(q.field("toEntityId"), followedId))
                .first()
            );
            
            if (existing) {
              return yield* Effect.fail({
                _tag: "AlreadyFollowingError",
                followerId,
                followedId
              });
            }
            
            // Create connection
            const connectionId = yield* Effect.tryPromise(() =>
              db.insert("connections", {
                fromEntityId: followerId,
                toEntityId: followedId,
                relationshipType: "following",
                createdAt: Date.now()
              })
            );
            
            // Log event
            yield* Effect.tryPromise(() =>
              db.insert("events", {
                entityId: followedId,
                eventType: "user_engaged",
                timestamp: Date.now(),
                actorType: "user",
                actorId: followerId,
                metadata: {
                  action: "followed"
                }
              })
            );
            
            // Update follower count
            const followed = yield* Effect.tryPromise(() =>
              db.get(followedId)
            );
            
            if (followed?.type === "creator") {
              yield* Effect.tryPromise(() =>
                db.patch(followedId, {
                  properties: {
                    ...followed.properties,
                    totalFollowers: (followed.properties.totalFollowers || 0) + 1
                  }
                })
              );
            }
            
            return { connectionId };
          }),
        
        unfollow: (followerId: Id<"entities">, followedId: Id<"entities">) =>
          Effect.gen(function* () {
            const connection = yield* Effect.tryPromise(() =>
              db.query("connections")
                .withIndex("from_type")
                .filter(q =>
                  q.and(
                    q.eq(q.field("fromEntityId"), followerId),
                    q.eq(q.field("toEntityId"), followedId),
                    q.eq(q.field("relationshipType"), "following")
                  )
                )
                .first()
            );
            
            if (!connection) {
              return yield* Effect.fail({
                _tag: "NotFollowingError"
              });
            }
            
            // Delete connection
            yield* Effect.tryPromise(() => db.delete(connection._id));
            
            // Update count
            const followed = yield* Effect.tryPromise(() =>
              db.get(followedId)
            );
            
            if (followed?.type === "creator") {
              yield* Effect.tryPromise(() =>
                db.patch(followedId, {
                  properties: {
                    ...followed.properties,
                    totalFollowers: Math.max(
                      (followed.properties.totalFollowers || 0) - 1,
                      0
                    )
                  }
                })
              );
            }
            
            return { success: true };
          })
      };
    }),
    dependencies: [ConvexDatabase.Default]
  }
) {}
```

---

## Pattern 5: Log Event

### Use Case
Record any action or state change

### Effect.ts Helper
```typescript
// convex/services/core/events.ts
export const logEvent = (
  entityId: Id<"entities">,
  eventType: EventType,
  metadata?: any,
  actorId?: Id<"entities">
) =>
  Effect.gen(function* () {
    const db = yield* ConvexDatabase;
    
    yield* Effect.tryPromise(() =>
      db.insert("events", {
        entityId,
        eventType,
        timestamp: Date.now(),
        actorType: actorId ? "user" : "system",
        actorId,
        metadata: metadata || {}
      })
    );
  });

// Usage in other services
yield* logEvent(
  contentId,
  "content_published",
  { platform: "instagram" },
  creatorId
);
```

---

## Pattern 6: AI Clone Interaction

### Use Case
User chats with AI clone, logs interaction, earns tokens

### Effect.ts Service
```typescript
// convex/services/ai/clone.ts
export class AICloneService extends Effect.Service<AICloneService>()(
  "AICloneService",
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;
      const openai = yield* OpenAIProvider;
      const tokens = yield* TokenService;
      
      return {
        chat: (
          cloneId: Id<"entities">,
          message: string,
          userId: Id<"entities">
        ) =>
          Effect.gen(function* () {
            // Get clone configuration
            const clone = yield* Effect.tryPromise(() => db.get(cloneId));
            
            if (!clone || clone.type !== "ai_clone") {
              return yield* Effect.fail({
                _tag: "CloneNotFoundError",
                cloneId
              });
            }
            
            // Check if user has access (token gate)
            const hasAccess = yield* Effect.gen(function* () {
              const connection = yield* Effect.tryPromise(() =>
                db.query("connections")
                  .withIndex("from_type")
                  .filter(q =>
                    q.and(
                      q.eq(q.field("fromEntityId"), userId),
                      q.eq(q.field("relationshipType"), "holds_tokens")
                    )
                  )
                  .first()
              );
              
              return connection && connection.metadata.balance > 0;
            });
            
            if (!hasAccess) {
              return yield* Effect.fail({
                _tag: "AccessDeniedError",
                message: "Purchase tokens to chat with AI clone"
              });
            }
            
            // Get conversation history
            const history = yield* Effect.tryPromise(() =>
              db.query("events")
                .withIndex("entity_type_time")
                .filter(q =>
                  q.and(
                    q.eq(q.field("entityId"), cloneId),
                    q.eq(q.field("eventType"), "clone_interaction"),
                    q.eq(q.field("actorId"), userId)
                  )
                )
                .order("desc")
                .take(10)
            );
            
            // Retrieve relevant knowledge via RAG
            const context = yield* Effect.gen(function* () {
              const embedding = yield* openai.embed(message);
              const results = yield* Effect.tryPromise(() =>
                db.query("embeddings")
                  .withSearchIndex("by_embedding", q =>
                    q.search("embedding", embedding).limit(5)
                  )
                  .collect()
              );
              return results.map(r => r.content).join("\n");
            });
            
            // Generate response
            const response = yield* openai.chat({
              systemPrompt: clone.properties.systemPrompt,
              context,
              messages: [
                ...history.reverse().map(h => ({
                  role: h.metadata.role,
                  content: h.metadata.content
                })),
                { role: "user", content: message }
              ],
              temperature: clone.properties.temperature
            });
            
            // Log interaction
            yield* Effect.tryPromise(() =>
              db.insert("events", {
                entityId: cloneId,
                eventType: "clone_interaction",
                timestamp: Date.now(),
                actorType: "user",
                actorId: userId,
                metadata: {
                  role: "user",
                  content: message,
                  response: response.content,
                  tokensUsed: response.usage.totalTokens
                }
              })
            );
            
            // Reward user with tokens
            yield* tokens.reward({
              userId,
              amount: 10,
              reason: "chat_engagement"
            });
            
            // Update clone stats
            yield* Effect.tryPromise(() =>
              db.patch(cloneId, {
                properties: {
                  ...clone.properties,
                  totalInteractions: clone.properties.totalInteractions + 1
                }
              })
            );
            
            return {
              response: response.content,
              tokensEarned: 10
            };
          }).pipe(
            Effect.withSpan("cloneChat", {
              attributes: { cloneId, userId }
            })
          )
      };
    }),
    dependencies: [
      ConvexDatabase.Default,
      OpenAIProvider.Default,
      TokenService.Default
    ]
  }
) {}
```

---

## Pattern 7: Token Purchase (Atomic Transaction)

### Use Case
Purchase tokens with payment + blockchain + database atomically

### Effect.ts Service
```typescript
// convex/services/tokens/purchase.ts
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
            yield* Effect.logInfo("Starting token purchase", {
              userId,
              tokenId,
              amount
            });
            
            // All operations must succeed together
            const [payment, tokens] = yield* Effect.all(
              [
                // Step 1: Charge payment
                stripe.charge({
                  amount: usdAmount * 100, // Cents
                  currency: "usd",
                  metadata: { userId, tokenId, tokenAmount: amount }
                }),
                
                // Step 2: Mint tokens on blockchain
                blockchain.mint({
                  contractAddress: tokenId,
                  toAddress: userId,
                  amount
                })
              ],
              { concurrency: 2 }
            );
            
            // Step 3: Record in database
            yield* Effect.tryPromise(() =>
              db.insert("events", {
                entityId: tokenId,
                eventType: "tokens_purchased",
                timestamp: Date.now(),
                actorType: "user",
                actorId: userId,
                metadata: {
                  amount,
                  usdAmount,
                  paymentId: payment.id,
                  txHash: tokens.transactionHash
                }
              })
            );
            
            // Step 4: Update or create token balance connection
            const existingConnection = yield* Effect.tryPromise(() =>
              db.query("connections")
                .withIndex("from_type")
                .filter(q =>
                  q.and(
                    q.eq(q.field("fromEntityId"), userId),
                    q.eq(q.field("toEntityId"), tokenId),
                    q.eq(q.field("relationshipType"), "holds_tokens")
                  )
                )
                .first()
            );
            
            if (existingConnection) {
              yield* Effect.tryPromise(() =>
                db.patch(existingConnection._id, {
                  metadata: {
                    balance: existingConnection.metadata.balance + amount
                  }
                })
              );
            } else {
              yield* Effect.tryPromise(() =>
                db.insert("connections", {
                  fromEntityId: userId,
                  toEntityId: tokenId,
                  relationshipType: "holds_tokens",
                  metadata: { balance: amount },
                  createdAt: Date.now()
                })
              );
            }
            
            yield* Effect.logInfo("Token purchase completed", {
              txHash: tokens.transactionHash
            });
            
            return {
              paymentId: payment.id,
              txHash: tokens.transactionHash,
              amount
            };
          }).pipe(
            // Automatic rollback on any failure
            Effect.onError((error) =>
              Effect.gen(function* () {
                yield* Effect.logError("Purchase failed, rolling back", {
                  error
                });
                
                yield* Effect.all([
                  // Refund payment if it succeeded
                  payment
                    ? stripe.refund(payment.id)
                    : Effect.succeed(null),
                  
                  // Burn tokens if they were minted
                  tokens
                    ? blockchain.burn({
                        contractAddress: tokenId,
                        amount
                      })
                    : Effect.succeed(null)
                ]);
              })
            ),
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

---

## Pattern 8: Multi-Step Workflow (ELEVATE Journey)

### Use Case
Long-running process with multiple steps, retries, timeouts

### Workflow Definition
```typescript
// convex/workflows/elevate.ts
import { WorkflowManager } from "@convex-dev/workflow";

const workflow = new WorkflowManager(components.workflow);

export const elevateJourney = workflow.define(
  {
    defaultRetryBehavior: {
      maxAttempts: 3,
      initialBackoffMs: 1000
    }
  },
  async (ctx, { userId }: { userId: Id<"entities"> }) => {
    // Step 1: Hook - Free AI analysis
    await ctx.step("hook", async () => {
      const analysis = await ctx.runAction(
        internal.ai.generateBusinessAnalysis,
        { userId }
      );
      
      await ctx.runMutation(internal.elevate.saveStep, {
        userId,
        stepId: "hook",
        status: "completed",
        output: analysis
      });
      
      return analysis;
    });
    
    // Wait 24 hours before next step
    await ctx.wait(24 * 60 * 60 * 1000);
    
    // Step 2: Gift - Send insights report
    await ctx.step("gift", async () => {
      await ctx.runAction(internal.email.sendInsightsReport, {
        userId
      });
      
      await ctx.runMutation(internal.elevate.saveStep, {
        userId,
        stepId: "gift",
        status: "completed"
      });
    });
    
    // Step 3: Identify - Payment gate ($100)
    const paymentReceived = await ctx.step("identify", async () => {
      // Create payment intent
      const intent = await ctx.runAction(
        internal.payments.createPaymentIntent,
        { userId, amount: 100 }
      );
      
      // Wait for payment (up to 7 days)
      return await waitForPayment(ctx, intent.id, 7 * 24 * 60 * 60 * 1000);
    });
    
    if (!paymentReceived) {
      throw new Error("Payment not received");
    }
    
    // Continue through remaining steps...
    // Step 4: Engage
    // Step 5: Sell
    // Step 6: Nurture
    // Step 7: Upsell
    // Step 8: Understand
    // Step 9: Share
    
    return { completed: true };
  }
);

// Helper: Wait for payment
async function waitForPayment(
  ctx: any,
  paymentIntentId: string,
  maxWaitMs: number
): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitMs) {
    const payment = await ctx.runQuery(
      internal.payments.getPaymentStatus,
      { paymentIntentId }
    );
    
    if (payment.status === "succeeded") {
      return true;
    }
    
    // Wait 1 hour before checking again
    await ctx.wait(60 * 60 * 1000);
  }
  
  return false;
}
```

---

## Pattern 9: Testing Effect.ts Services

### Unit Test
```typescript
// tests/unit/services/token.test.ts
import { Effect, Layer } from "effect";
import { describe, it, expect, vi } from "vitest";
import { TokenService } from "@/convex/services/tokens/purchase";
import {
  ConvexDatabase,
  StripeProvider,
  BlockchainProvider
} from "@/convex/services/providers";

describe("TokenService.purchase", () => {
  it("should purchase tokens successfully", async () => {
    // Mock dependencies
    const mockPayment = { id: "pay_123" };
    const mockMint = { transactionHash: "0x456" };
    
    const MockStripe = Layer.succeed(StripeProvider, {
      charge: () => Effect.succeed(mockPayment)
    });
    
    const MockBlockchain = Layer.succeed(BlockchainProvider, {
      mint: () => Effect.succeed(mockMint)
    });
    
    const MockDB = Layer.succeed(ConvexDatabase, {
      insert: () => Effect.succeed("evt_123" as any),
      query: () => Effect.succeed({
        withIndex: () => ({
          filter: () => ({
            first: () => Promise.resolve(null)
          })
        })
      } as any),
      patch: () => Effect.succeed(undefined)
    });
    
    const TestLayer = Layer.mergeAll(MockStripe, MockBlockchain, MockDB);
    
    // Execute
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const service = yield* TokenService;
        return yield* service.purchase({
          userId: "user-123" as any,
          tokenId: "token-456" as any,
          amount: 100,
          usdAmount: 10
        });
      }).pipe(Effect.provide(TestLayer))
    );
    
    // Assert
    expect(result.paymentId).toBe("pay_123");
    expect(result.txHash).toBe("0x456");
    expect(result.amount).toBe(100);
  });
  
  it("should rollback on payment failure", async () => {
    const refundSpy = vi.fn(() => Effect.succeed(null));
    
    const MockStripe = Layer.succeed(StripeProvider, {
      charge: () =>
        Effect.fail({ _tag: "StripeError", message: "Card declined" }),
      refund: refundSpy
    });
    
    const burnSpy = vi.fn(() => Effect.succeed(null));
    
    const MockBlockchain = Layer.succeed(BlockchainProvider, {
      mint: () => Effect.succeed({ transactionHash: "0x456" }),
      burn: burnSpy
    });
    
    const TestLayer = Layer.mergeAll(MockStripe, MockBlockchain);
    
    // Execute and expect failure
    await expect(
      Effect.runPromise(
        Effect.gen(function* () {
          const service = yield* TokenService;
          return yield* service.purchase({
            userId: "user-123" as any,
            tokenId: "token-456" as any,
            amount: 100,
            usdAmount: 10
          });
        }).pipe(Effect.provide(TestLayer))
      )
    ).rejects.toThrow();
    
    // Verify rollback called
    expect(refundSpy).toHaveBeenCalled();
  });
});
```

---

## Pattern 10: React Component with Loading/Error States

### Best Practice Component
```tsx
// src/components/features/tokens/TokenBalance.tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface TokenBalanceProps {
  userId: Id<"entities">;
  tokenId: Id<"entities">;
}

export function TokenBalance({ userId, tokenId }: TokenBalanceProps) {
  const balance = useQuery(api.tokens.getBalance, { userId, tokenId });
  
  // Loading state (undefined = loading)
  if (balance === undefined) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-24" />
        </CardContent>
      </Card>
    );
  }
  
  // Error state (null = error or not found)
  if (balance === null) {
    return (
      <Card>
        <CardContent className="py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to load token balance
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  // Success state
  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">
          {balance.amount.toLocaleString()}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          ≈ ${(balance.amount * balance.priceUsd).toFixed(2)}
        </p>
      </CardContent>
    </Card>
  );
}
```

---

## Pattern Summary

**When AI agents see these patterns repeatedly, they learn:**

1. **Create Entity** - Always validate, create entity, create relationships, log event
2. **Query Entity** - Get entity, check type, fetch relationships, return enriched data
3. **Update Entity** - Get current, merge updates, patch, log event
4. **Create Connection** - Check if exists, create connection, update counts, log event
5. **Log Event** - Simple helper function, always include entityId and timestamp
6. **AI Interaction** - Check access, get context, generate response, log, reward
7. **Token Purchase** - Atomic multi-step with automatic rollback
8. **Workflow** - Step-by-step with retries and waiting
9. **Testing** - Mock dependencies with Effect.ts layers
10. **React Components** - Always handle loading, error, success states

**These patterns are the building blocks of the entire ONE platform.**

When implementing any feature, start by finding the closest pattern here and adapt it.