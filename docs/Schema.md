# ONE Platform - Convex Schema (Plain Convex)

**Version**: 2.0.0 (Migrated from Convex Ents)
**Status**: Plain Convex schema - no external dependencies
**Optimized**: 24 connection types, 38 event types

---

## Schema Definition

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================================================
  // ENTITIES: All objects in the ONE universe (46 types)
  // ============================================================================
  entities: defineTable({
    // Universal fields
    type: v.union(
      // Core entities (3)
      v.literal("creator"),
      v.literal("ai_clone"),
      v.literal("audience_member"),

      // Business function agents (10)
      v.literal("strategy_agent"),
      v.literal("research_agent"),
      v.literal("marketing_agent"),
      v.literal("sales_agent"),
      v.literal("service_agent"),
      v.literal("design_agent"),
      v.literal("engineering_agent"),
      v.literal("finance_agent"),
      v.literal("legal_agent"),
      v.literal("intelligence_agent"),

      // Content types (7)
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

    name: v.string(),

    // Type-specific properties stored as JSON
    properties: v.any(),

    // Status tracking
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    )),

    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    // Indexes for efficient queries
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_type_status", ["type", "status"])
    .index("by_created", ["createdAt"])
    .index("by_updated", ["updatedAt"])
    // Search index for entities
    .searchIndex("search_entities", {
      searchField: "name",
      filterFields: ["type", "status"]
    }),

  // ============================================================================
  // CONNECTIONS: All relationships (24 types - optimized from 33)
  // ============================================================================
  connections: defineTable({
    fromEntityId: v.id("entities"),
    toEntityId: v.id("entities"),
    relationshipType: v.union(
      // Ownership (2)
      v.literal("owns"),
      v.literal("created_by"),

      // AI Relationships (3)
      v.literal("clone_of"),
      v.literal("trained_on"),
      v.literal("powers"),

      // Content Relationships (5)
      v.literal("authored"),
      v.literal("generated_by"),
      v.literal("published_to"),
      v.literal("part_of"),
      v.literal("references"),

      // Community Relationships (4)
      v.literal("member_of"),
      v.literal("following"),
      v.literal("moderates"),
      v.literal("participated_in"),

      // Business Relationships (4)
      v.literal("manages"),
      v.literal("reports_to"),
      v.literal("collaborates_with"),
      v.literal("assigned_to"),

      // Token Relationships (3)
      v.literal("holds_tokens"),
      v.literal("staked_in"),
      v.literal("earned_from"),

      // Product Relationships (4)
      v.literal("purchased"),
      v.literal("enrolled_in"),
      v.literal("completed"),
      v.literal("teaching"),

      // CONSOLIDATED: Payment Relationships (1 - was 3)
      v.literal("transacted"), // payment, subscription, invoice (use metadata.transactionType)

      // CONSOLIDATED: Referral Relationships (1 - was 2)
      v.literal("referred"), // direct, conversion, campaign (use metadata.referralType)

      // CONSOLIDATED: Notification Relationships (1 - was 2)
      v.literal("notified"), // all channels (use metadata.channel)

      // Media Relationships (2)
      v.literal("featured_in"),
      v.literal("hosted_on"),

      // Analytics Relationships (3)
      v.literal("analyzed_by"),
      v.literal("optimized_by"),
      v.literal("influences")
    ),

    // Metadata for type-specific data and consolidated types
    metadata: v.optional(v.any()),

    createdAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    // Indexes for relationship queries
    .index("from_entity", ["fromEntityId"])
    .index("to_entity", ["toEntityId"])
    .index("from_type", ["fromEntityId", "relationshipType"])
    .index("to_type", ["toEntityId", "relationshipType"])
    .index("bidirectional", ["fromEntityId", "toEntityId", "relationshipType"])
    .index("by_created", ["createdAt"]),

  // ============================================================================
  // EVENTS: All actions (38 types - optimized from 54)
  // ============================================================================
  events: defineTable({
    type: v.union(
      // Creator Events (3)
      v.literal("creator_created"),
      v.literal("creator_updated"),
      v.literal("content_uploaded"),

      // AI Clone Events (5)
      v.literal("clone_created"),
      v.literal("clone_interaction"),
      v.literal("clone_generated_content"),
      v.literal("voice_cloned"),
      v.literal("appearance_cloned"),

      // Agent Events (4)
      v.literal("agent_created"),
      v.literal("agent_executed"),
      v.literal("agent_completed"),
      v.literal("agent_failed"),

      // CONSOLIDATED: Content Events (2 - was 5)
      v.literal("content_changed"),      // created, updated, deleted (use metadata.action)
      v.literal("content_interacted"),   // viewed, shared, liked (use metadata.interactionType)

      // Audience Events (4)
      v.literal("user_joined"),
      v.literal("user_engaged"),
      v.literal("ugc_created"),
      v.literal("comment_posted"),

      // Course Events (5)
      v.literal("course_created"),
      v.literal("course_enrolled"),
      v.literal("lesson_completed"),
      v.literal("course_completed"),
      v.literal("certificate_earned"),

      // Token Events (7)
      v.literal("token_deployed"),
      v.literal("tokens_purchased"),
      v.literal("tokens_earned"),
      v.literal("tokens_burned"),
      v.literal("tokens_staked"),
      v.literal("tokens_unstaked"),
      v.literal("governance_vote"),

      // Business Events (3)
      v.literal("revenue_generated"),
      v.literal("cost_incurred"),
      v.literal("referral_made"),

      // Growth Events (4)
      v.literal("viral_share"),
      v.literal("referral_converted"),
      v.literal("achievement_unlocked"),
      v.literal("level_up"),

      // Analytics Events (5)
      v.literal("metric_calculated"),
      v.literal("insight_generated"),
      v.literal("prediction_made"),
      v.literal("optimization_applied"),
      v.literal("report_generated"),

      // CONSOLIDATED: Payment Events (2 - was 6)
      v.literal("payment_processed"),     // initiated, completed, failed, refunded (use metadata.status)
      v.literal("subscription_updated"),  // started, renewed, cancelled (use metadata.action)

      // CONSOLIDATED: Livestream Events (2 - was 4)
      v.literal("livestream_status_changed"),  // scheduled, started, ended (use metadata.status)
      v.literal("livestream_interaction"),     // joined, left, message (use metadata.type)

      // CONSOLIDATED: Notification Events (1 - was 3)
      v.literal("notification_delivered"),     // email, sms, push, in_app (use metadata.channel)

      // CONSOLIDATED: Referral Events (2 - was 3)
      v.literal("referral_activity"),          // created, converted (use metadata.action)
      v.literal("lead_captured")
    ),

    actorId: v.id("entities"),        // Who/what caused this
    targetId: v.optional(v.id("entities")),  // Optional target entity
    timestamp: v.number(),             // When it happened
    metadata: v.any(),                 // Event-specific data (includes action/status for consolidated types)
  })
    // Indexes for event queries
    .index("by_type", ["type"])
    .index("by_actor", ["actorId"])
    .index("by_target", ["targetId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_actor_type", ["actorId", "type"])
    .index("by_target_type", ["targetId", "type"]),

  // ============================================================================
  // TAGS: All categories
  // ============================================================================
  tags: defineTable({
    entityId: v.id("entities"),
    key: v.string(),
    value: v.string(),
  })
    .index("by_entity", ["entityId"])
    .index("by_key", ["key"])
    .index("by_key_value", ["key", "value"]),
});
```

---

## Key Changes from Convex Ents

### 1. Imports

**Before (Convex Ents)**:
```typescript
import { defineEnt, defineEntSchema, getEntDefinitions } from "convex-ents";
const schema = defineEntSchema({...});
export const entDefinitions = getEntDefinitions(schema);
```

**After (Plain Convex)** ✅:
```typescript
import { defineSchema, defineTable } from "convex/server";
export default defineSchema({...});
```

### 2. Table Definitions

**Before (Convex Ents)**:
```typescript
entities: defineEnt({
  type: v.string(),
  name: v.string(),
})
  .field("type", v.string(), { index: true })
  .edges("outgoingConnections", { to: "connections", field: "fromEntityId" })
```

**After (Plain Convex)** ✅:
```typescript
entities: defineTable({
  type: v.union(v.literal("creator"), /*...*/),
  name: v.string(),
})
  .index("by_type", ["type"])
```

### 3. Relationship Queries

**Before (Convex Ents Magic)**:
```typescript
const creator = await ctx.db.get(creatorId);
const owned = await creator.edge("outgoingConnections");
```

**After (Plain Convex - Explicit)** ✅:
```typescript
const creator = await ctx.db.get(creatorId);
const ownedConnections = await ctx.db
  .query("connections")
  .withIndex("from_type", (q) =>
    q.eq("fromEntityId", creatorId).eq("relationshipType", "owns")
  )
  .collect();
```

---

## Type Optimizations

### Connection Types: 33 → 24

**Consolidated Types**:
1. `transacted` - replaces `paid_for`, `subscribed_to`, `invoiced_to`
   - Use `metadata.transactionType: "payment" | "subscription" | "invoice"`

2. `referred` - replaces `referred_by`, `converted_from`
   - Use `metadata.referralType: "direct" | "conversion" | "campaign"`

3. `notified` - replaces `notified_about`, `campaigned_to`
   - Use `metadata.channel: "email" | "sms" | "push" | "in_app"`

### Event Types: 54 → 38

**Consolidated Types**:
1. `payment_processed` - replaces 4 payment events
   - Use `metadata.status: "initiated" | "completed" | "failed" | "refunded"`

2. `subscription_updated` - replaces 2 subscription events
   - Use `metadata.action: "started" | "renewed" | "cancelled"`

3. `content_changed` - replaces 3 content modification events
   - Use `metadata.action: "created" | "updated" | "deleted"`

4. `content_interacted` - replaces 3 content interaction events
   - Use `metadata.interactionType: "viewed" | "shared" | "liked"`

5. `livestream_status_changed` - replaces 3 livestream status events
   - Use `metadata.status: "scheduled" | "started" | "ended"`

6. `livestream_interaction` - replaces viewer events
   - Use `metadata.type: "joined" | "left" | "message"`

7. `notification_delivered` - replaces 3 notification events
   - Use `metadata.channel: "email" | "sms" | "push" | "in_app"`

8. `referral_activity` - replaces 2 referral events
   - Use `metadata.action: "created" | "converted"`

---

## Query Patterns (Effect.ts)

### Simple Entity Query

```typescript
import { confect } from "convex-helpers/server/confect";
import { Effect } from "effect";
import { ConvexDatabase, NotFoundError } from "./services/database";

export const getCreator = confect.query({
  args: { creatorId: v.id("entities") },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const db = yield* ConvexDatabase;
      const creator = yield* db.get(args.creatorId);

      if (!creator || creator.type !== "creator") {
        return yield* Effect.fail(new NotFoundError("Creator not found"));
      }

      return creator;
    }).pipe(Effect.provide(MainLayer))
});
```

### Relationship Query

```typescript
export const getOwnedContent = confect.query({
  args: { creatorId: v.id("entities") },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const db = yield* ConvexDatabase;

      // Get connections using index
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

      return ownedEntities.filter(Boolean);
    }).pipe(Effect.provide(MainLayer))
});
```

### Metadata-Based Query

```typescript
export const getSuccessfulPayments = confect.query({
  args: { userId: v.id("entities") },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const db = yield* ConvexDatabase;

      // Query by type, filter by metadata
      const allPayments = yield* db
        .query("events")
        .withIndex("by_actor_type", (q) =>
          q.eq("actorId", args.userId).eq("type", "payment_processed")
        )
        .collect();

      // Filter by metadata.status
      const successfulPayments = allPayments.filter(
        (event) => event.metadata?.status === "completed"
      );

      return successfulPayments;
    }).pipe(Effect.provide(MainLayer))
});
```

---

## Migration Checklist

### Phase 1: Schema Update
- [x] Replace `defineEnt` with `defineTable`
- [x] Replace `defineEntSchema` with `defineSchema`
- [x] Remove `.field()` and `.edges()` methods
- [x] Add explicit `.index()` for all queries
- [x] Optimize connection types (33 → 24)
- [x] Optimize event types (54 → 38)

### Phase 2: Query Migration
- [ ] Replace `.edge()` with `.query().withIndex()`
- [ ] Wrap all queries in Effect.ts
- [ ] Add typed error channels
- [ ] Update all relationship traversals

### Phase 3: Cleanup
- [ ] Remove `convex-ents` package
- [ ] Remove all Ents imports
- [ ] Update all code examples
- [ ] Test all queries

---

## Benefits

✅ **No External Dependency** - Remove `convex-ents` package
✅ **More Explicit** - See exactly what queries do
✅ **Better TypeScript** - Full control over types
✅ **27% Fewer Connection Types** - Consolidated with metadata
✅ **30% Fewer Event Types** - Consolidated with metadata
✅ **Same Performance** - Direct Convex index usage

---

**Status**: Ready for migration. See `docs/Migration-Guide.md` for step-by-step instructions.
