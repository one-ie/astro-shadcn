# ONE Platform - Implementation Guide

**Version**: 1.0.0
**Status**: Ready for Implementation
**Timeline**: 12 weeks to MVP, 24 weeks to Scale

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Foundation Layer (Week 1-2)](#foundation-layer-week-1-2)
3. [Implementation Phases](#implementation-phases)
4. [Progressive Enhancement Strategy](#progressive-enhancement-strategy)
5. [AI Agent Generation Patterns](#ai-agent-generation-patterns)
6. [Critical Path & Dependencies](#critical-path--dependencies)
7. [Testing Checkpoints](#testing-checkpoints)
8. [Key Architectural Decisions](#key-architectural-decisions)
9. [Week-by-Week Roadmap](#week-by-week-roadmap)

---

## Executive Summary

The ONE Platform is a **complete AI-powered creator business operating system** with a revolutionary **ontology-first architecture** that ensures AI-generated code remains consistent at scale.

### The Magic Formula

```
Ontology → Schema → Types → Services → Functions → Features
   ↓         ↓        ↓         ↓          ↓          ↓
SOURCE   DEFINES  ENFORCES  COMPOSES   BUILDS    DELIVERS
```

**Key Insight**: By constraining AI generation to a fixed ontology (46 entity types, 24 connection types, 38 event types), TypeScript enforces consistency. AI can't generate invalid code even if it tries.

### Current State

**✅ Complete Documentation** (100% coverage):
- Strategy, ontology, schema, architecture fully specified
- Both DSL languages (Plain English + Technical) documented
- All 14 service providers specified
- Migration guide from Convex Ents to plain Convex ready
- Effect.ts patterns established throughout

**❌ Missing Implementation**:
- Actual code in `convex/` and `src/`
- Automated tests
- CLI tooling

**Next Step**: Build foundation layer (plain Convex schema + ConvexDatabase service)

---

## Foundation Layer (Week 1-2)

### Priority 1: Plain Convex Schema Migration

**Why This First**: Everything depends on the schema. It's the single source of truth.

**File**: `convex/schema.ts`

**What to Build**:

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 46 entity types
  entities: defineTable({
    type: v.union(
      // Core (3)
      v.literal("creator"),
      v.literal("ai_clone"),
      v.literal("audience_member"),
      // Business Agents (10)
      v.literal("strategy_agent"),
      v.literal("research_agent"),
      // ... all 46 types
    ),
    name: v.string(),
    properties: v.any(),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    )),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_type_status", ["type", "status"])
    .searchIndex("search_entities", {
      searchField: "name",
      filterFields: ["type", "status"]
    }),

  // 24 connection types (optimized from 33)
  connections: defineTable({
    fromEntityId: v.id("entities"),
    toEntityId: v.id("entities"),
    relationshipType: v.union(
      v.literal("owns"),
      v.literal("created_by"),
      v.literal("transacted"), // payment, subscription, invoice (metadata.transactionType)
      v.literal("referred"),    // direct, conversion, campaign (metadata.referralType)
      // ... all 24 types
    ),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("from_entity", ["fromEntityId"])
    .index("to_entity", ["toEntityId"])
    .index("from_type", ["fromEntityId", "relationshipType"])
    .index("to_type", ["toEntityId", "relationshipType"]),

  // 38 event types (optimized from 54)
  events: defineTable({
    type: v.union(
      v.literal("creator_created"),
      v.literal("payment_processed"),     // with metadata.status
      v.literal("content_changed"),       // with metadata.action
      v.literal("livestream_status_changed"), // with metadata.status
      // ... all 38 types
    ),
    actorId: v.id("entities"),
    targetId: v.optional(v.id("entities")),
    timestamp: v.number(),
    metadata: v.any(),
  })
    .index("by_type", ["type"])
    .index("by_actor", ["actorId"])
    .index("by_timestamp", ["timestamp"]),

  tags: defineTable({
    entityId: v.id("entities"),
    key: v.string(),
    value: v.string(),
  })
    .index("by_entity", ["entityId"])
    .index("by_key_value", ["key", "value"]),
});
```

**Success Criteria**:
- ✅ Schema deploys to Convex without errors
- ✅ Can create all 46 entity types
- ✅ All 24 connection types work
- ✅ All 38 event types log correctly
- ✅ Indexes return results < 100ms

**Reference**: See `docs/Schema.md` for complete specification

---

### Priority 2: ConvexDatabase Service

**Why This Second**: Provides typed Effect.ts interface to Convex database operations.

**File**: `convex/services/core/database.ts`

**What to Build**:

```typescript
// convex/services/core/database.ts
import { Context, Effect, Data } from "effect";
import { GenericDatabaseReader, GenericDatabaseWriter } from "convex/server";

// Typed errors
export class DatabaseError extends Data.TaggedEnum<{
  NotFound: { table: string; id: string };
  InvalidInput: { field: string; reason: string };
  ConstraintViolation: { message: string };
  TransactionFailed: { reason: string };
}> {}

// Service interface
export class ConvexDatabase extends Context.Tag("ConvexDatabase")<
  ConvexDatabase,
  {
    // Entity operations
    insert: <T extends TableNames>(
      table: T,
      doc: WithoutSystemFields<NamedTableInfo<T, DataModel>["document"]>
    ) => Effect.Effect<GenericId<T>, DatabaseError>;

    get: <T extends TableNames>(
      id: GenericId<T>
    ) => Effect.Effect<Doc<T> | null, DatabaseError>;

    query: <T extends TableNames>(
      table: T
    ) => Effect.Effect<QueryInitializer<NamedTableInfo<T, DataModel>>, DatabaseError>;

    patch: <T extends TableNames>(
      id: GenericId<T>,
      patch: Partial<Doc<T>>
    ) => Effect.Effect<void, DatabaseError>;

    delete: <T extends TableNames>(
      id: GenericId<T>
    ) => Effect.Effect<void, DatabaseError>;

    // Relationship helpers
    getConnections: (
      fromEntityId: Id<"entities">,
      relationshipType: string
    ) => Effect.Effect<Array<Doc<"connections">>, DatabaseError>;

    getEvents: (
      actorId: Id<"entities">,
      eventType: string
    ) => Effect.Effect<Array<Doc<"events">>, DatabaseError>;
  }
>() {}

// Live implementation
export const ConvexDatabaseLive = (
  ctx: { db: GenericDatabaseReader<DataModel> & GenericDatabaseWriter<DataModel> }
) =>
  Layer.succeed(ConvexDatabase, {
    insert: (table, doc) =>
      Effect.tryPromise({
        try: () => ctx.db.insert(table, doc),
        catch: (error) =>
          new DatabaseError({
            _tag: "TransactionFailed",
            reason: String(error),
          }),
      }),

    get: (id) =>
      Effect.tryPromise({
        try: () => ctx.db.get(id),
        catch: (error) =>
          new DatabaseError({
            _tag: "NotFound",
            table: id.tableName,
            id: id._id,
          }),
      }),

    query: (table) =>
      Effect.sync(() => ctx.db.query(table)),

    // ... other methods
  });
```

**Success Criteria**:
- ✅ All CRUD operations return Effect types
- ✅ Errors are typed (DatabaseError union)
- ✅ Works with Confect mutations/queries
- ✅ Mock services test successfully

**Reference**: See `docs/Service Layer.md` for Effect.ts patterns

---

### Priority 3: Effect.ts Provider Skeleton

**Why This Third**: Establishes service provider pattern before implementing features.

**Files to Create**:

```
convex/services/providers/
├── openai.ts          # LLM, embeddings
├── elevenlabs.ts      # Voice cloning
├── stripe.ts          # Fiat payments ONLY
├── alchemy.ts         # Base blockchain (RPC, tokens)
├── uniswap.ts         # Base DEX
├── did.ts             # AI appearance (D-ID)
├── heygen.ts          # AI appearance (HeyGen)
├── twilio.ts          # SMS, 2FA
├── sendgrid.ts        # Email analytics
├── aws.ts             # General media (S3 + CloudFront)
├── cloudflare.ts      # Livestreaming ONLY
└── index.ts           # AllProviders layer
```

**Pattern** (apply to all):

```typescript
// convex/services/providers/openai.ts
import { Context, Effect, Data, Layer } from "effect";

// 1. Typed errors
export class OpenAIError extends Data.TaggedEnum<{
  APIError: { message: string; code?: number };
  RateLimitError: { retryAfter: number };
  InvalidInput: { field: string; reason: string };
  QuotaExceeded: { limit: number };
}> {}

// 2. Service interface
export class OpenAIProvider extends Context.Tag("OpenAIProvider")<
  OpenAIProvider,
  {
    readonly chat: (params: {
      messages: Array<{ role: string; content: string }>;
      model?: string;
      temperature?: number;
    }) => Effect.Effect<string, OpenAIError>;

    readonly embed: (text: string) => Effect.Effect<number[], OpenAIError>;

    readonly generateImage: (prompt: string) => Effect.Effect<string, OpenAIError>;
  }
>() {}

// 3. Live implementation
export const OpenAIProviderLive = Layer.effect(
  OpenAIProvider,
  Effect.gen(function* () {
    const apiKey = yield* Effect.sync(() => process.env.OPENAI_API_KEY);
    if (!apiKey) {
      yield* Effect.fail(
        new OpenAIError({
          _tag: "InvalidInput",
          field: "apiKey",
          reason: "Missing OPENAI_API_KEY environment variable",
        })
      );
    }

    return {
      chat: (params) =>
        Effect.tryPromise({
          try: async () => {
            // OpenAI SDK call
            const response = await openai.chat.completions.create({
              model: params.model || "gpt-4",
              messages: params.messages,
              temperature: params.temperature || 0.7,
            });
            return response.choices[0].message.content;
          },
          catch: (error) =>
            new OpenAIError({
              _tag: "APIError",
              message: String(error),
            }),
        }),

      embed: (text) =>
        Effect.tryPromise({
          try: async () => {
            const response = await openai.embeddings.create({
              model: "text-embedding-3-small",
              input: text,
            });
            return response.data[0].embedding;
          },
          catch: (error) =>
            new OpenAIError({ _tag: "APIError", message: String(error) }),
        }),

      // ... other methods
    };
  })
);
```

**Multi-Chain Provider Pattern**:

```typescript
// convex/services/providers/alchemy.ts (Base chain ONLY)
export class AlchemyProvider extends Context.Tag("AlchemyProvider")<
  AlchemyProvider,
  {
    deployToken: (params: {...}) => Effect.Effect<TokenAddress, AlchemyError>;
    getBalance: (wallet: string, token: string) => Effect.Effect<number, AlchemyError>;
    // ... Base-specific operations
  }
>() {}

// Future: convex/services/providers/sui.ts
export class SuiProvider extends Context.Tag("SuiProvider")<
  SuiProvider,
  {
    deployToken: (params: {...}) => Effect.Effect<TokenAddress, SuiError>;
    getBalance: (wallet: string, token: string) => Effect.Effect<number, SuiError>;
    // ... Sui-specific operations (Move language, different address format)
  }
>() {}
```

**Critical Distinctions**:
- **Stripe**: Fiat payments ONLY (NOT for blockchain/crypto)
- **Cloudflare**: Livestreaming ONLY (NOT for general media - use AWS)
- **Blockchain**: Separate provider per chain (Base, Sui, Solana) - NO consolidation

**Success Criteria**:
- ✅ All 14 providers have skeleton files
- ✅ Each uses Data.TaggedEnum for errors
- ✅ Each uses Context.Tag for DI
- ✅ AllProviders layer composes all providers
- ✅ Can mock providers for testing

**Reference**: See `docs/Service Providers - New.md` for complete specs

---

## Implementation Phases

### Phase 1: Authentication & Core Infrastructure (Week 1-2)

**Current State**: Better Auth already implemented with email, magic links, 2FA, OAuth.

**What to Build**:

1. **Migrate Auth to Ontology**
   ```typescript
   // convex/auth/register.ts
   export const register = confect.mutation({
     handler: (ctx, args) =>
       Effect.gen(function* () {
         const db = yield* ConvexDatabase;

         // Create creator entity
         const creatorId = yield* db.insert("entities", {
           type: "creator",
           name: args.displayName,
           properties: {
             email: args.email,
             username: args.username,
             bio: "",
             niche: [],
           },
           status: "active",
           createdAt: Date.now(),
           updatedAt: Date.now(),
         });

         // Log creation event
         yield* db.insert("events", {
           type: "creator_created",
           actorId: creatorId,
           timestamp: Date.now(),
           metadata: {
             registrationMethod: args.method, // email, oauth, magic_link
           },
         });

         return creatorId;
       }).pipe(Effect.provide(MainLayer)),
   });
   ```

2. **AuthService Wrapper**
   ```typescript
   // convex/services/core/auth.ts
   export class AuthService extends Context.Tag("AuthService")<
     AuthService,
     {
       getCurrentUser: () => Effect.Effect<Id<"entities">, AuthError>;
       requireCreator: () => Effect.Effect<Doc<"entities">, AuthError>;
       // ... other auth operations
     }
   >() {}
   ```

**Success Criteria**:
- ✅ All auth flows create/update entities
- ✅ Events logged for all auth actions
- ✅ AuthService provides typed operations
- ✅ User entity retrieved from session

---

### Phase 2: Content Creation System (Week 3-4)

**What to Build**:

1. **Universal Content Creator**
   ```typescript
   // convex/content/create.ts
   export const createContent = confect.mutation({
     args: {
       type: v.union(
         v.literal("blog_post"),
         v.literal("video"),
         v.literal("podcast"),
         v.literal("social_post"),
         v.literal("course"),
       ),
       title: v.string(),
       properties: v.any(), // Type-specific fields
     },
     handler: (ctx, args) =>
       Effect.gen(function* () {
         const db = yield* ConvexDatabase;
         const auth = yield* AuthService;

         const creatorId = yield* auth.getCurrentUser();

         // Create content entity
         const contentId = yield* db.insert("entities", {
           type: args.type,
           name: args.title,
           properties: args.properties,
           status: "draft",
           createdAt: Date.now(),
           updatedAt: Date.now(),
         });

         // Create ownership connection
         yield* db.insert("connections", {
           fromEntityId: creatorId,
           toEntityId: contentId,
           relationshipType: "owns",
           metadata: { revenueShare: 1.0 }, // 100% to creator
           createdAt: Date.now(),
         });

         // Log creation event (consolidated type)
         yield* db.insert("events", {
           type: "content_changed",
           actorId: creatorId,
           targetId: contentId,
           timestamp: Date.now(),
           metadata: {
             action: "created",
             contentType: args.type,
           },
         });

         return contentId;
       }).pipe(Effect.provide(MainLayer)),
   });
   ```

2. **Semantic Search Integration**
   ```typescript
   // convex/search/semantic.ts
   export const searchContent = confect.query({
     args: { query: v.string(), limit: v.optional(v.number()) },
     handler: (ctx, args) =>
       Effect.gen(function* () {
         const db = yield* ConvexDatabase;
         const openai = yield* OpenAIProvider;

         // Generate query embedding
         const queryEmbedding = yield* openai.embed(args.query);

         // Vector search (using Convex vector search)
         const results = yield* db
           .query("embeddings")
           .withSearchIndex("by_embedding", (q) =>
             q.search("embedding", queryEmbedding).limit(args.limit || 10)
           )
           .collect();

         // Get associated entities
         const entities = yield* Effect.all(
           results.map((r) => db.get(r.entityId))
         );

         return entities.filter(Boolean);
       }).pipe(Effect.provide(MainLayer)),
   });
   ```

3. **Tags & Discovery**
   ```typescript
   // convex/tags/apply.ts
   export const applyTags = confect.mutation({
     args: {
       entityId: v.id("entities"),
       tags: v.array(v.object({ key: v.string(), value: v.string() })),
     },
     handler: (ctx, args) =>
       Effect.gen(function* () {
         const db = yield* ConvexDatabase;

         // Create or update tags
         yield* Effect.all(
           args.tags.map((tag) =>
             db.insert("tags", {
               entityId: args.entityId,
               key: tag.key,
               value: tag.value,
             })
           )
         );
       }).pipe(Effect.provide(MainLayer)),
   });
   ```

**Success Criteria**:
- ✅ Can create all 7 content types
- ✅ Ownership connections created automatically
- ✅ Tags applied and searchable
- ✅ Semantic search returns relevant results < 300ms
- ✅ All events logged with consolidated types

---

### Phase 3: Payment Infrastructure (Week 3-4)

**What to Build**:

1. **Stripe Integration (Fiat ONLY)**
   ```typescript
   // convex/payments/stripe.ts
   export const createCheckout = confect.mutation({
     args: {
       productId: v.id("entities"),
       priceUSD: v.number(),
     },
     handler: (ctx, args) =>
       Effect.gen(function* () {
         const db = yield* ConvexDatabase;
         const stripe = yield* StripeProvider;
         const auth = yield* AuthService;

         const userId = yield* auth.getCurrentUser();

         // Create Stripe checkout session
         const session = yield* stripe.createCheckoutSession({
           amount: args.priceUSD * 100, // cents
           currency: "usd",
           metadata: {
             userId: userId,
             productId: args.productId,
           },
         });

         // Log payment initiation
         yield* db.insert("events", {
           type: "payment_processed",
           actorId: userId,
           targetId: args.productId,
           timestamp: Date.now(),
           metadata: {
             status: "initiated",
             amount: args.priceUSD,
             currency: "USD",
             sessionId: session.id,
           },
         });

         return { checkoutUrl: session.url };
       }).pipe(Effect.provide(MainLayer)),
   });
   ```

2. **Multi-Chain Token Purchase**
   ```typescript
   // convex/tokens/purchase.ts
   export const purchaseToken = confect.mutation({
     args: {
       tokenId: v.id("entities"),
       amount: v.number(),
       paymentMethod: v.union(v.literal("fiat"), v.literal("crypto")),
       blockchain: v.optional(v.string()), // "base" | "sui" | "solana"
     },
     handler: (ctx, args) =>
       Effect.gen(function* () {
         const db = yield* ConvexDatabase;
         const auth = yield* AuthService;
         const userId = yield* auth.getCurrentUser();

         // Get token metadata
         const token = yield* db.get(args.tokenId);
         if (!token) {
           yield* Effect.fail(new DatabaseError({
             _tag: "NotFound",
             table: "entities",
             id: args.tokenId,
           }));
         }

         if (args.paymentMethod === "fiat") {
           // Fiat payment via Stripe
           const stripe = yield* StripeProvider;
           const payment = yield* stripe.charge({
             amount: token.properties.priceUSD * args.amount,
             currency: "usd",
           });

           // Then mint on blockchain specified in token metadata
           const blockchain = token.properties.blockchain || "base";
           // Route to correct blockchain provider...
         } else {
           // Direct crypto payment
           const blockchain = args.blockchain || token.properties.blockchain || "base";

           // Route to blockchain-specific provider
           if (blockchain === "base") {
             const alchemy = yield* AlchemyProvider;
             yield* alchemy.transfer({...});
           } else if (blockchain === "sui") {
             const sui = yield* SuiProvider;
             yield* sui.transfer({...});
           }
           // ... other chains
         }

         // Create transaction connection (consolidated type)
         yield* db.insert("connections", {
           fromEntityId: userId,
           toEntityId: args.tokenId,
           relationshipType: "transacted",
           metadata: {
             transactionType: "payment",
             amount: args.amount,
             paymentMethod: args.paymentMethod,
             blockchain: args.blockchain,
           },
           createdAt: Date.now(),
         });

         // Log event
         yield* db.insert("events", {
           type: "payment_processed",
           actorId: userId,
           targetId: args.tokenId,
           timestamp: Date.now(),
           metadata: {
             status: "completed",
             amount: args.amount,
             paymentMethod: args.paymentMethod,
           },
         });
       }).pipe(Effect.provide(MainLayer)),
   });
   ```

**Critical Architectural Notes**:
- **Stripe**: Handles ONLY fiat payments (USD, credit cards)
- **Blockchain Providers**: Handle ONLY crypto payments
- **Multi-Chain**: Each blockchain has dedicated provider (AlchemyProvider for Base, SuiProvider for Sui, etc.)
- **NO consolidation**: Type safety requires separate providers per chain

**Success Criteria**:
- ✅ Fiat payments work via Stripe
- ✅ Token minting works on Base chain
- ✅ Atomic operations (payment + mint)
- ✅ Rollback on failure
- ✅ Multi-chain routing works
- ✅ Events use consolidated types (payment_processed with metadata.status)

---

### Phase 4: AI Clone & Agent System (Week 5-6)

**What to Build**:

1. **AI Clone Creation**
   ```typescript
   // convex/aiClone/create.ts
   export const createAIClone = confect.mutation({
     args: {
       creatorId: v.id("entities"),
       voiceSamples: v.array(v.string()),
       appearanceImages: v.array(v.string()),
     },
     handler: (ctx, args) =>
       Effect.gen(function* () {
         const db = yield* ConvexDatabase;
         const elevenlabs = yield* ElevenLabsProvider;
         const did = yield* DIDProvider;
         const openai = yield* OpenAIProvider;

         // 1. Clone voice
         const voiceId = yield* elevenlabs.cloneVoice({
           samples: args.voiceSamples,
         });

         // 2. Clone appearance
         const avatar = yield* did.cloneAppearance({
           creatorId: args.creatorId,
           imageUrl: args.appearanceImages[0],
           videoSamples: args.appearanceImages.slice(1),
         });

         // 3. Extract personality (RAG over creator content)
         const creatorContent = yield* db
           .query("entities")
           .withIndex("by_type", (q) => q.eq("type", "blog_post"))
           .collect();

         const personality = yield* openai.chat({
           messages: [
             {
               role: "system",
               content: "Extract personality traits from creator content...",
             },
             {
               role: "user",
               content: JSON.stringify(creatorContent),
             },
           ],
         });

         // 4. Create AI clone entity
         const cloneId = yield* db.insert("entities", {
           type: "ai_clone",
           name: `AI Clone of Creator ${args.creatorId}`,
           properties: {
             voiceId,
             voiceProvider: "elevenlabs",
             appearanceId: avatar.avatarId,
             appearanceProvider: "d-id",
             systemPrompt: personality,
             temperature: 0.7,
           },
           status: "active",
           createdAt: Date.now(),
           updatedAt: Date.now(),
         });

         // 5. Create clone_of connection
         yield* db.insert("connections", {
           fromEntityId: cloneId,
           toEntityId: args.creatorId,
           relationshipType: "clone_of",
           createdAt: Date.now(),
         });

         // 6. Log events
         yield* Effect.all([
           db.insert("events", {
             type: "clone_created",
             actorId: args.creatorId,
             targetId: cloneId,
             timestamp: Date.now(),
             metadata: {},
           }),
           db.insert("events", {
             type: "voice_cloned",
             actorId: args.creatorId,
             targetId: cloneId,
             timestamp: Date.now(),
             metadata: { voiceId, provider: "elevenlabs" },
           }),
           db.insert("events", {
             type: "appearance_cloned",
             actorId: args.creatorId,
             targetId: cloneId,
             timestamp: Date.now(),
             metadata: { avatarId: avatar.avatarId, provider: "d-id" },
           }),
         ]);

         return cloneId;
       }).pipe(Effect.provide(MainLayer)),
   });
   ```

2. **Business Agent Registration**
   ```typescript
   // convex/agents/register.ts
   export const registerAgent = confect.mutation({
     args: {
       agentType: v.union(
         v.literal("strategy_agent"),
         v.literal("marketing_agent"),
         v.literal("sales_agent"),
         // ... all 10 types
       ),
       creatorId: v.id("entities"),
     },
     handler: (ctx, args) =>
       Effect.gen(function* () {
         const db = yield* ConvexDatabase;

         // Create agent entity
         const agentId = yield* db.insert("entities", {
           type: args.agentType,
           name: `${args.agentType} for Creator ${args.creatorId}`,
           properties: {
             systemPrompt: getSystemPromptForAgent(args.agentType),
             model: "gpt-4",
             temperature: 0.7,
             capabilities: getCapabilitiesForAgent(args.agentType),
           },
           status: "active",
           createdAt: Date.now(),
           updatedAt: Date.now(),
         });

         // Link to creator
         yield* db.insert("connections", {
           fromEntityId: agentId,
           toEntityId: args.creatorId,
           relationshipType: "manages",
           createdAt: Date.now(),
         });

         return agentId;
       }).pipe(Effect.provide(MainLayer)),
   });
   ```

3. **Agent Execution**
   ```typescript
   // convex/agents/execute.ts
   export const executeAgent = confect.action({
     args: {
       agentId: v.id("entities"),
       task: v.string(),
     },
     handler: (ctx, args) =>
       Effect.gen(function* () {
         const db = yield* ConvexDatabase;
         const openai = yield* OpenAIProvider;

         const agent = yield* db.get(args.agentId);

         // Execute agent task
         const result = yield* openai.chat({
           messages: [
             { role: "system", content: agent.properties.systemPrompt },
             { role: "user", content: args.task },
           ],
           model: agent.properties.model,
           temperature: agent.properties.temperature,
         });

         // Log execution
         yield* db.insert("events", {
           type: "agent_executed",
           actorId: args.agentId,
           timestamp: Date.now(),
           metadata: {
             task: args.task,
             result,
             status: "success",
           },
         });

         return result;
       }).pipe(Effect.provide(MainLayer)),
   });
   ```

**Success Criteria**:
- ✅ Voice cloning works (ElevenLabs)
- ✅ Appearance cloning works (D-ID)
- ✅ Personality extraction via RAG
- ✅ All 10 business agents can be registered
- ✅ Agents execute tasks successfully
- ✅ Events logged for all agent operations

---

### Phase 5: Token Economy (Week 5-6)

**What to Build**:

1. **Token Deployment (Multi-Chain)**
   ```typescript
   // convex/tokens/deploy.ts
   export const deployToken = confect.action({
     args: {
       name: v.string(),
       symbol: v.string(),
       totalSupply: v.number(),
       blockchain: v.union(v.literal("base"), v.literal("sui"), v.literal("solana")),
     },
     handler: (ctx, args) =>
       Effect.gen(function* () {
         const db = yield* ConvexDatabase;
         const auth = yield* AuthService;
         const creatorId = yield* auth.getCurrentUser();

         // Route to blockchain-specific provider
         let contractAddress: string;
         let txHash: string;

         if (args.blockchain === "base") {
           const alchemy = yield* AlchemyProvider;
           const result = yield* alchemy.deployToken({
             name: args.name,
             symbol: args.symbol,
             totalSupply: args.totalSupply,
             owner: creatorId,
           });
           contractAddress = result.contractAddress;
           txHash = result.txHash;
         } else if (args.blockchain === "sui") {
           const sui = yield* SuiProvider;
           const result = yield* sui.deployToken({...});
           contractAddress = result.packageId;
           txHash = result.txHash;
         } else if (args.blockchain === "solana") {
           const solana = yield* SolanaProvider;
           const result = yield* solana.deployToken({...});
           contractAddress = result.mint;
           txHash = result.signature;
         }

         // Create token entity
         const tokenId = yield* db.insert("entities", {
           type: "token",
           name: args.name,
           properties: {
             symbol: args.symbol,
             contractAddress,
             blockchain: args.blockchain,
             totalSupply: args.totalSupply,
             standard: args.blockchain === "base" ? "ERC20" :
                       args.blockchain === "sui" ? "Coin<T>" : "SPL",
           },
           status: "active",
           createdAt: Date.now(),
           updatedAt: Date.now(),
         });

         // Create ownership
         yield* db.insert("connections", {
           fromEntityId: creatorId,
           toEntityId: tokenId,
           relationshipType: "owns",
           metadata: { revenueShare: 1.0 },
           createdAt: Date.now(),
         });

         // Log deployment
         yield* db.insert("events", {
           type: "token_deployed",
           actorId: creatorId,
           targetId: tokenId,
           timestamp: Date.now(),
           metadata: {
             blockchain: args.blockchain,
             contractAddress,
             txHash,
           },
         });

         return tokenId;
       }).pipe(Effect.provide(MainLayer)),
   });
   ```

2. **DEX Integration (Chain-Specific)**
   ```typescript
   // convex/tokens/createPool.ts
   export const createLiquidityPool = confect.action({
     args: {
       tokenId: v.id("entities"),
       initialLiquidity: v.number(),
       initialPrice: v.number(),
     },
     handler: (ctx, args) =>
       Effect.gen(function* () {
         const db = yield* ConvexDatabase;
         const token = yield* db.get(args.tokenId);

         const blockchain = token.properties.blockchain;

         // Route to chain-specific DEX
         if (blockchain === "base") {
           const uniswap = yield* UniswapProvider;
           yield* uniswap.createLiquidityPool({
             tokenAddress: token.properties.contractAddress,
             initialLiquidity: args.initialLiquidity,
             initialPrice: args.initialPrice,
           });
         } else if (blockchain === "sui") {
           const suiDex = yield* SuiDEXProvider; // Future
           yield* suiDex.createPool({...});
         }
         // ... other chains
       }).pipe(Effect.provide(MainLayer)),
   });
   ```

**Success Criteria**:
- ✅ Tokens deploy on Base chain
- ✅ Multi-chain routing works (can add Sui, Solana)
- ✅ Liquidity pools created on Uniswap (Base)
- ✅ Token purchases atomic with rollback
- ✅ Events use consolidated types (token_transacted with metadata.action)

---

### Phase 6: Workflows & ELEVATE (Week 7-8)

**What to Build**:

1. **ELEVATE Journey System**
   ```typescript
   // convex/elevate/journey.ts
   import { WorkflowManager } from "@convex-dev/workflow";

   export const startELEVATEJourney = confect.action({
     args: { userId: v.id("entities") },
     handler: async (ctx, args) => {
       const workflow = new WorkflowManager(ctx);

       await workflow.start("elevate_journey", {
         steps: [
           { name: "Hook", action: internal.elevate.hook },
           { name: "Gift", action: internal.elevate.gift },
           { name: "Identify", action: internal.elevate.identify },
           { name: "Engage", action: internal.elevate.engage },
           { name: "Sell", action: internal.elevate.sell, paymentGate: true },
           { name: "Nurture", action: internal.elevate.nurture },
           { name: "Upsell", action: internal.elevate.upsell },
           { name: "Understand", action: internal.elevate.understand },
           { name: "Share", action: internal.elevate.share },
         ],
         userId: args.userId,
       });
     },
   });

   // Each step uses Effect.ts internally
   export const hookStep = internalAction({
     handler: (ctx, args) =>
       Effect.gen(function* () {
         const openai = yield* OpenAIProvider;
         // Generate hook content...
       }).pipe(Effect.provide(MainLayer)),
   });
   ```

2. **Workflow Persistence**
   - Workflow component handles durability
   - Effect.ts handles business logic in actions
   - Events logged at each step

**Success Criteria**:
- ✅ ELEVATE journey starts and persists
- ✅ Workflows resume after restart
- ✅ Payment gates work
- ✅ Progress tracked in UI
- ✅ All steps execute successfully

---

### Phase 7: Livestreaming & Media (Week 7-8)

**What to Build**:

1. **Livestreaming Infrastructure (Cloudflare ONLY)**
   ```typescript
   // convex/livestream/create.ts
   export const createLivestream = confect.action({
     args: {
       name: v.string(),
       scheduledAt: v.optional(v.number()),
     },
     handler: (ctx, args) =>
       Effect.gen(function* () {
         const db = yield* ConvexDatabase;
         const cloudflare = yield* CloudflareProvider; // Livestreaming ONLY
         const auth = yield* AuthService;
         const creatorId = yield* auth.getCurrentUser();

         // Create livestream on Cloudflare Stream
         const stream = yield* cloudflare.createLivestream({
           name: args.name,
           scheduledAt: args.scheduledAt,
         });

         // Create livestream entity
         const livestreamId = yield* db.insert("entities", {
           type: "livestream",
           name: args.name,
           properties: {
             streamId: stream.streamId,
             rtmpUrl: stream.rtmpUrl,
             streamKey: stream.streamKey,
             playbackUrl: stream.playbackUrl,
             webRtcUrl: stream.webRtcUrl,
             provider: "cloudflare",
           },
           status: "scheduled",
           createdAt: Date.now(),
           updatedAt: Date.now(),
         });

         // Create ownership
         yield* db.insert("connections", {
           fromEntityId: creatorId,
           toEntityId: livestreamId,
           relationshipType: "owns",
           createdAt: Date.now(),
         });

         // Log event (consolidated type)
         yield* db.insert("events", {
           type: "livestream_status_changed",
           actorId: creatorId,
           targetId: livestreamId,
           timestamp: Date.now(),
           metadata: {
             status: "scheduled",
             streamId: stream.streamId,
             scheduledAt: args.scheduledAt,
           },
         });

         return livestreamId;
       }).pipe(Effect.provide(MainLayer)),
   });
   ```

2. **General Media Storage (AWS ONLY)**
   ```typescript
   // convex/media/upload.ts
   export const uploadMedia = confect.action({
     args: {
       file: v.any(),
       contentType: v.string(),
       entityId: v.id("entities"),
     },
     handler: (ctx, args) =>
       Effect.gen(function* () {
         const aws = yield* AWSProvider; // General media ONLY (NOT livestreaming)

         // Upload to S3 + CloudFront
         const result = yield* aws.uploadFile({
           file: args.file,
           key: `media/${args.entityId}/${Date.now()}`,
           contentType: args.contentType,
         });

         // Update entity with media URL
         const db = yield* ConvexDatabase;
         yield* db.patch(args.entityId, {
           properties: {
             mediaUrl: result.cloudFrontUrl, // CDN URL
           },
         });

         return result.cloudFrontUrl;
       }).pipe(Effect.provide(MainLayer)),
   });
   ```

**Critical Architectural Notes**:
- **Cloudflare Stream**: LIVESTREAMING ONLY (real-time RTMP/WebRTC)
- **AWS S3 + CloudFront**: General media storage (images, videos, audio, documents)
- Clear separation: live content vs. static media

**Success Criteria**:
- ✅ Livestreams created on Cloudflare Stream
- ✅ RTMP URLs work for streaming
- ✅ Media uploads to AWS S3 with CloudFront URLs
- ✅ Events use consolidated types (livestream_status_changed with metadata.status)

---

### Phase 8: Viral Growth & Referrals (Week 9)

**What to Build**:

1. **Referral System**
   ```typescript
   // convex/referrals/create.ts
   export const createReferral = confect.mutation({
     args: {
       referredEmail: v.string(),
     },
     handler: (ctx, args) =>
       Effect.gen(function* () {
         const db = yield* ConvexDatabase;
         const auth = yield* AuthService;
         const referrerId = yield* auth.getCurrentUser();

         // Generate referral code
         const referralCode = generateCode();

         // Create referral entity
         const referralId = yield* db.insert("entities", {
           type: "referral",
           name: `Referral ${referralCode}`,
           properties: {
             referrerCode: referralCode,
             referredEmail: args.referredEmail,
             status: "pending",
             tokensEarned: 0,
           },
           status: "active",
           createdAt: Date.now(),
           updatedAt: Date.now(),
         });

         // Create referred connection (consolidated type)
         yield* db.insert("connections", {
           fromEntityId: referralId,
           toEntityId: referrerId,
           relationshipType: "referred",
           metadata: {
             referralType: "direct",
             referralCode,
             source: "manual_invite",
           },
           createdAt: Date.now(),
         });

         // Log event (consolidated type)
         yield* db.insert("events", {
           type: "referral_activity",
           actorId: referrerId,
           targetId: referralId,
           timestamp: Date.now(),
           metadata: {
             action: "created",
             referralCode,
           },
         });

         return { referralCode, referralUrl: `${baseUrl}/invite/${referralCode}` };
       }).pipe(Effect.provide(MainLayer)),
   });
   ```

2. **Magic Links**
   ```typescript
   // convex/invitations/magicLink.ts
   export const generateMagicLink = confect.mutation({
     args: { email: v.string() },
     handler: (ctx, args) =>
       Effect.gen(function* () {
         const db = yield* ConvexDatabase;

         // Generate secure token
         const token = generateSecureToken();

         // Store invitation
         yield* db.insert("entities", {
           type: "lead",
           name: args.email,
           properties: {
             email: args.email,
             magicLinkToken: token,
             expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
           },
           status: "pending",
           createdAt: Date.now(),
           updatedAt: Date.now(),
         });

         return `${baseUrl}/invite/${token}`;
       }).pipe(Effect.provide(MainLayer)),
   });
   ```

**Success Criteria**:
- ✅ Referral codes generated
- ✅ Magic links work for auto-registration
- ✅ Conversion tracking works
- ✅ Referral rewards calculated
- ✅ Events use consolidated types (referral_activity with metadata.action)

---

## Progressive Enhancement Strategy

### Iteration 1: Minimal Viable Platform (Week 1-4)

**Goal**: Single creator can create AI clone and sell tokens

**Features**:
- ✅ Plain Convex schema deployed
- ✅ ConvexDatabase service operational
- ✅ Authentication working with ontology
- ✅ AI clone creation (voice + personality)
- ✅ Token purchase (Stripe + Base blockchain)
- ✅ Basic content creation

**Success Metric**: 1 creator using platform with fans chatting with AI clone and buying tokens

**Why This Works**: Proves entire tech stack end-to-end

---

### Iteration 2: Multi-Creator Platform (Week 5-8)

**Goal**: 10 creators with full business agent suite

**Features**:
- ✅ All 10 business agents operational
- ✅ ELEVATE journey working
- ✅ Course creation and enrollment
- ✅ Community features
- ✅ Referral system
- ✅ Analytics dashboard

**Success Metric**: 10 creators, 100+ fans, $10K+ in token sales

**Why This Works**: Validates business model and creator experience

---

### Iteration 3: Viral Growth (Week 9-12)

**Goal**: Scale to 100+ creators

**Features**:
- ✅ Magic link invitations
- ✅ User-generated content tools
- ✅ Advanced analytics
- ✅ Livestreaming with AI clone mixing
- ✅ NFT integration
- ✅ Multi-chain expansion (Sui/Solana)

**Success Metric**: 100+ creators, 10K+ fans, K-factor > 1 (viral growth)

**Why This Works**: Network effects kick in at scale

---

## AI Agent Generation Patterns

### The Magic: Type-Driven Development

```
Ontology → Schema → Types → Services → Functions → Features
   ↓         ↓        ↓         ↓          ↓          ↓
SOURCE   DEFINES  ENFORCES  COMPOSES   BUILDS    DELIVERS
```

**Key Constraints**:
1. ✅ AI must use entity types from ontology (46 types defined)
2. ✅ AI must use connection types from ontology (24 types defined)
3. ✅ AI must use event types from ontology (38 types defined)
4. ✅ TypeScript compiler catches invalid compositions
5. ✅ Effect.ts enforces service composition patterns

**Result**: AI can't generate inconsistent code even if it tries

---

### Progressive AI Enhancement

**Generation 1: Simple CRUD Operations**
- **What**: Create entity → Connect entities → Log event
- **Pattern**: `db.insert → db.insert connection → db.insert event`
- **Example**: Create blog post

```typescript
// AI generates this pattern automatically
const postId = await db.insert("entities", { type: "blog_post", ... });
await db.insert("connections", { fromEntityId: creatorId, toEntityId: postId, relationshipType: "owns" });
await db.insert("events", { type: "content_changed", actorId: creatorId, metadata: { action: "created" } });
```

**Generation 2: Service Composition**
- **What**: Multiple entities + relationships + events
- **Pattern**: `Effect.all` for parallel operations
- **Example**: AI clone creation (voice + appearance + personality in parallel)

```typescript
// AI generates parallel service calls
yield* Effect.all([
  elevenlabs.cloneVoice({...}),
  did.cloneAppearance({...}),
  openai.extractPersonality({...}),
]);
```

**Generation 3: Multi-Agent Orchestration**
- **What**: Agents calling other agents
- **Pattern**: `Effect.gen` with service dependencies
- **Example**: Marketing agent uses research agent data

```typescript
// AI generates agent orchestration
yield* Effect.gen(function* () {
  const researchData = yield* researchAgent.analyze({...});
  const marketingPlan = yield* marketingAgent.createPlan({ data: researchData });
  return marketingPlan;
});
```

**Generation 4: Complex Workflows**
- **What**: Durable workflows with Effect business logic
- **Pattern**: Workflow component + Effect actions
- **Example**: ELEVATE journey with payment gates

```typescript
// AI generates workflow with Effect actions
const workflow = new WorkflowManager(ctx);
await workflow.start("elevate", {
  steps: steps.map(s => ({ action: internal.elevate[s.name] }))
});
```

**Generation 5: Full Features from DSL**
- **What**: End-to-end from Plain English DSL
- **Pattern**: DSL → Validation → Claude generation → Type checking → Tests
- **Example**: "Let fans buy tokens" → Complete feature

```typescript
// AI parses Plain English DSL
FEATURE: Let fans buy my tokens
INPUT: fan, token, amount, price
DO TOGETHER: CALL Stripe, CALL Blockchain
// → Generates complete TypeScript + Effect.ts implementation
```

---

### How Each Generation Gets Smarter

**Iteration 1**: AI learns entity/connection/event patterns
- Input: Ontology types
- Output: Basic CRUD operations
- Learning: Type constraints prevent errors

**Iteration 2**: AI learns service composition
- Input: Provider interfaces
- Output: Multi-service operations
- Learning: Effect.ts patterns for error handling

**Iteration 3**: AI learns business logic patterns
- Input: Previous successful implementations
- Output: Complex features
- Learning: Semantic understanding of domain

**Iteration 4**: AI learns workflow patterns
- Input: ELEVATE and other workflows
- Output: Durable multi-step processes
- Learning: State management and persistence

**Iteration 5**: AI generates from natural language
- Input: Plain English DSL
- Output: Complete features with tests
- Learning: Intent understanding and code generation

---

## Critical Path & Dependencies

```
┌─────────────────────────────────────────────────────────┐
│                 FOUNDATION LAYER (Week 1-2)             │
│                                                         │
│  Plain Convex Schema → ConvexDatabase → Effect Providers│
│                                                         │
└───────────────────┬─────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐       ┌───────────────┐
│  AUTH SERVICE │       │ CONTENT SERVICE│
│   (Week 1-2)  │       │   (Week 3-4)   │
└───────┬───────┘       └───────┬────────┘
        │                       │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │   PAYMENT INFRA       │
        │   Stripe + Base       │
        │   (Week 3-4)          │
        └───────────┬───────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐       ┌───────────────┐
│  AI CLONE     │       │ TOKEN ECONOMY │
│  + AGENTS     │       │ + DEX         │
│  (Week 5-6)   │       │ (Week 5-6)    │
└───────┬───────┘       └───────┬───────┘
        │                       │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │   WORKFLOWS           │
        │   ELEVATE Journey     │
        │   (Week 7-8)          │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │   VIRAL GROWTH        │
        │   Referrals + Magic   │
        │   (Week 9-12)         │
        └───────────────────────┘
```

**Critical Path** (must be sequential):
1. Plain Convex Schema (Week 1)
2. ConvexDatabase Service (Week 1-2)
3. Effect Providers (Week 2-3)
4. Core services build in parallel (Week 3-6)
5. Integration and testing (Week 7-8)
6. Scale features (Week 9-12)

**Parallel Work Streams**:
- **Stream A**: Auth → User entities → Business agents
- **Stream B**: Content → Search → RAG
- **Stream C**: Payments → Tokens → DEX
- **Stream D**: AI Clone → Voice → Personality

---

## Testing Checkpoints

### ✅ Checkpoint 1: Schema Migration (Week 1)
- Schema deploys without errors
- All 46 entity types creatable
- All 24 connection types work
- All 38 event types log correctly
- Indexes performant (< 100ms queries)

### ✅ Checkpoint 2: Database Service (Week 2)
- CRUD operations type-safe
- Effect error channels work
- Mock services test successfully
- Transactions rollback on failure

### ✅ Checkpoint 3: Provider Integration (Week 3)
- OpenAI calls succeed
- ElevenLabs voice cloning works
- Stripe payment flows complete
- Base blockchain mints tokens
- All providers have typed errors

### ✅ Checkpoint 4: Core Features (Week 6)
- AI clone creation end-to-end
- Token purchase atomic operation
- Content creation with tags
- Semantic search < 300ms
- Business agents execute

### ✅ Checkpoint 5: Workflows (Week 8)
- ELEVATE journey completes
- Workflows resume after restart
- Payment gates work
- Progress persists
- Cron jobs execute

### ✅ Checkpoint 6: Production Readiness (Week 12)
- 100+ creators onboarded
- 1000+ fans active
- $50K+ in transactions
- Sub-second p95 latency
- Zero data loss incidents

---

## Key Architectural Decisions

### Decision 1: Plain Convex Schema (NO Convex Ents)
**Rationale**: Simpler for AI agents, no magic, direct control, better for metadata patterns
**Impact**: 25% complexity reduction, explicit relationship queries
**Reference**: `docs/Schema.md`, `docs/Migration-Guide.md`

### Decision 2: Effect.ts 100% Coverage
**Rationale**: Consistent patterns, typed errors everywhere, automatic DI, better AI generation
**Impact**: Every function has typed error channels, all services composable
**Reference**: `docs/Service Layer.md`, `docs/Effects Provider.md`

### Decision 3: Multi-Chain Separate Providers
**Rationale**: Type safety per chain, different APIs/gas/tokens, easy to add new chains
**Impact**: AlchemyProvider (Base), SuiProvider (Sui), SolanaProvider (Solana) - no consolidation
**Reference**: `docs/Service Providers - New.md`

### Decision 4: Stripe for Fiat ONLY
**Rationale**: Clear separation prevents confusion, blockchain handles crypto
**Impact**: Stripe = USD/credit cards, Blockchain = tokens/on-chain
**Reference**: `docs/Architecture.md`

### Decision 5: Cloudflare for Livestreaming ONLY
**Rationale**: Specialized use case, AWS handles general media
**Impact**: Cloudflare Stream = live RTMP/WebRTC, AWS S3 = static media
**Reference**: `docs/Service Providers - New.md`

### Decision 6: Metadata Consolidation (24+38 types)
**Rationale**: Fewer types = easier for AI, metadata provides flexibility + type safety
**Impact**: 33→24 connections (-27%), 54→38 events (-30%)
**Reference**: `docs/Ontology.md`

### Decision 7: Components + Effect Pattern
**Rationale**: Components handle infrastructure, Effect handles business logic
**Impact**: @convex-dev/workflow + @convex-dev/rag + @convex-dev/resend all wrap in Effect
**Reference**: `docs/Components.md`

---

## Week-by-Week Roadmap

### Week 1: Foundation
**Goal**: Schema deployed, database service operational

**Tasks**:
1. ✅ Implement plain Convex schema (`convex/schema.ts`)
2. ✅ Deploy to Convex dev environment
3. ✅ Create ConvexDatabase Effect service
4. ✅ Test CRUD operations with mocks
5. ✅ Create provider skeleton files

**Deliverable**: Can create/read entities with typed Effect operations

---

### Week 2: Providers & Auth
**Goal**: All providers implemented, auth integrated with ontology

**Tasks**:
1. ✅ Implement all 14 provider services
2. ✅ Create AllProviders composition layer
3. ✅ Migrate Better Auth to ontology
4. ✅ Create AuthService wrapper
5. ✅ Test auth flows create entities

**Deliverable**: All services composable, auth creates user entities

---

### Week 3: Content & Search
**Goal**: Content creation working, semantic search operational

**Tasks**:
1. ✅ Universal content creator (7 types)
2. ✅ Semantic search with OpenAI embeddings
3. ✅ Tags and discovery system
4. ✅ RAG integration for AI knowledge
5. ✅ Test content creation end-to-end

**Deliverable**: Can create content, search returns results < 300ms

---

### Week 4: Payments
**Goal**: Fiat and crypto payments working

**Tasks**:
1. ✅ Stripe integration (fiat only)
2. ✅ Base blockchain integration (Alchemy)
3. ✅ Atomic token purchase (payment + mint)
4. ✅ Rollback on failure
5. ✅ Test payment flows

**Deliverable**: Can purchase tokens with Stripe or crypto

---

### Week 5: AI Clone
**Goal**: AI clone creation working

**Tasks**:
1. ✅ Voice cloning (ElevenLabs)
2. ✅ Appearance cloning (D-ID/HeyGen)
3. ✅ Personality extraction (OpenAI + RAG)
4. ✅ Clone creation flow
5. ✅ Test AI clone interactions

**Deliverable**: Fans can chat with AI clone

---

### Week 6: Business Agents
**Goal**: All 10 agents operational

**Tasks**:
1. ✅ Agent registration system
2. ✅ Agent execution engine
3. ✅ Implement all 10 agent types
4. ✅ Agent orchestration patterns
5. ✅ Test agent workflows

**Deliverable**: Agents execute tasks successfully

---

### Week 7: Workflows
**Goal**: ELEVATE journey working

**Tasks**:
1. ✅ Workflow component integration
2. ✅ ELEVATE 9-step journey
3. ✅ Payment gates
4. ✅ Progress tracking
5. ✅ Test workflow persistence

**Deliverable**: ELEVATE journey completes end-to-end

---

### Week 8: Livestreaming
**Goal**: Livestreaming infrastructure operational

**Tasks**:
1. ✅ Cloudflare Stream integration (livestreaming only)
2. ✅ AWS S3 media storage (general media)
3. ✅ RTMP ingest working
4. ✅ WebRTC playback
5. ✅ Test livestream creation

**Deliverable**: Can stream live with AI clone mixing

---

### Week 9: Viral Growth
**Goal**: Referral system working

**Tasks**:
1. ✅ Referral code generation
2. ✅ Magic link invitations
3. ✅ Conversion tracking
4. ✅ Referral rewards
5. ✅ Test referral flows

**Deliverable**: K-factor > 1 (viral growth)

---

### Week 10-12: Scale & Polish
**Goal**: 100+ creators, production ready

**Tasks**:
1. ✅ Performance optimization
2. ✅ Multi-chain expansion (Sui/Solana)
3. ✅ Advanced analytics
4. ✅ NFT integration
5. ✅ Production monitoring

**Deliverable**: $50K+ transactions, zero data loss

---

## Next Immediate Steps

### This Week (Week 1)

**Priority 1: Implement Plain Convex Schema**
- File: `convex/schema.ts`
- Reference: `docs/Schema.md`
- All 46 entity types, 24 connections, 38 events
- Deploy to Convex dev

**Priority 2: Create ConvexDatabase Service**
- File: `convex/services/core/database.ts`
- Effect.ts wrapper around Convex operations
- Typed error channels
- Test with mocks

**Priority 3: Provider Skeletons**
- Files: `convex/services/providers/*.ts`
- All 14 providers
- Data.TaggedEnum errors
- Context.Tag for DI

**Success Metric**: Can create entities with typed Effect operations by end of week

---

## Appendix: Key References

**Architecture**:
- `docs/Architecture.md` - System design, FP rationale, multi-chain
- `docs/Strategy.md` - Business vision, features
- `docs/Ontology.md` - 4-table data model (source of truth)

**Schema & Database**:
- `docs/Schema.md` - Plain Convex schema specification
- `docs/Migration-Guide.md` - Convex Ents → Plain Convex migration

**Services**:
- `docs/Service Layer.md` - Effect.ts patterns
- `docs/Service Providers - New.md` - All 14 provider specs
- `docs/Effects Provider.md` - Effect.ts integration

**DSL & Generation**:
- `docs/DSL.md` - DSL concepts
- `docs/ONE DSL.md` - Technical DSL spec
- `docs/ONE DSL English.md` - Plain English DSL

**Implementation**:
- `docs/Implementation Examples.md` - Code patterns
- `docs/Patterns.md` - Best practices
- `docs/Rules.md` - Development standards
- `docs/Workflow.md` - Development flow

**Tools**:
- `docs/CLI.md` - CLI tooling
- `docs/Components.md` - Convex components integration

---

**Status**: Ready for implementation. Begin with Week 1 foundation layer.
