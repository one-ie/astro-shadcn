# Migration Guide: Convex Ents → Plain Convex

**Version**: 1.0.0
**Status**: Ready for Implementation
**Timeline**: 10 weeks (5 phases)
**Complexity Reduction**: ~25% schema simplification

---

## Table of Contents

1. [Overview](#overview)
2. [Why Migrate](#why-migrate)
3. [Migration Phases](#migration-phases)
4. [Code Migration Patterns](#code-migration-patterns)
5. [Query Migration](#query-migration)
6. [Mutation Migration](#mutation-migration)
7. [Type Optimization](#type-optimization)
8. [Metadata Patterns](#metadata-patterns)
9. [Testing Strategy](#testing-strategy)
10. [Rollback Plan](#rollback-plan)
11. [Common Issues](#common-issues)

---

## Overview

### What is Changing?

**From**: Convex Ents (external abstraction layer)
**To**: Plain Convex schema (native Convex)

**Impact**:
- 25% reduction in schema complexity
- 27% fewer connection types (33 → 24)
- 30% fewer event types (54 → 38)
- More explicit relationship queries
- No external dependencies

### What Stays the Same?

✅ **4-Table Ontology** - Perfect architecture, no changes
✅ **46 Entity Types** - All preserved
✅ **100% Effect.ts** - Enhanced error handling
✅ **All Features** - 100% feature parity
✅ **All Service Providers** - No changes to integrations

---

## Why Migrate?

### Benefits of Plain Convex

#### 1. No External Dependency ✅
```typescript
// Before: Depends on convex-ents package
import { defineEnt, defineEntSchema } from "convex-ents";

// After: Pure Convex
import { defineSchema, defineTable } from "convex/server";
```

#### 2. More Explicit Code ✅
```typescript
// Before: Magic edge traversal (hidden query)
const owned = await creator.edge("outgoingConnections");

// After: Explicit index query (visible logic)
const owned = await ctx.db
  .query("connections")
  .withIndex("from_type", (q) =>
    q.eq("fromEntityId", creatorId).eq("relationshipType", "owns")
  )
  .collect();
```

#### 3. Better TypeScript ✅
```typescript
// Full discriminated union types
type Entity = {
  type: "creator";
  properties: {
    bio: string;
    website: string;
  };
} | {
  type: "ai_clone";
  properties: {
    voiceId: string;
    personality: string;
  };
};
```

#### 4. Better Performance ✅
- Direct Convex index usage
- No abstraction overhead
- Query optimization is transparent

---

## Migration Phases

### Phase 1: Schema Migration (Weeks 1-2)

**Goal**: Create plain Convex schema with optimized types

**Tasks**:
1. Create new schema file
2. Define all 46 entity types
3. Define 24 optimized connection types
4. Define 38 optimized event types
5. Add all indexes
6. Test schema validity

**Deliverables**:
- ✅ `convex/schema.ts` (plain Convex)
- ✅ Type consolidation mapping document
- ✅ Updated `docs/Ontology.md`
- ✅ Updated `docs/Schema.md`

### Phase 2: Query Migration (Weeks 3-4)

**Goal**: Replace Ents queries with plain Convex + Effect.ts

**Tasks**:
1. Migrate all relationship queries
2. Replace `.edge()` with index queries
3. Wrap in Effect.ts with typed errors
4. Update all data fetching functions
5. Add comprehensive error handling

**Deliverables**:
- ✅ All queries migrated
- ✅ Effect.ts wrappers complete
- ✅ Typed error channels defined

### Phase 3: Mutation Migration (Weeks 5-6)

**Goal**: Migrate all mutations to plain Convex + Effect.ts

**Tasks**:
1. Migrate create operations
2. Migrate update operations
3. Migrate delete operations
4. Add atomic transaction support
5. Add rollback mechanisms

**Deliverables**:
- ✅ All mutations migrated
- ✅ Transaction safety verified
- ✅ Rollback procedures tested

### Phase 4: Provider Integration (Weeks 7-8)

**Goal**: Ensure all service providers work with new schema

**Tasks**:
1. Test all 13 service providers
2. Verify Effect.ts composition
3. Test multi-service workflows
4. Update provider documentation
5. Verify blockchain integrations

**Deliverables**:
- ✅ All providers tested
- ✅ Multi-chain support verified
- ✅ Integration tests passing

### Phase 5: Testing & Production (Weeks 9-10)

**Goal**: Comprehensive testing and production deployment

**Tasks**:
1. Unit tests for all functions
2. Integration tests for workflows
3. End-to-end feature tests
4. Performance benchmarking
5. Production deployment

**Deliverables**:
- ✅ 100% test coverage
- ✅ Performance benchmarks
- ✅ Production deployment
- ✅ Rollback plan validated

---

## Code Migration Patterns

### Pattern 1: Schema Definition

#### Before (Convex Ents)
```typescript
// convex/schema.ts
import { defineEnt, defineEntSchema, getEntDefinitions } from "convex-ents";
import { v } from "convex/values";

const schema = defineEntSchema({
  entities: defineEnt({
    type: v.string(),
    name: v.string(),
    properties: v.any(),
    status: v.optional(v.string()),
  })
    .field("type", v.string(), { index: true })
    .edges("outgoingConnections", { to: "connections", field: "fromEntityId" })
    .edges("incomingConnections", { to: "connections", field: "toEntityId" })
    .searchIndex("search_entities", {
      searchField: "name",
      filterFields: ["type", "status"]
    }),

  connections: defineEnt({
    fromEntityId: v.id("entities"),
    toEntityId: v.id("entities"),
    relationshipType: v.string(),
    metadata: v.optional(v.any()),
  })
    .edge("fromEntity", { to: "entities", field: "fromEntityId" })
    .edge("toEntity", { to: "entities", field: "toEntityId" }),
});

export default schema;
export const entDefinitions = getEntDefinitions(schema);
```

#### After (Plain Convex) ✅
```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Entities table - all "things"
  entities: defineTable({
    type: v.union(
      v.literal("creator"),
      v.literal("ai_clone"),
      v.literal("audience_member"),
      // ... all 46 entity types
    ),
    name: v.string(),
    properties: v.any(), // Type-specific properties
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("pending"),
      v.literal("archived"),
    )),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_type_status", ["type", "status"])
    .index("by_created", ["createdAt"])
    .searchIndex("search_entities", {
      searchField: "name",
      filterFields: ["type", "status"]
    }),

  // Connections table - all "relationships"
  connections: defineTable({
    fromEntityId: v.id("entities"),
    toEntityId: v.id("entities"),
    relationshipType: v.union(
      v.literal("owns"),
      v.literal("created_by"),
      v.literal("clone_of"),
      // ... all 24 connection types (optimized from 33)
    ),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("from_entity", ["fromEntityId"])
    .index("to_entity", ["toEntityId"])
    .index("from_type", ["fromEntityId", "relationshipType"])
    .index("to_type", ["toEntityId", "relationshipType"])
    .index("bidirectional", ["fromEntityId", "toEntityId", "relationshipType"]),
});
```

**Key Changes**:
1. ✅ Use `defineSchema` instead of `defineEntSchema`
2. ✅ Use `defineTable` instead of `defineEnt`
3. ✅ Replace `.field()` with direct type definitions
4. ✅ Remove `.edges()` - use explicit queries instead
5. ✅ Add explicit `.index()` for all query patterns
6. ✅ Use `v.union(v.literal(...))` for enums

---

### Pattern 2: Simple Entity Query

#### Before (Convex Ents)
```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getCreator = query({
  args: { creatorId: v.id("entities") },
  handler: async (ctx, args) => {
    const creator = await ctx.db.get(args.creatorId);

    if (!creator) {
      throw new Error("Creator not found");
    }

    return creator;
  },
});
```

#### After (Plain Convex + Effect.ts) ✅
```typescript
import { confect } from "convex-helpers/server/confect";
import { v } from "convex/values";
import { Effect } from "effect";
import { ConvexDatabase, NotFoundError, MainLayer } from "./services";

export const getCreator = confect.query({
  args: { creatorId: v.id("entities") },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const db = yield* ConvexDatabase;

      // Get entity with typed error
      const creator = yield* db.get(args.creatorId);

      if (!creator || creator.type !== "creator") {
        return yield* Effect.fail(new NotFoundError("Creator not found"));
      }

      return creator;
    }).pipe(Effect.provide(MainLayer))
});
```

**Key Changes**:
1. ✅ Use `confect.query` for Effect.ts support
2. ✅ Use `Effect.gen` for generator-based composition
3. ✅ Get database service via `yield* ConvexDatabase`
4. ✅ Return typed errors with `Effect.fail`
5. ✅ Provide MainLayer for dependency injection

---

### Pattern 3: Relationship Query (Edge Traversal)

#### Before (Convex Ents - Magic Edge)
```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getOwnedContent = query({
  args: { creatorId: v.id("entities") },
  handler: async (ctx, args) => {
    const creator = await ctx.db.get(args.creatorId);

    if (!creator) {
      throw new Error("Creator not found");
    }

    // Magic edge traversal
    const ownedConnections = await creator.edge("outgoingConnections").filter(
      (conn) => conn.relationshipType === "owns"
    );

    return ownedConnections;
  },
});
```

#### After (Plain Convex + Effect.ts - Explicit) ✅
```typescript
import { confect } from "convex-helpers/server/confect";
import { v } from "convex/values";
import { Effect } from "effect";
import { ConvexDatabase, NotFoundError, MainLayer } from "./services";

export const getOwnedContent = confect.query({
  args: { creatorId: v.id("entities") },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const db = yield* ConvexDatabase;

      // Verify creator exists
      const creator = yield* db.get(args.creatorId);
      if (!creator || creator.type !== "creator") {
        return yield* Effect.fail(new NotFoundError("Creator not found"));
      }

      // Explicit index query for relationships
      const ownedConnections = yield* db
        .query("connections")
        .withIndex("from_type", (q) =>
          q
            .eq("fromEntityId", args.creatorId)
            .eq("relationshipType", "owns")
        )
        .collect();

      // Get all owned entities
      const ownedEntities = yield* Effect.all(
        ownedConnections.map((conn) => db.get(conn.toEntityId))
      );

      return ownedEntities.filter(Boolean); // Remove any nulls
    }).pipe(Effect.provide(MainLayer))
});
```

**Key Changes**:
1. ✅ Replace `.edge()` with `.query().withIndex()`
2. ✅ Use composite index `from_type` for efficient lookup
3. ✅ Use `Effect.all` for parallel entity fetching
4. ✅ Filter out nulls (deleted entities)
5. ✅ All operations have typed error channels

---

## Query Migration

### Query Pattern 1: Get All Entities by Type

#### Before
```typescript
export const getAllCreators = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("entities")
      .filter((q) => q.eq(q.field("type"), "creator"))
      .collect();
  },
});
```

#### After ✅
```typescript
export const getAllCreators = confect.query({
  handler: (ctx) =>
    Effect.gen(function* () {
      const db = yield* ConvexDatabase;

      // Use index for efficient type filtering
      const creators = yield* db
        .query("entities")
        .withIndex("by_type", (q) => q.eq("type", "creator"))
        .collect();

      return creators;
    }).pipe(Effect.provide(MainLayer))
});
```

---

### Query Pattern 2: Bidirectional Relationship

#### Before
```typescript
export const getFollowers = query({
  args: { creatorId: v.id("entities") },
  handler: async (ctx, args) => {
    const connections = await ctx.db
      .query("connections")
      .filter((q) =>
        q.eq(q.field("toEntityId"), args.creatorId) &&
        q.eq(q.field("relationshipType"), "following")
      )
      .collect();

    const followers = await Promise.all(
      connections.map((conn) => ctx.db.get(conn.fromEntityId))
    );

    return followers;
  },
});
```

#### After ✅
```typescript
export const getFollowers = confect.query({
  args: { creatorId: v.id("entities") },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const db = yield* ConvexDatabase;

      // Use to_type index for efficient lookup
      const connections = yield* db
        .query("connections")
        .withIndex("to_type", (q) =>
          q
            .eq("toEntityId", args.creatorId)
            .eq("relationshipType", "following")
        )
        .collect();

      // Get all follower entities
      const followers = yield* Effect.all(
        connections.map((conn) => db.get(conn.fromEntityId))
      );

      return followers.filter(Boolean);
    }).pipe(Effect.provide(MainLayer))
});
```

---

### Query Pattern 3: Metadata-Based Filtering (Consolidated Types)

#### Example: Get Successful Payments
```typescript
export const getSuccessfulPayments = confect.query({
  args: { userId: v.id("entities") },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const db = yield* ConvexDatabase;

      // Query by event type using index
      const allPayments = yield* db
        .query("events")
        .withIndex("by_actor_type", (q) =>
          q.eq("actorId", args.userId).eq("type", "payment_processed")
        )
        .collect();

      // Filter by metadata.status (in-memory)
      const successfulPayments = allPayments.filter(
        (event) => event.metadata?.status === "completed"
      );

      return successfulPayments;
    }).pipe(Effect.provide(MainLayer))
});
```

**Notes**:
- Index on `type` for fast filtering
- Metadata filtering happens in-memory
- Works efficiently when result set is reasonable size
- For large datasets, consider separate event types

---

## Mutation Migration

### Mutation Pattern 1: Create Entity

#### Before
```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createCreator = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    niche: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const creatorId = await ctx.db.insert("entities", {
      type: "creator",
      name: args.name,
      properties: {
        email: args.email,
        username: args.email.split("@")[0],
        niche: args.niche,
        totalFollowers: 0,
        totalContent: 0,
        totalRevenue: 0,
      },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log event
    await ctx.db.insert("events", {
      type: "creator_created",
      actorId: creatorId,
      timestamp: Date.now(),
      metadata: { email: args.email },
    });

    return { creatorId };
  },
});
```

#### After (Plain Convex + Effect.ts) ✅
```typescript
import { confect } from "convex-helpers/server/confect";
import { v } from "convex/values";
import { Effect } from "effect";
import { ConvexDatabase, ValidationError, MainLayer } from "./services";

export const createCreator = confect.mutation({
  args: {
    name: v.string(),
    email: v.string(),
    niche: v.array(v.string()),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const db = yield* ConvexDatabase;

      // Validation with typed errors
      if (args.name.length === 0) {
        return yield* Effect.fail(new ValidationError("Name cannot be empty"));
      }

      if (!args.email.includes("@")) {
        return yield* Effect.fail(new ValidationError("Invalid email format"));
      }

      // Check for duplicate email
      const existingCreators = yield* db
        .query("entities")
        .withIndex("by_type", (q) => q.eq("type", "creator"))
        .collect();

      const duplicate = existingCreators.find(
        (c) => c.properties?.email === args.email
      );

      if (duplicate) {
        return yield* Effect.fail(new ValidationError("Email already exists"));
      }

      // Create creator entity
      const creatorId = yield* db.insert("entities", {
        type: "creator",
        name: args.name,
        properties: {
          email: args.email,
          username: args.email.split("@")[0],
          niche: args.niche,
          totalFollowers: 0,
          totalContent: 0,
          totalRevenue: 0,
        },
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Log event
      yield* db.insert("events", {
        type: "creator_created",
        actorId: creatorId,
        timestamp: Date.now(),
        metadata: { email: args.email },
      });

      return { creatorId };
    }).pipe(Effect.provide(MainLayer))
});
```

**Key Changes**:
1. ✅ Add comprehensive validation with typed errors
2. ✅ Check for duplicates before insert
3. ✅ Use Effect.ts for composition
4. ✅ All errors are typed and handleable

---

### Mutation Pattern 2: Update with Relationship

#### Before
```typescript
export const enrollInCourse = mutation({
  args: {
    userId: v.id("entities"),
    courseId: v.id("entities"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    const course = await ctx.db.get(args.courseId);

    if (!user || !course) {
      throw new Error("User or course not found");
    }

    // Create enrollment connection
    await ctx.db.insert("connections", {
      fromEntityId: args.userId,
      toEntityId: args.courseId,
      relationshipType: "enrolled_in",
      metadata: {
        progress: 0,
        enrolledAt: Date.now(),
      },
      createdAt: Date.now(),
    });

    // Log event
    await ctx.db.insert("events", {
      type: "course_enrolled",
      actorId: args.userId,
      targetId: args.courseId,
      timestamp: Date.now(),
      metadata: {},
    });

    return { success: true };
  },
});
```

#### After (Plain Convex + Effect.ts) ✅
```typescript
export const enrollInCourse = confect.mutation({
  args: {
    userId: v.id("entities"),
    courseId: v.id("entities"),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const db = yield* ConvexDatabase;

      // Verify entities exist
      const user = yield* db.get(args.userId);
      const course = yield* db.get(args.courseId);

      if (!user || user.type !== "audience_member") {
        return yield* Effect.fail(new NotFoundError("User not found"));
      }

      if (!course || course.type !== "course") {
        return yield* Effect.fail(new NotFoundError("Course not found"));
      }

      // Check if already enrolled
      const existingEnrollment = yield* db
        .query("connections")
        .withIndex("from_type", (q) =>
          q
            .eq("fromEntityId", args.userId)
            .eq("relationshipType", "enrolled_in")
        )
        .filter((q) => q.eq(q.field("toEntityId"), args.courseId))
        .first();

      if (existingEnrollment) {
        return yield* Effect.fail(
          new ValidationError("Already enrolled in this course")
        );
      }

      // Create enrollment connection
      yield* db.insert("connections", {
        fromEntityId: args.userId,
        toEntityId: args.courseId,
        relationshipType: "enrolled_in",
        metadata: {
          progress: 0,
          enrolledAt: Date.now(),
          lastAccessedAt: Date.now(),
        },
        createdAt: Date.now(),
      });

      // Log event
      yield* db.insert("events", {
        type: "course_enrolled",
        actorId: args.userId,
        targetId: args.courseId,
        timestamp: Date.now(),
        metadata: {
          courseTitle: course.name,
          enrollmentDate: Date.now(),
        },
      });

      return { success: true };
    }).pipe(Effect.provide(MainLayer))
});
```

**Key Changes**:
1. ✅ Check for duplicate enrollments
2. ✅ Verify entity types match expectations
3. ✅ Add enriched metadata for better tracking
4. ✅ All validation errors are typed

---

### Mutation Pattern 3: Multi-Service Transaction

#### Example: Purchase Tokens (Stripe + Blockchain)
```typescript
import { Effect } from "effect";
import {
  ConvexDatabase,
  StripeProvider,
  BlockchainProvider,
  MainLayer,
  PaymentError,
  BlockchainError
} from "./services";

export const purchaseTokens = confect.mutation({
  args: {
    userId: v.id("entities"),
    tokenId: v.id("entities"),
    amount: v.number(),
    usdAmount: v.number(),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const db = yield* ConvexDatabase;
      const stripe = yield* StripeProvider;
      const blockchain = yield* BlockchainProvider;

      // Validate inputs
      const user = yield* db.get(args.userId);
      const token = yield* db.get(args.tokenId);

      if (!user || !token) {
        return yield* Effect.fail(new NotFoundError("User or token not found"));
      }

      if (args.amount <= 0 || args.usdAmount <= 0) {
        return yield* Effect.fail(new ValidationError("Invalid amount"));
      }

      // Atomic operation with rollback
      const result = yield* Effect.all([
        stripe.charge({ amount: args.usdAmount }),
        blockchain.mint({
          tokenAddress: token.properties.contractAddress,
          recipient: user.properties.walletAddress,
          amount: args.amount
        })
      ], { concurrency: "unbounded" }).pipe(
        // Rollback on error
        Effect.catchAll((error) =>
          Effect.gen(function* () {
            // Attempt to refund payment
            yield* stripe.refund().pipe(
              Effect.catchAll(() => Effect.succeed(null))
            );

            // Attempt to burn minted tokens
            yield* blockchain.burn({ amount: args.amount }).pipe(
              Effect.catchAll(() => Effect.succeed(null))
            );

            // Re-throw original error
            return yield* Effect.fail(error);
          })
        )
      );

      const [paymentResult, mintResult] = result;

      // Update token holdings
      yield* db.insert("connections", {
        fromEntityId: args.userId,
        toEntityId: args.tokenId,
        relationshipType: "holds_tokens",
        metadata: {
          balance: args.amount,
          acquiredAt: Date.now(),
          purchasePrice: args.usdAmount,
        },
        createdAt: Date.now(),
      });

      // Log events
      yield* db.insert("events", {
        type: "tokens_purchased",
        actorId: args.userId,
        targetId: args.tokenId,
        timestamp: Date.now(),
        metadata: {
          amount: args.amount,
          usdAmount: args.usdAmount,
          paymentId: paymentResult.id,
          txHash: mintResult.hash,
        },
      });

      yield* db.insert("events", {
        type: "revenue_generated",
        actorId: token.properties.creatorId,
        targetId: args.tokenId,
        timestamp: Date.now(),
        metadata: {
          amount: args.usdAmount,
          source: "token_purchase",
        },
      });

      return {
        success: true,
        paymentId: paymentResult.id,
        txHash: mintResult.hash,
      };
    }).pipe(Effect.provide(MainLayer))
});
```

**Key Features**:
1. ✅ Multi-service coordination (Stripe + Blockchain)
2. ✅ Atomic transaction with automatic rollback
3. ✅ Typed error channels for each service
4. ✅ Comprehensive event logging
5. ✅ All errors are caught and handled

---

## Type Optimization

### Connection Type Consolidation

#### 1. Payment Relationships: 3 → 1

**Before**:
```typescript
type ConnectionType =
  | "paid_for"        // Payment transaction
  | "subscribed_to"   // Subscription
  | "invoiced_to";    // Invoice
```

**After** ✅:
```typescript
type ConnectionType = "transacted";

// Usage with metadata
{
  relationshipType: "transacted",
  metadata: {
    transactionType: "payment",  // or "subscription" or "invoice"
    amount: 99.00,
    currency: "USD",
    paymentId: "pi_123456",
    status: "completed"
  }
}
```

#### 2. Referral Relationships: 2 → 1

**Before**:
```typescript
type ConnectionType =
  | "referred_by"     // Direct referral
  | "converted_from"; // Conversion referral
```

**After** ✅:
```typescript
type ConnectionType = "referred";

// Usage with metadata
{
  relationshipType: "referred",
  metadata: {
    referralType: "direct",  // or "conversion" or "campaign"
    source: "referral_link",
    referralCode: "REF123",
    tokensEarned: 100,
    status: "converted"
  }
}
```

#### 3. Notification Relationships: 2 → 1

**Before**:
```typescript
type ConnectionType =
  | "notified_about"  // General notification
  | "campaigned_to";  // Campaign notification
```

**After** ✅:
```typescript
type ConnectionType = "notified";

// Usage with metadata
{
  relationshipType: "notified",
  metadata: {
    channel: "email",       // or "sms" or "push" or "in_app"
    campaignId: campaignId, // optional
    deliveredAt: Date.now(),
    readAt: Date.now(),
    clicked: true
  }
}
```

---

### Event Type Consolidation

#### 1. Payment Events: 6 → 2

**Before**:
```typescript
type EventType =
  | "payment_initiated"
  | "payment_completed"
  | "payment_failed"
  | "payment_refunded"
  | "subscription_renewed"
  | "invoice_sent";
```

**After** ✅:
```typescript
type EventType =
  | "payment_processed"    // All payment states
  | "subscription_updated"; // All subscription changes

// Usage with metadata
{
  type: "payment_processed",
  metadata: {
    status: "completed",  // or "initiated" | "failed" | "refunded"
    amount: 99.00,
    currency: "USD",
    paymentId: "pi_123456",
    method: "stripe"
  }
}

{
  type: "subscription_updated",
  metadata: {
    action: "renewed",  // or "started" | "cancelled"
    tier: "pro",
    amount: 29.00,
    nextBillingDate: Date.now() + 30 * 24 * 60 * 60 * 1000
  }
}
```

#### 2. Content Events: 5 → 2

**Before**:
```typescript
type EventType =
  | "content_created"
  | "content_published"
  | "content_updated"
  | "content_deleted"
  | "content_scheduled";
```

**After** ✅:
```typescript
type EventType =
  | "content_changed"     // Creation, updates, deletion
  | "content_interacted"; // Views, shares, likes

// Usage with metadata
{
  type: "content_changed",
  metadata: {
    action: "created",  // or "updated" | "deleted"
    contentType: "blog_post",
    generatedBy: "marketing_agent",
    platform: "instagram"
  }
}

{
  type: "content_interacted",
  metadata: {
    interactionType: "viewed",  // or "shared" | "liked"
    duration: 120,              // seconds
    source: "feed"
  }
}
```

#### 3. Livestream Events: 4 → 2

**Before**:
```typescript
type EventType =
  | "stream_started"
  | "stream_ended"
  | "stream_recording_saved"
  | "stream_viewer_joined";
```

**After** ✅:
```typescript
type EventType =
  | "livestream_status_changed"  // Stream lifecycle
  | "livestream_interaction";    // Viewer actions

// Usage with metadata
{
  type: "livestream_status_changed",
  metadata: {
    status: "started",  // or "ended" | "recording_saved"
    streamId: "stream_123",
    platform: "cloudflare",
    rtmpUrl: "rtmp://..."
  }
}

{
  type: "livestream_interaction",
  metadata: {
    type: "joined",     // or "left" | "message"
    viewerCount: 42,
    message: "Hello!"   // if type === "message"
  }
}
```

---

## Metadata Patterns

### Pattern 1: Querying by Metadata

```typescript
// Get all completed payments (not just initiated/failed)
export const getCompletedPayments = confect.query({
  args: { userId: v.id("entities") },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const db = yield* ConvexDatabase;

      // Index on type first (fast)
      const allPayments = yield* db
        .query("events")
        .withIndex("by_actor_type", (q) =>
          q.eq("actorId", args.userId).eq("type", "payment_processed")
        )
        .collect();

      // Filter by metadata (in-memory, small result set)
      const completedPayments = allPayments.filter(
        (event) => event.metadata?.status === "completed"
      );

      return completedPayments;
    }).pipe(Effect.provide(MainLayer))
});
```

**Performance Notes**:
- ✅ Index on `type` narrows results quickly
- ✅ Metadata filtering is in-memory but efficient
- ✅ Works well when result set is < 1000 items
- ⚠️ For larger datasets, consider separate event types

---

### Pattern 2: Aggregating Metadata

```typescript
// Get total revenue from all completed payments
export const getTotalRevenue = confect.query({
  args: { creatorId: v.id("entities") },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const db = yield* ConvexDatabase;

      // Get all payment events
      const payments = yield* db
        .query("events")
        .withIndex("by_actor_type", (q) =>
          q.eq("actorId", args.creatorId).eq("type", "payment_processed")
        )
        .collect();

      // Aggregate completed payments
      const totalRevenue = payments
        .filter((p) => p.metadata?.status === "completed")
        .reduce((sum, p) => sum + (p.metadata?.amount || 0), 0);

      return { totalRevenue };
    }).pipe(Effect.provide(MainLayer))
});
```

---

### Pattern 3: Updating Metadata

```typescript
// Update course progress
export const updateCourseProgress = confect.mutation({
  args: {
    userId: v.id("entities"),
    courseId: v.id("entities"),
    progress: v.number(),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const db = yield* ConvexDatabase;

      // Find enrollment connection
      const enrollment = yield* db
        .query("connections")
        .withIndex("from_type", (q) =>
          q
            .eq("fromEntityId", args.userId)
            .eq("relationshipType", "enrolled_in")
        )
        .filter((q) => q.eq(q.field("toEntityId"), args.courseId))
        .first();

      if (!enrollment) {
        return yield* Effect.fail(new NotFoundError("Not enrolled"));
      }

      // Update metadata
      yield* db.patch(enrollment._id, {
        metadata: {
          ...enrollment.metadata,
          progress: args.progress,
          lastAccessedAt: Date.now(),
        },
      });

      return { success: true };
    }).pipe(Effect.provide(MainLayer))
});
```

---

## Testing Strategy

### Unit Tests

#### Test 1: Schema Validation
```typescript
import { describe, it, expect } from "vitest";
import schema from "../convex/schema";

describe("Schema Validation", () => {
  it("should have all required tables", () => {
    expect(schema.tables).toHaveProperty("entities");
    expect(schema.tables).toHaveProperty("connections");
    expect(schema.tables).toHaveProperty("events");
    expect(schema.tables).toHaveProperty("tags");
  });

  it("should have all required indexes", () => {
    const entitiesIndexes = schema.tables.entities.indexes;
    expect(entitiesIndexes).toContain("by_type");
    expect(entitiesIndexes).toContain("by_status");
    expect(entitiesIndexes).toContain("by_type_status");
  });

  it("should have 46 entity types", () => {
    // Validate entity type union has 46 literals
    const entityTypes = extractUnionTypes(schema.tables.entities.fields.type);
    expect(entityTypes).toHaveLength(46);
  });

  it("should have 24 connection types", () => {
    const connectionTypes = extractUnionTypes(
      schema.tables.connections.fields.relationshipType
    );
    expect(connectionTypes).toHaveLength(24);
  });

  it("should have 38 event types", () => {
    const eventTypes = extractUnionTypes(schema.tables.events.fields.type);
    expect(eventTypes).toHaveLength(38);
  });
});
```

#### Test 2: Query Migration
```typescript
describe("Query Migration", () => {
  it("should get entity by ID with Effect.ts", async () => {
    const result = await runMutation(ctx, internal.entities.getCreator, {
      creatorId: testCreatorId,
    });

    expect(result._tag).toBe("Success");
    expect(result.value.type).toBe("creator");
  });

  it("should return typed error for missing entity", async () => {
    const result = await runMutation(ctx, internal.entities.getCreator, {
      creatorId: "invalid_id",
    });

    expect(result._tag).toBe("Failure");
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it("should query relationships using index", async () => {
    const result = await runMutation(ctx, internal.entities.getOwnedContent, {
      creatorId: testCreatorId,
    });

    expect(result._tag).toBe("Success");
    expect(result.value).toBeArray();
  });
});
```

#### Test 3: Mutation Migration
```typescript
describe("Mutation Migration", () => {
  it("should create entity with validation", async () => {
    const result = await runMutation(ctx, internal.entities.createCreator, {
      name: "Test Creator",
      email: "test@example.com",
      niche: ["fitness"],
    });

    expect(result._tag).toBe("Success");
    expect(result.value.creatorId).toBeDefined();
  });

  it("should reject invalid email", async () => {
    const result = await runMutation(ctx, internal.entities.createCreator, {
      name: "Test",
      email: "invalid-email",
      niche: [],
    });

    expect(result._tag).toBe("Failure");
    expect(result.error).toBeInstanceOf(ValidationError);
  });

  it("should prevent duplicate enrollments", async () => {
    // First enrollment should succeed
    const first = await runMutation(ctx, internal.courses.enrollInCourse, {
      userId: testUserId,
      courseId: testCourseId,
    });
    expect(first._tag).toBe("Success");

    // Second enrollment should fail
    const second = await runMutation(ctx, internal.courses.enrollInCourse, {
      userId: testUserId,
      courseId: testCourseId,
    });
    expect(second._tag).toBe("Failure");
  });
});
```

---

### Integration Tests

#### Test 1: Multi-Service Transaction
```typescript
describe("Multi-Service Transactions", () => {
  it("should complete token purchase with Stripe + Blockchain", async () => {
    const result = await runMutation(ctx, internal.tokens.purchaseTokens, {
      userId: testUserId,
      tokenId: testTokenId,
      amount: 100,
      usdAmount: 10.00,
    });

    expect(result._tag).toBe("Success");
    expect(result.value.paymentId).toBeDefined();
    expect(result.value.txHash).toBeDefined();

    // Verify connection was created
    const holdings = await runQuery(ctx, internal.tokens.getTokenHoldings, {
      userId: testUserId,
    });
    expect(holdings.value).toContainEqual(
      expect.objectContaining({ tokenId: testTokenId })
    );

    // Verify events were logged
    const events = await runQuery(ctx, internal.events.getUserEvents, {
      userId: testUserId,
      eventType: "tokens_purchased",
    });
    expect(events.value.length).toBeGreaterThan(0);
  });

  it("should rollback on payment failure", async () => {
    // Mock Stripe to fail
    mockStripe.charge.mockRejectedValue(new Error("Payment failed"));

    const result = await runMutation(ctx, internal.tokens.purchaseTokens, {
      userId: testUserId,
      tokenId: testTokenId,
      amount: 100,
      usdAmount: 10.00,
    });

    expect(result._tag).toBe("Failure");

    // Verify no connection was created
    const holdings = await runQuery(ctx, internal.tokens.getTokenHoldings, {
      userId: testUserId,
    });
    expect(holdings.value).not.toContainEqual(
      expect.objectContaining({ tokenId: testTokenId })
    );
  });
});
```

---

### End-to-End Tests

#### Test 1: Complete Creator Journey
```typescript
describe("Creator Journey E2E", () => {
  it("should complete full creator onboarding", async () => {
    // 1. Create creator
    const creator = await runMutation(ctx, internal.entities.createCreator, {
      name: "John Doe",
      email: "john@example.com",
      niche: ["fitness", "nutrition"],
    });
    expect(creator._tag).toBe("Success");
    const creatorId = creator.value.creatorId;

    // 2. Create AI clone
    const clone = await runMutation(ctx, internal.ai.createClone, {
      creatorId,
      voiceProvider: "elevenlabs",
      appearanceProvider: "d-id",
    });
    expect(clone._tag).toBe("Success");

    // 3. Generate content
    const content = await runMutation(ctx, internal.content.generateBlogPost, {
      creatorId,
      topic: "10 Fitness Tips for Beginners",
    });
    expect(content._tag).toBe("Success");

    // 4. Deploy token
    const token = await runMutation(ctx, internal.tokens.deployToken, {
      creatorId,
      name: "JOHN Token",
      symbol: "JOHN",
      totalSupply: 1000000,
    });
    expect(token._tag).toBe("Success");

    // 5. Verify all relationships
    const relationships = await runQuery(
      ctx,
      internal.entities.getOwnedContent,
      { creatorId }
    );
    expect(relationships.value).toHaveLength(2); // clone + content
  });
});
```

---

### Performance Benchmarks

```typescript
describe("Performance Benchmarks", () => {
  it("should query 1000 entities in < 100ms", async () => {
    const start = performance.now();

    const result = await runQuery(ctx, internal.entities.getAllCreators, {});

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
    expect(result.value.length).toBeGreaterThan(0);
  });

  it("should query relationships with index in < 50ms", async () => {
    const start = performance.now();

    const result = await runQuery(ctx, internal.entities.getOwnedContent, {
      creatorId: testCreatorId,
    });

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(50);
  });

  it("should filter by metadata efficiently", async () => {
    // Create 100 payment events with different statuses
    for (let i = 0; i < 100; i++) {
      await runMutation(ctx, internal.events.createPaymentEvent, {
        userId: testUserId,
        status: i % 4 === 0 ? "completed" : "initiated",
      });
    }

    const start = performance.now();

    const result = await runQuery(ctx, internal.payments.getCompletedPayments, {
      userId: testUserId,
    });

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
    expect(result.value.length).toBe(25); // 25% completed
  });
});
```

---

## Rollback Plan

### Scenario 1: Schema Migration Issues

**Issue**: New schema causes type errors or validation failures

**Rollback Steps**:
1. Keep Convex Ents package installed during migration
2. Maintain old schema in `convex/schema.old.ts`
3. Use feature flags to switch between schemas
4. Rollback command:
```bash
# Restore old schema
cp convex/schema.old.ts convex/schema.ts
npx convex deploy
```

### Scenario 2: Query Performance Degradation

**Issue**: Metadata filtering causes slow queries

**Rollback Steps**:
1. Identify slow queries via monitoring
2. Revert specific event/connection types from consolidated to separate
3. Update schema incrementally:
```typescript
// Revert payment_processed to separate types
type EventType =
  | "payment_initiated"
  | "payment_completed"
  | "payment_failed"
  | "payment_refunded"
  // instead of consolidated "payment_processed"
```
4. Migrate data back to separate types
5. Deploy updated schema

### Scenario 3: Production Data Corruption

**Issue**: Migration causes data inconsistencies

**Rollback Steps**:
1. **Immediate**: Stop all writes to affected tables
2. **Backup**: Export all data via Convex dashboard
3. **Restore**: Import backup to new deployment
4. **Verify**: Run data integrity checks
5. **Switch**: Point application to backup deployment
6. **Debug**: Fix migration script offline
7. **Retry**: Re-run migration with fixes

```bash
# Export current data
npx convex export --output backup.zip

# Import to backup deployment
npx convex import --deployment backup backup.zip

# Update environment to use backup
CONVEX_URL=https://backup.convex.cloud
```

### Scenario 4: Effect.ts Integration Issues

**Issue**: Effect.ts wrappers cause runtime errors

**Rollback Steps**:
1. Keep non-Effect.ts versions in separate files
2. Use feature flag to switch implementations:
```typescript
const USE_EFFECT = process.env.USE_EFFECT === "true";

export const getCreator = USE_EFFECT
  ? getCreatorWithEffect
  : getCreatorLegacy;
```
3. Gradually migrate queries with monitoring
4. Rollback individual queries if issues arise

---

## Common Issues

### Issue 1: TypeScript Errors After Migration

**Problem**:
```typescript
// Error: Type 'string' is not assignable to type '"creator" | "ai_clone" | ...'
const entity = { type: "creator", name: "John" };
```

**Solution**:
Use `as const` for literal types:
```typescript
const entity = { type: "creator" as const, name: "John" };
```

Or use type assertion:
```typescript
const entity: Entity = { type: "creator", name: "John" };
```

---

### Issue 2: Index Not Being Used

**Problem**:
```typescript
// Query is slow - not using index
const creators = await ctx.db
  .query("entities")
  .filter((q) => q.eq(q.field("type"), "creator"))
  .collect();
```

**Solution**:
Use `withIndex` explicitly:
```typescript
const creators = await ctx.db
  .query("entities")
  .withIndex("by_type", (q) => q.eq("type", "creator"))
  .collect();
```

---

### Issue 3: Metadata Filtering is Slow

**Problem**:
```typescript
// Filtering 10,000 events by metadata.status in-memory
const completed = allEvents.filter((e) => e.metadata?.status === "completed");
```

**Solution Option 1**: Limit result set first
```typescript
// Get only recent events
const recentEvents = await ctx.db
  .query("events")
  .withIndex("by_timestamp", (q) =>
    q.gt("timestamp", Date.now() - 30 * 24 * 60 * 60 * 1000)
  )
  .collect();

const completed = recentEvents.filter((e) => e.metadata?.status === "completed");
```

**Solution Option 2**: Revert to separate event types
```typescript
// If filtering is consistently slow, revert to separate types
type EventType =
  | "payment_completed"  // Separate type instead of metadata
  | "payment_failed";
```

---

### Issue 4: Effect.ts Error Handling

**Problem**:
```typescript
// Error not being caught properly
const result = await getCreator({ creatorId: "invalid" });
// Runtime error instead of typed error
```

**Solution**:
Always run Effect with proper error handling:
```typescript
import { Effect, Exit } from "effect";

const program = getCreator({ creatorId: "invalid" });

const exit = await Effect.runPromiseExit(program);

if (Exit.isFailure(exit)) {
  const error = exit.cause;
  console.error("Error:", error);
  // Handle typed error
} else {
  const creator = exit.value;
  console.log("Creator:", creator);
}
```

Or use `runPromise` with try/catch:
```typescript
try {
  const creator = await Effect.runPromise(program);
  console.log("Creator:", creator);
} catch (error) {
  console.error("Error:", error);
}
```

---

### Issue 5: Missing Relationship Data

**Problem**:
```typescript
// Getting null entities after relationship query
const entities = await Promise.all(
  connections.map((conn) => ctx.db.get(conn.toEntityId))
);
// entities = [null, null, Entity, null]
```

**Solution**:
Filter out deleted entities:
```typescript
const entities = (await Promise.all(
  connections.map((conn) => ctx.db.get(conn.toEntityId))
)).filter(Boolean);
```

Or use Effect.ts to fail on missing entities:
```typescript
const entities = yield* Effect.all(
  connections.map((conn) =>
    db.get(conn.toEntityId).pipe(
      Effect.flatMap((entity) =>
        entity
          ? Effect.succeed(entity)
          : Effect.fail(new NotFoundError("Entity deleted"))
      )
    )
  )
);
```

---

### Issue 6: Schema Validation Errors

**Problem**:
```bash
Error: Invalid value for field "type": expected union, got "new_entity_type"
```

**Solution**:
Always add new entity types to schema union:
```typescript
type: v.union(
  v.literal("creator"),
  v.literal("ai_clone"),
  // ... existing types
  v.literal("new_entity_type"),  // Add new type here
),
```

Then deploy schema before using new type:
```bash
npx convex deploy
```

---

## Migration Timeline

### Week 1: Schema Foundation
- [ ] Create plain Convex schema
- [ ] Define all 46 entity types
- [ ] Define 24 optimized connection types
- [ ] Define 38 optimized event types
- [ ] Add all indexes
- [ ] Test schema deployment

### Week 2: Schema Finalization
- [ ] Create type consolidation mapping
- [ ] Update Ontology.md
- [ ] Update Schema.md
- [ ] Write migration scripts
- [ ] Test with sample data

### Week 3: Query Migration Part 1
- [ ] Migrate simple entity queries
- [ ] Add Effect.ts wrappers
- [ ] Define typed error channels
- [ ] Write unit tests
- [ ] Update documentation

### Week 4: Query Migration Part 2
- [ ] Migrate relationship queries
- [ ] Replace all `.edge()` calls
- [ ] Add metadata filtering
- [ ] Write integration tests
- [ ] Performance benchmarking

### Week 5: Mutation Migration Part 1
- [ ] Migrate create operations
- [ ] Add validation with typed errors
- [ ] Update event logging
- [ ] Write unit tests
- [ ] Test data consistency

### Week 6: Mutation Migration Part 2
- [ ] Migrate update/delete operations
- [ ] Add atomic transactions
- [ ] Add rollback mechanisms
- [ ] Write integration tests
- [ ] Test error scenarios

### Week 7: Provider Integration
- [ ] Test all 13 service providers
- [ ] Verify Effect.ts composition
- [ ] Test multi-service workflows
- [ ] Update provider docs
- [ ] Test blockchain integrations

### Week 8: Provider Completion
- [ ] Complete remaining providers
- [ ] Verify multi-chain support
- [ ] Test error handling
- [ ] Performance testing
- [ ] Documentation updates

### Week 9: Comprehensive Testing
- [ ] Run full test suite
- [ ] End-to-end feature tests
- [ ] Performance benchmarks
- [ ] Load testing
- [ ] Security review

### Week 10: Production Deployment
- [ ] Final code review
- [ ] Production deployment
- [ ] Monitor for issues
- [ ] Validate rollback plan
- [ ] Update all documentation

---

## Success Criteria

### Technical Metrics
- ✅ All 46 entity types working
- ✅ All 24 connection types working
- ✅ All 38 event types working
- ✅ 100% test coverage
- ✅ Zero production errors
- ✅ Query performance maintained or improved

### Migration Metrics
- ✅ Zero data loss
- ✅ Zero feature regressions
- ✅ 25% schema complexity reduction
- ✅ Rollback plan validated
- ✅ All documentation updated

### Code Quality Metrics
- ✅ TypeScript strict mode passing
- ✅ All queries use indexes
- ✅ All errors are typed
- ✅ Effect.ts used throughout
- ✅ 100% Effect.ts composition

---

## Conclusion

This migration from Convex Ents to plain Convex achieves:

1. **Simplicity**: 25% reduction in schema complexity
2. **Clarity**: Explicit relationship queries
3. **Type Safety**: Full TypeScript control
4. **Performance**: Direct index usage
5. **Flexibility**: Metadata-based type consolidation
6. **Reliability**: Effect.ts error handling throughout

**Timeline**: 10 weeks (5 phases)
**Risk Level**: Low (with comprehensive testing and rollback plan)
**Impact**: High (cleaner codebase, better maintainability)

**Next Steps**:
1. Begin Phase 1 (Schema Migration)
2. Set up monitoring for migration progress
3. Schedule weekly review meetings
4. Document any issues encountered
5. Update this guide as needed

---

**END OF MIGRATION GUIDE**
