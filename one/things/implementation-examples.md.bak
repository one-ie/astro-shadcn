
# ONE Platform - Implementation Examples

**Complete Reference**: Ontology, DSL, Schema, and Implementation Patterns

---

## Overview

The 4-table ontology architecture (entities, connections, events, tags) provides unprecedented flexibility, while Convex + Effect.ts delivers production-grade reliability.

**Tech Stack**: Astro + React + shadcn/ui frontend, Convex backend with comprehensive components (@convex-dev/agent, workflow, rag, rate-limiter), Effect.ts service layer, Stripe Connect for payments.

### Foundation Documents

This document integrates information from:

1. **Ontology** (`Ontology.md`) - The 4-table data model that defines ALL things, connections, events, and tags
2. **DSL** (`DSL.md`, `ONE DSL.md`, `ONE DSL English.md`) - Domain-specific language for feature definition
3. **Schema** (`convex/schema.ts`) - Current authentication-focused schema and target ontology-based schema
4. **Implementation Examples** - Real-world code patterns and feature implementations

### Complete Architecture Stack

```
┌─────────────────────────────────────────────────────────────┐
│ Plain English DSL (Creator/CEO writes features)             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Technical DSL (JSON-like, validates against ontology)       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Ontology (4 tables: entities, connections, events, tags)   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Schema Definition (Convex with validation)                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Generated Types (TypeScript strict mode)                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Provider Services (Effect.ts with dependency injection)     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Compiled TypeScript (Production code with tests)            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Deployed Feature (Live on ONE platform)                     │
└─────────────────────────────────────────────────────────────┘
```

### Why This Architecture Works

**Ontology-First Design:**
- Every feature maps to 4 tables (entities, connections, events, tags)
- Simple test: "If you can't map it to these 4 tables, rethink it"
- AI agents can't generate invalid data models

**DSL Validation:**
- Plain English → Technical DSL → TypeScript
- Validates against ontology before compilation
- Generates type-safe code automatically
- Non-technical users can write features

**Schema Enforcement:**
- Convex schema validates all database operations
- Type-safe queries with full autocompletion
- Indexed for performance (< 100ms queries)
- Vector search for semantic operations

**Effect.ts Service Layer:**
- Typed error channels (no silent failures)
- Automatic dependency injection
- Testable with mocked services
- Composable business logic

---

## Ontology: The 4-Table Universe

**Purpose**: Complete data model for AI agents to understand how EVERYTHING in ONE platform is structured.

### Core Concept

Every single thing in ONE platform exists in one of these 4 tables:

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

### Entity Types

```typescript
type EntityType =
  // CORE
  | "creator"              // Human creator
  | "ai_clone"             // Digital twin of creator
  | "audience_member"      // Fan/user

  // BUSINESS AGENTS (10 types)
  | "strategy_agent"       // Vision, planning, OKRs
  | "research_agent"       // Market, trends, competitors
  | "marketing_agent"      // Content strategy, SEO, distribution
  | "sales_agent"          // Funnels, conversion, follow-up
  | "service_agent"        // Support, onboarding, success
  | "design_agent"         // Brand, UI/UX, assets
  | "engineering_agent"    // Tech, integration, automation
  | "finance_agent"        // Revenue, costs, forecasting
  | "legal_agent"          // Compliance, contracts, IP
  | "intelligence_agent"   // Analytics, insights, predictions

  // CONTENT
  | "blog_post"            // Written content
  | "video"                // Video content
  | "podcast"              // Audio content
  | "social_post"          // Social media post
  | "email"                // Email content
  | "course"               // Educational course
  | "lesson"               // Individual lesson

  // PRODUCTS
  | "digital_product"      // Templates, tools, assets
  | "membership"           // Tiered membership
  | "consultation"         // 1-on-1 session
  | "nft"                  // NFT collectible

  // COMMUNITY
  | "community"            // Community space
  | "conversation"         // Thread/discussion
  | "message"              // Individual message

  // TOKEN
  | "token"                // Actual token instance
  | "token_contract"       // Smart contract

  // KNOWLEDGE
  | "knowledge_item"       // Piece of creator knowledge
  | "embedding"            // Vector embedding
```

### Connection Types (Optimized 24 Types)

**Design Philosophy**: Use metadata fields instead of proliferating connection types.

```typescript
type ConnectionType =
  // OWNERSHIP (3 types)
  | "owns"                 // Creator owns token/content (metadata.revenueShare)
  | "created_by"           // Content created by creator
  | "authored"             // User authored content (vs. generated_by for AI)

  // AI RELATIONSHIPS (3 types)
  | "clone_of"             // AI is clone of creator
  | "trained_on"           // Clone trained on content (metadata.trainingDataType)
  | "powers"               // Agent powers clone/feature (metadata.capability)

  // CONTENT RELATIONSHIPS (4 types)
  | "published_to"         // Content published to platform (metadata.visibility)
  | "part_of"              // Lesson part of course (metadata.order, metadata.section)
  | "references"           // Content references entity (metadata.referenceType)
  | "derived_from"         // Content derived from original (metadata.derivationType)

  // COMMUNITY RELATIONSHIPS (3 types)
  | "member_of"            // User member of community (metadata.role, metadata.joinedAt)
  | "following"            // User follows creator (metadata.notificationsEnabled)
  | "engaged_with"         // User engaged with content (metadata.engagementType: "liked", "commented", "shared")

  // BUSINESS RELATIONSHIPS (3 types)
  | "manages"              // Agent manages function (metadata.permissions)
  | "collaborates_with"    // Entities collaborate (metadata.collaborationType, metadata.revenueShare)
  | "assigned_to"          // Task assigned to entity (metadata.priority, metadata.deadline)

  // TRANSACTIONAL RELATIONSHIPS (4 types - consolidated from 7)
  | "transacted"           // Generic transaction (metadata.transactionType: "purchase", "subscription", "invoice")
  | "holds"                // User holds asset (metadata.assetType: "tokens", "nft", "stake", metadata.amount)
  | "enrolled_in"          // User enrolled in course (metadata.progress, metadata.startedAt)
  | "completed"            // User completed course/task (metadata.completedAt, metadata.certificateId)

  // REFERRAL/GROWTH (2 types)
  | "referred_by"          // User referred by another (metadata.referralCode, metadata.conversionStatus)
  | "converted_from"       // User converted from lead (metadata.conversionType, metadata.source)

  // MEDIA/ANALYTICS (2 types)
  | "featured_in"          // Entity featured in content (metadata.startTime, metadata.endTime)
  | "analyzed_by"          // Entity analyzed by intelligence (metadata.analysisType, metadata.confidence)
```

**Key Improvements**:
- **Before**: 30+ connection types
- **After**: 24 optimized types
- **Strategy**: Use `metadata` for variants (e.g., "transacted" with metadata.transactionType instead of "paid_for", "subscribed_to", "invoiced_to")
- **Benefits**: Simpler schema, more flexible queries, easier to extend

### Event Types (Optimized 38 Types)

**Design Philosophy**: Consolidate status variants into metadata fields.

```typescript
type EventType =
  // ENTITY LIFECYCLE (6 types)
  | "entity_created"       // Any entity created (metadata.entityType)
  | "entity_updated"       // Any entity updated (metadata.fields)
  | "entity_deleted"       // Soft delete (metadata.reason)
  | "entity_restored"      // Undelete (metadata.restoredBy)
  | "entity_published"     // Draft → Published (metadata.visibility)
  | "entity_archived"      // Active → Archived (metadata.archiveReason)

  // AI/CLONE EVENTS (4 types)
  | "clone_interaction"    // Chat/interaction with clone (metadata.messageCount, metadata.duration)
  | "clone_trained"        // Training completed (metadata.dataPoints, metadata.model)
  | "ai_generated"         // AI generated content (metadata.contentType, metadata.prompt)
  | "voice_cloned"         // Voice clone created (metadata.provider, metadata.voiceId)

  // AGENT EVENTS (3 types - consolidated from 4)
  | "agent_executed"       // Agent ran (metadata.status: "success", "failed", "partial")
  | "workflow_started"     // Workflow initiated (metadata.workflowType, metadata.steps)
  | "workflow_completed"   // Workflow finished (metadata.duration, metadata.status)

  // CONTENT EVENTS (5 types)
  | "content_viewed"       // Content viewed (metadata.duration, metadata.completionRate)
  | "content_interacted"   // User interacted (metadata.interactionType: "liked", "shared", "commented")
  | "content_downloaded"   // Content downloaded (metadata.format)
  | "content_embedded"     // Embedding generated (metadata.model, metadata.dimensions)
  | "content_moderated"    // Moderation action (metadata.action, metadata.reason)

  // LEARNING EVENTS (4 types - consolidated from 5)
  | "course_enrolled"      // User enrolled in course
  | "progress_updated"     // Progress on course/lesson (metadata.entityId, metadata.progress)
  | "assessment_completed" // Test/quiz finished (metadata.score, metadata.passed)
  | "certificate_earned"   // Certificate issued (metadata.certificateId, metadata.skills)

  // TOKEN/ASSET EVENTS (5 types - consolidated from 7)
  | "token_deployed"       // Contract deployed (metadata.contractAddress, metadata.chain)
  | "token_transacted"     // Token transaction (metadata.action: "purchased", "earned", "burned", metadata.amount)
  | "token_staked"         // Staking action (metadata.action: "staked", "unstaked", metadata.amount, metadata.duration)
  | "governance_action"    // Governance event (metadata.actionType: "vote", "proposal", "execution")
  | "nft_minted"           // NFT minted (metadata.tokenId, metadata.metadata)

  // PAYMENT EVENTS (3 types - consolidated from 5)
  | "payment_processed"    // Payment event (metadata.status: "initiated", "completed", "failed", "refunded")
  | "subscription_changed" // Subscription event (metadata.action: "started", "renewed", "cancelled", "upgraded")
  | "invoice_generated"    // Invoice created/sent (metadata.amount, metadata.dueDate, metadata.status)

  // GROWTH/ENGAGEMENT (5 types)
  | "referral_created"     // Referral made (metadata.referralCode, metadata.channel)
  | "referral_converted"   // Referral converted (metadata.conversionValue)
  | "achievement_unlocked" // Achievement earned (metadata.achievementId, metadata.points)
  | "level_changed"        // User level changed (metadata.oldLevel, metadata.newLevel, metadata.reason)
  | "viral_shared"         // Viral share occurred (metadata.platform, metadata.reach)

  // ANALYTICS/INTELLIGENCE (3 types)
  | "metric_calculated"    // Metric computed (metadata.metricType, metadata.value)
  | "insight_generated"    // AI insight created (metadata.insightType, metadata.confidence)
  | "report_generated"     // Report created (metadata.reportType, metadata.period)
```

**Key Improvements**:
- **Before**: 50+ event types with status variants
- **After**: 38 consolidated types
- **Strategy**: Use `metadata.status` or `metadata.action` for state variants
- **Example**: "payment_initiated", "payment_completed", "payment_failed" → "payment_processed" with metadata.status
- **Benefits**: Easier analytics queries, consistent event structure, simpler event handlers

**For complete ontology details, see:** `Ontology.md`

---

## ONE DSL: Domain-Specific Language

**Purpose**: Declarative language for defining features that compiles to Effect.ts and TypeScript.

### DSL Architecture Stack

```
Plain English (CEO writes)
    ↓ [Parser]
Technical DSL (validated against ontology)
    ↓ [Compiler]
TypeScript with Effect.ts (production code)
    ↓ [Generated automatically]
Tests + Documentation
    ↓
Deployed Feature
```

### Plain English DSL

**For creators and non-technical users** - Natural language that compiles to working code.

**Example:**
```
FEATURE: Let fans chat with my AI clone

WHEN a fan sends a message
CHECK they own tokens
GET my AI personality
SEND message to AI with my personality
SAVE the conversation
GIVE fan 10 tokens as reward
SHOW AI response to fan
```

**Core Commands:**
- `CHECK` - Validate something
- `CREATE` - Make something new
- `CONNECT` - Link two things
- `RECORD` - Log that something happened
- `CALL` - Use external service
- `GET` - Retrieve something
- `IF/THEN/ELSE` - Conditional logic
- `DO TOGETHER` - Atomic operations
- `WAIT` - Pause execution
- `FOR EACH` - Loop through items
- `GIVE` - Return result

### Technical DSL

**For AI agents and developers** - JSON-like syntax that validates against ontology.

**Example:**
```typescript
const createAICloneDSL = {
  feature: "CreateAIClone",
  input: {
    creatorId: "Id<entities>",
    videoUrls: "string[]",
  },
  output: {
    cloneId: "Id<entities>",
    voiceId: "string",
  },
  flow: [
    {
      validate: {
        creatorId: { exists: true, type: "creator" },
        videoUrls: { minLength: 3 },
      },
      onError: { return: { error: "InsufficientContent" } },
    },
    {
      service: {
        provider: "elevenlabs",
        method: "cloneVoice",
        params: { samples: "$audioSamples" },
        output: "voiceId",
        retry: { times: 3, delay: "5s" },
      },
    },
    {
      entity: {
        type: "ai_clone",
        name: "$creator.name + ' AI Clone'",
        properties: {
          voiceId: "$voiceId",
          systemPrompt: "$personality.systemPrompt",
          temperature: 0.7,
        },
        status: "active",
      },
      output: "cloneId",
    },
    {
      connect: {
        from: "$input.creatorId",
        to: "$cloneId",
        type: "owns",
      },
    },
    {
      event: {
        entity: "$cloneId",
        type: "clone_created",
        actor: "$input.creatorId",
      },
    },
    {
      return: {
        cloneId: "$cloneId",
        voiceId: "$voiceId",
      },
    },
  ],
};
```

**DSL Primitives:**
- `entity` - Create entity in ontology
- `connect` - Create relationship between entities
- `event` - Log an event
- `query` - Retrieve entities/connections/events
- `flow` - Multi-step workflow with branching
- `service` - Call external provider (OpenAI, ElevenLabs, Stripe, etc.)
- `validate` - Check conditions
- `atomic` - Group operations with rollback support

### DSL Validation & Compilation

**Validator** - Ensures DSL uses only valid ontology types:
```typescript
class ONEValidator {
  validate(dsl: any): { valid: boolean; errors: string[] } {
    // Validates all entity types exist in ontology
    // Validates all connection types exist in ontology
    // Validates all event types exist in ontology
    return { valid: true, errors: [] };
  }
}
```

**Compiler** - Generates type-safe TypeScript with Effect.ts:
```typescript
class ONECompiler {
  compile(dsl: any): string {
    // Compiles DSL to TypeScript
    // Generates Effect.ts service calls
    // Adds proper error handling
    // Creates fully typed code
    return generatedCode;
  }
}
```

**Complete DSL examples and specifications in:** `DSL.md`, `ONE DSL.md`, `ONE DSL English.md`

---

## Schema Implementation

### Current Schema (Authentication Focus)

**File**: `convex/schema.ts` (Current - Authentication focused)

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_token", ["token"])
    .index("by_userId", ["userId"]),

  passwordResets: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    used: v.boolean(),
  }).index("by_token", ["token"])
    .index("by_userId", ["userId"]),

  emailVerifications: defineTable({
    userId: v.id("users"),
    email: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    verified: v.boolean(),
  }).index("by_token", ["token"])
    .index("by_userId", ["userId"])
    .index("by_email", ["email"]),

  magicLinks: defineTable({
    email: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    used: v.boolean(),
  }).index("by_token", ["token"])
    .index("by_email", ["email"]),

  twoFactorAuth: defineTable({
    userId: v.id("users"),
    secret: v.string(),
    backupCodes: v.array(v.string()),
    enabled: v.boolean(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),
});
```

### Target Ontology-Based Schema (Plain Convex)

**Future implementation** - 4-table architecture with full ontology support:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ENTITIES TABLE - All "things"
  entities: defineTable({
    type: v.union(
      // Core
      v.literal("creator"),
      v.literal("ai_clone"),
      v.literal("audience_member"),
      // Business Agents
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
      // Content
      v.literal("blog_post"),
      v.literal("video"),
      v.literal("podcast"),
      v.literal("social_post"),
      v.literal("email"),
      v.literal("course"),
      v.literal("lesson"),
      // Products
      v.literal("digital_product"),
      v.literal("membership"),
      v.literal("consultation"),
      v.literal("nft"),
      // Community
      v.literal("community"),
      v.literal("conversation"),
      v.literal("message"),
      // Token
      v.literal("token"),
      v.literal("token_contract"),
      // Knowledge
      v.literal("knowledge_item"),
      v.literal("embedding"),
      // Platform
      v.literal("website"),
      v.literal("landing_page"),
      v.literal("template"),
      v.literal("livestream"),
      v.literal("recording"),
      v.literal("media_asset"),
      // Business
      v.literal("payment"),
      v.literal("subscription"),
      v.literal("invoice"),
      v.literal("metric"),
      v.literal("insight"),
      v.literal("prediction"),
      v.literal("report"),
      // Marketing
      v.literal("notification"),
      v.literal("email_campaign"),
      v.literal("announcement"),
      v.literal("referral"),
      v.literal("campaign"),
      v.literal("lead")
    ),
    name: v.string(),
    properties: v.any(), // Type-specific properties as JSON
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("inactive"),
        v.literal("draft"),
        v.literal("published"),
        v.literal("archived")
      )
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"])
    .index("by_type_status", ["type", "status"])
    .searchIndex("search_entities", {
      searchField: "name",
      filterFields: ["type", "status"],
    }),

  // CONNECTIONS TABLE - All relationships
  connections: defineTable({
    fromEntityId: v.id("entities"),
    toEntityId: v.id("entities"),
    relationshipType: v.union(
      // Ownership (3 types)
      v.literal("owns"),
      v.literal("created_by"),
      v.literal("authored"),
      // AI relationships (3 types)
      v.literal("clone_of"),
      v.literal("trained_on"),
      v.literal("powers"),
      // Content relationships (4 types)
      v.literal("published_to"),
      v.literal("part_of"),
      v.literal("references"),
      v.literal("derived_from"),
      // Community relationships (3 types)
      v.literal("member_of"),
      v.literal("following"),
      v.literal("engaged_with"),
      // Business relationships (3 types)
      v.literal("manages"),
      v.literal("collaborates_with"),
      v.literal("assigned_to"),
      // Transactional relationships (4 types)
      v.literal("transacted"),
      v.literal("holds"),
      v.literal("enrolled_in"),
      v.literal("completed"),
      // Referral/growth (2 types)
      v.literal("referred_by"),
      v.literal("converted_from"),
      // Media/analytics (2 types)
      v.literal("featured_in"),
      v.literal("analyzed_by")
    ),
    metadata: v.optional(v.any()),
    strength: v.optional(v.number()),
    validFrom: v.optional(v.number()),
    validTo: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_relationshipType", ["relationshipType"])
    .index("by_fromEntity", ["fromEntityId"])
    .index("by_toEntity", ["toEntityId"])
    .index("by_from_type", ["fromEntityId", "relationshipType"])
    .index("by_to_type", ["toEntityId", "relationshipType"])
    .index("by_bidirectional", ["fromEntityId", "toEntityId"])
    .index("by_type_from_to", ["relationshipType", "fromEntityId", "toEntityId"]),

  // EVENTS TABLE - All actions
  events: defineTable({
    entityId: v.id("entities"),
    eventType: v.union(
      // Entity lifecycle (6 types)
      v.literal("entity_created"),
      v.literal("entity_updated"),
      v.literal("entity_deleted"),
      v.literal("entity_restored"),
      v.literal("entity_published"),
      v.literal("entity_archived"),
      // AI/Clone events (4 types)
      v.literal("clone_interaction"),
      v.literal("clone_trained"),
      v.literal("ai_generated"),
      v.literal("voice_cloned"),
      // Agent events (3 types)
      v.literal("agent_executed"),
      v.literal("workflow_started"),
      v.literal("workflow_completed"),
      // Content events (5 types)
      v.literal("content_viewed"),
      v.literal("content_interacted"),
      v.literal("content_downloaded"),
      v.literal("content_embedded"),
      v.literal("content_moderated"),
      // Learning events (4 types)
      v.literal("course_enrolled"),
      v.literal("progress_updated"),
      v.literal("assessment_completed"),
      v.literal("certificate_earned"),
      // Token/asset events (5 types)
      v.literal("token_deployed"),
      v.literal("token_transacted"),
      v.literal("token_staked"),
      v.literal("governance_action"),
      v.literal("nft_minted"),
      // Payment events (3 types)
      v.literal("payment_processed"),
      v.literal("subscription_changed"),
      v.literal("invoice_generated"),
      // Growth/engagement (5 types)
      v.literal("referral_created"),
      v.literal("referral_converted"),
      v.literal("achievement_unlocked"),
      v.literal("level_changed"),
      v.literal("viral_shared"),
      // Analytics/intelligence (3 types)
      v.literal("metric_calculated"),
      v.literal("insight_generated"),
      v.literal("report_generated")
    ),
    timestamp: v.number(),
    metadata: v.optional(v.any()),
    actorType: v.optional(
      v.union(
        v.literal("user"),
        v.literal("ai_agent"),
        v.literal("system"),
        v.literal("api")
      )
    ),
    actorId: v.optional(v.id("entities")),
    source: v.optional(v.string()),
    sessionId: v.optional(v.string()),
  })
    .index("by_entity", ["entityId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_eventType", ["eventType"])
    .index("by_entity_type", ["entityId", "eventType"])
    .index("by_entity_type_time", ["entityId", "eventType", "timestamp"])
    .index("by_type_time", ["eventType", "timestamp"])
    .index("by_session", ["sessionId", "timestamp"])
    .index("by_actor", ["actorId", "timestamp"]),

  // TAGS TABLE - All categories
  tags: defineTable({
    name: v.string(),
    category: v.optional(
      v.union(
        v.literal("skill"),
        v.literal("industry"),
        v.literal("topic"),
        v.literal("format"),
        v.literal("goal"),
        v.literal("audience"),
        v.literal("technology"),
        v.literal("status")
      )
    ),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    usageCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_category", ["category"])
    .index("by_usageCount", ["usageCount"]),

  // ENTITY-TAG JUNCTION TABLE
  entityTags: defineTable({
    entityId: v.id("entities"),
    tagId: v.id("tags"),
    createdAt: v.number(),
  })
    .index("by_entity", ["entityId"])
    .index("by_tag", ["tagId"])
    .index("by_entity_tag", ["entityId", "tagId"]),

  // EMBEDDINGS TABLE - Vector search
  embeddings: defineTable({
    entityId: v.id("entities"),
    embedding: v.array(v.float64()),
    model: v.string(),
    createdAt: v.number(),
  })
    .index("by_entity", ["entityId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["entityId", "model"],
    }),
});
```

**Migration Strategy**: Batched processing with dual-write pattern during transition period.

**Success Criteria**: ✅ Schema deploys without errors, ✅ All entity types creatable, ✅ Relationship queries work

### Metadata-Based Query Patterns

**Purpose**: Show how to query consolidated types using metadata filters instead of proliferating specific types.

#### Example 1: Query Payments by Status

```typescript
// OLD WAY: Multiple event types
// query("events").filter(q =>
//   q.or(
//     q.eq(q.field("eventType"), "payment_initiated"),
//     q.eq(q.field("eventType"), "payment_completed"),
//     q.eq(q.field("eventType"), "payment_failed")
//   )
// )

// NEW WAY: Single event type with metadata filter
export const getPaymentsByStatus = query({
  args: { status: v.union(v.literal("initiated"), v.literal("completed"), v.literal("failed"), v.literal("refunded")) },
  handler: async (ctx, args) => {
    const payments = await ctx.db
      .query("events")
      .withIndex("by_eventType", (q) => q.eq("eventType", "payment_processed"))
      .filter((q) => q.eq(q.field("metadata.status"), args.status))
      .order("desc")
      .take(100);

    return payments;
  },
});
```

#### Example 2: Query Connections by Transaction Type

```typescript
// OLD WAY: Separate connection types for each transaction
// "paid_for", "subscribed_to", "invoiced_to"

// NEW WAY: Single "transacted" type with metadata
export const getTransactionsByType = query({
  args: {
    userId: v.id("entities"),
    transactionType: v.union(v.literal("purchase"), v.literal("subscription"), v.literal("invoice"))
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("connections")
      .withIndex("by_from_type", (q) =>
        q.eq("fromEntityId", args.userId).eq("relationshipType", "transacted")
      )
      .filter((q) => q.eq(q.field("metadata.transactionType"), args.transactionType))
      .collect();

    return transactions;
  },
});
```

#### Example 3: Query User Engagement by Interaction Type

```typescript
// OLD WAY: Multiple connection types
// "content_liked", "content_shared", "content_commented"

// NEW WAY: Single "engaged_with" type with metadata
export const getUserEngagement = query({
  args: {
    contentId: v.id("entities"),
    interactionType: v.optional(v.union(v.literal("liked"), v.literal("shared"), v.literal("commented")))
  },
  handler: async (ctx, args) => {
    let engagements = ctx.db
      .query("connections")
      .withIndex("by_to_type", (q) =>
        q.eq("toEntityId", args.contentId).eq("relationshipType", "engaged_with")
      );

    // Filter by interaction type if specified
    if (args.interactionType) {
      engagements = engagements.filter((q) =>
        q.eq(q.field("metadata.engagementType"), args.interactionType)
      );
    }

    return await engagements.collect();
  },
});
```

#### Example 4: Query Agent Executions by Status

```typescript
// OLD WAY: Multiple event types
// "agent_executed", "agent_completed", "agent_failed"

// NEW WAY: Single event type with status in metadata
export const getAgentExecutions = query({
  args: {
    agentId: v.id("entities"),
    status: v.optional(v.union(v.literal("success"), v.literal("failed"), v.literal("partial")))
  },
  handler: async (ctx, args) => {
    let executions = ctx.db
      .query("events")
      .withIndex("by_entity_type", (q) =>
        q.eq("entityId", args.agentId).eq("eventType", "agent_executed")
      );

    // Filter by status if specified
    if (args.status) {
      executions = executions.filter((q) =>
        q.eq(q.field("metadata.status"), args.status)
      );
    }

    return await executions.order("desc").take(50);
  },
});
```

#### Example 5: Analytics Query Across Consolidated Types

```typescript
// Query all payment statuses for analytics
export const getPaymentAnalytics = query({
  args: { startDate: v.number(), endDate: v.number() },
  handler: async (ctx, args) => {
    const payments = await ctx.db
      .query("events")
      .withIndex("by_type_time", (q) =>
        q.eq("eventType", "payment_processed")
         .gte("timestamp", args.startDate)
         .lte("timestamp", args.endDate)
      )
      .collect();

    // Aggregate by status
    const analytics = {
      initiated: 0,
      completed: 0,
      failed: 0,
      refunded: 0,
      totalAmount: 0,
    };

    payments.forEach((payment) => {
      const status = payment.metadata?.status || "unknown";
      if (status in analytics) {
        analytics[status]++;
      }
      if (status === "completed") {
        analytics.totalAmount += payment.metadata?.amount || 0;
      }
    });

    return analytics;
  },
});
```

**Benefits of Metadata-Based Queries**:
- **Simpler schema**: 25 connection types vs. 30+, 35 event types vs. 50+
- **Easier analytics**: Single event type aggregation vs. multiple OR conditions
- **More flexible**: Add new statuses without schema migrations
- **Better performance**: Index on single eventType, filter on metadata
- **Clearer intent**: `metadata.status` explicitly shows state variants

---

## Quick Reference Guide

### How to Build a Feature (Step-by-Step)

**1. Map to Ontology**
- What **entities** are involved? (creator, ai_clone, token, etc.)
- What **connections** link them? (owns, follows, enrolled_in, etc.)
- What **events** need logging? (clone_created, tokens_purchased, etc.)
- What **tags** categorize them? (industry:fitness, skill:video, etc.)

**2. Write in Plain English DSL**
```
FEATURE: [What this does]

INPUT:
  - [what you need]

OUTPUT:
  - [what you get back]

FLOW:
  CHECK [validations]
  CALL [external services]
  CREATE [entities]
  CONNECT [relationships]
  RECORD [events]
  GIVE [results]
```

**3. Validate Against Ontology**
```typescript
const validator = new ONEValidator(ontology);
const validation = validator.validate(myFeatureDSL);
if (!validation.valid) {
  console.error(validation.errors);
}
```

**4. Compile to TypeScript**
```typescript
const compiler = new ONECompiler();
const code = compiler.compile(myFeatureDSL);
// Generates type-safe Effect.ts code
```

**5. Deploy**
```bash
# Code is automatically tested and deployed
```

### Common Patterns

**Pattern: Create Entity with Ownership**
```typescript
// DSL
{
  entity: { type: "ai_clone", name: "My Clone", properties: {...} },
  output: "cloneId"
}
{
  connect: { from: "$creatorId", to: "$cloneId", type: "owns" }
}
{
  event: { entity: "$cloneId", type: "clone_created", actor: "$creatorId" }
}
```

**Pattern: Token Purchase with Rollback**
```typescript
// DSL
{
  atomic: [
    { service: { provider: "stripe", method: "charge", ... } },
    { service: { provider: "blockchain", method: "mint", ... } }
  ],
  onError: {
    rollback: [
      { service: { provider: "stripe", method: "refund", ... } },
      { service: { provider: "blockchain", method: "burn", ... } }
    ]
  }
}
```

**Pattern: Query with Relationships**
```typescript
// Get creator's content
{
  query: {
    from: "connections",
    where: [
      { field: "fromEntityId", operator: "eq", value: "$creatorId" },
      { field: "relationshipType", operator: "eq", value: "authored" }
    ]
  },
  output: "contentConnections"
}
```

### Validation Rules

**Entity Validation:**
- ✅ Type must be valid EntityType from ontology
- ✅ Name cannot be empty
- ✅ Properties structure must match type
- ✅ Status must be valid (active, inactive, draft, published, archived)

**Connection Validation:**
- ✅ fromEntityId and toEntityId must exist
- ✅ relationshipType must be valid ConnectionType
- ✅ Cannot connect entity to itself (usually)
- ✅ Relationship must make semantic sense

**Event Validation:**
- ✅ entityId must exist
- ✅ eventType must be valid EventType
- ✅ timestamp required
- ✅ actorId must exist if provided

**Tag Validation:**
- ✅ name must be unique
- ✅ category must be valid TagCategory
- ✅ usageCount must be >= 0

### Performance Guidelines

**Indexes:**
- Use indexes for all filter fields
- Compound indexes for multi-field queries
- Vector indexes for semantic search

**Query Optimization:**
- Always use indexes for filters
- Limit results with `.take(n)`
- Paginate large result sets
- Prefer streaming over `.collect()` for large datasets

**Caching:**
- Cache frequently accessed entities
- Invalidate cache on entity updates
- Use stale-while-revalidate pattern

### Reference Files

- **Ontology Spec**: `Ontology.md` - Complete 4-table data model
- **Technical DSL**: `DSL.md`, `ONE DSL.md` - JSON-like syntax and compiler
- **Plain English DSL**: `ONE DSL English.md` - Natural language syntax
- **Schema**: `convex/schema.ts` - Current and target schemas
- **Examples**: This file - Real-world implementation patterns

---

### Week 2: Payment Infrastructure

**Stripe Connect Integration - Direct Revenue Enabler**

#### Implementation: Token Purchase with Revenue Splits

**File**: `convex/payments/tokenPurchase.ts`

```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

// Query to get token ownership for revenue splits
export const getTokenOwnership = query({
  args: { tokenId: v.id("entities") },
  handler: async (ctx, args) => {
    // Get token entity
    const token = await ctx.db.get(args.tokenId);
    if (!token || token.type !== "token") {
      throw new Error("Token not found");
    }

    // Get ownership connections using plain Convex query with index
    const ownerships = await ctx.db
      .query("connections")
      .withIndex("by_to_type", (q) =>
        q.eq("toEntityId", args.tokenId).eq("relationshipType", "owns")
      )
      .collect();

    // Return owners with revenue split metadata
    return Promise.all(
      ownerships.map(async (conn) => {
        const owner = await ctx.db.get(conn.fromEntityId);
        return {
          ownerId: conn.fromEntityId,
          ownerName: owner?.name,
          revenueShare: conn.metadata?.revenueShare || 0,
          stripeAccountId: owner?.properties?.stripeAccountId,
        };
      })
    );
  },
});

// Mutation to process token purchase
export const purchaseTokens = mutation({
  args: {
    userId: v.id("entities"),
    tokenId: v.id("entities"),
    amount: v.number(),
    usdAmount: v.number(),
  },
  handler: async (ctx, args) => {
    // Validate entities exist
    const user = await ctx.db.get(args.userId);
    const token = await ctx.db.get(args.tokenId);

    if (!user || user.type !== "audience_member") {
      throw new Error("User not found");
    }
    if (!token || token.type !== "token") {
      throw new Error("Token not found");
    }

    // Schedule payment processing (will be done in action)
    await ctx.scheduler.runAfter(0, internal.payments.processTokenPayment, {
      userId: args.userId,
      tokenId: args.tokenId,
      amount: args.amount,
      usdAmount: args.usdAmount,
    });

    return { success: true, message: "Payment processing initiated" };
  },
});
```

**File**: `convex/payments/processPayment.ts` (Action)

```typescript
"use node";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const processTokenPayment = internalAction({
  args: {
    userId: v.id("entities"),
    tokenId: v.id("entities"),
    amount: v.number(),
    usdAmount: v.number(),
  },
  handler: async (ctx, args) => {
    // Get ownership for revenue splits
    const ownership = await ctx.runQuery(internal.payments.getTokenOwnership, {
      tokenId: args.tokenId,
    });

    const platformFee = Math.floor(args.usdAmount * 0.15 * 100); // 15% platform fee

    // Create Stripe checkout with revenue splits
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: args.usdAmount * 100,
            product_data: { name: `${args.amount} Tokens` },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: ownership[0].stripeAccountId, // Primary owner gets payment
        },
      },
      metadata: {
        userId: args.userId,
        tokenId: args.tokenId,
        amount: args.amount.toString(),
      },
    });

    // Record payment event with metadata status
    await ctx.runMutation(internal.events.create, {
      entityId: args.tokenId,
      eventType: "payment_processed",
      actorType: "user",
      actorId: args.userId,
      metadata: {
        status: "initiated",
        paymentType: "token_purchase",
        amount: args.amount,
        usdAmount: args.usdAmount,
        sessionId: session.id,
      },
    });

    return { sessionId: session.id, url: session.url };
  },
});
```

**Seller Onboarding**: 2-minute Stripe Express flow with automatic account creation.

**Success Criteria**: ✅ Transactions process correctly, ✅ Revenue splits accurate, ✅ Webhooks handled

---

## Phase 2: Content & Product Economy (Weeks 3-4)

### Week 3: Content Creation & Discovery

**Universal Content Creator - Multiple types following ontology (blog_post, video, podcast, social_post, course, digital_product)**

#### Content Creator Implementation

**File**: `convex/content/create.ts`

```typescript
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createContent = mutation({
  args: {
    creatorId: v.id("entities"),
    type: v.union(
      v.literal("blog_post"),
      v.literal("video"),
      v.literal("podcast"),
      v.literal("social_post"),
      v.literal("course"),
      v.literal("digital_product")
    ),
    name: v.string(),
    properties: v.any(), // Type-specific properties
    tags: v.optional(v.array(v.string())),
    collaborators: v.optional(
      v.array(
        v.object({
          entityId: v.id("entities"),
          revenueShare: v.number(), // 0.0 to 1.0
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    // Validate creator exists
    const creator = await ctx.db.get(args.creatorId);
    if (!creator || creator.type !== "creator") {
      throw new Error("Creator not found");
    }

    // Create content entity
    const contentId = await ctx.db.insert("entities", {
      type: args.type,
      name: args.name,
      properties: args.properties,
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create ownership connection (creator owns content)
    await ctx.db.insert("connections", {
      fromEntityId: args.creatorId,
      toEntityId: contentId,
      relationshipType: "owns",
      metadata: { revenueShare: 1.0 }, // Creator gets 100% initially
      createdAt: Date.now(),
    });

    // Create authored connection
    await ctx.db.insert("connections", {
      fromEntityId: args.creatorId,
      toEntityId: contentId,
      relationshipType: "authored",
      createdAt: Date.now(),
    });

    // Add collaborators with revenue splits
    if (args.collaborators) {
      for (const collab of args.collaborators) {
        await ctx.db.insert("connections", {
          fromEntityId: collab.entityId,
          toEntityId: contentId,
          relationshipType: "owns",
          metadata: { revenueShare: collab.revenueShare },
          createdAt: Date.now(),
        });
      }
    }

    // Add tags
    if (args.tags) {
      for (const tagName of args.tags) {
        // Get or create tag
        let tag = await ctx.db
          .query("tags")
          .withIndex("by_name", (q) => q.eq("name", tagName))
          .unique();

        if (!tag) {
          const tagId = await ctx.db.insert("tags", {
            name: tagName,
            category: "topic",
            usageCount: 0,
            createdAt: Date.now(),
          });
          tag = await ctx.db.get(tagId);
        }

        // Create entity-tag association
        await ctx.db.insert("entityTags", {
          entityId: contentId,
          tagId: tag!._id,
          createdAt: Date.now(),
        });

        // Increment tag usage count
        await ctx.db.patch(tag!._id, {
          usageCount: tag!.usageCount + 1,
        });
      }
    }

    // Log entity creation event with content-specific metadata
    await ctx.db.insert("events", {
      entityId: contentId,
      eventType: "entity_created",
      timestamp: Date.now(),
      actorType: "user",
      actorId: args.creatorId,
      metadata: {
        entityType: args.type,
        collaboratorCount: args.collaborators?.length || 0,
        tagCount: args.tags?.length || 0,
      },
    });

    return { contentId, success: true };
  },
});
```

**Frontend**: Multi-step wizard with file upload, collaborator management, tag selection, and license controls

---

### Week 4: Semantic Search Implementation

**Hybrid Search: Vector Similarity + Keyword Matching using ontology entities table**

#### Vector Embeddings

**File**: `convex/embeddings/generate.ts`

```typescript
"use node";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateEntityEmbedding = internalAction({
  args: { entityId: v.id("entities") },
  handler: async (ctx, args) => {
    // Get entity
    const entity = await ctx.runQuery(internal.entities.get, {
      id: args.entityId,
    });

    if (!entity) {
      throw new Error("Entity not found");
    }

    // Create searchable text from entity
    const text = `${entity.name}\n${entity.properties?.description || ""}\n${
      entity.properties?.content || ""
    }`;

    // Generate embedding
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      dimensions: 1536,
    });

    // Save embedding
    await ctx.runMutation(internal.embeddings.save, {
      entityId: args.entityId,
      embedding: response.data[0].embedding,
      model: "text-embedding-3-small",
    });

    return { success: true };
  },
});
```

**File**: `convex/embeddings/save.ts`

```typescript
import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const save = internalMutation({
  args: {
    entityId: v.id("entities"),
    embedding: v.array(v.float64()),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if embedding exists
    const existing = await ctx.db
      .query("embeddings")
      .withIndex("by_entity", (q) => q.eq("entityId", args.entityId))
      .unique();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        embedding: args.embedding,
        model: args.model,
        createdAt: Date.now(),
      });
    } else {
      // Create new
      await ctx.db.insert("embeddings", {
        entityId: args.entityId,
        embedding: args.embedding,
        model: args.model,
        createdAt: Date.now(),
      });
    }

    return { success: true };
  },
});
```

#### Semantic Search Query

**File**: `convex/search/semantic.ts`

```typescript
"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const semanticSearch = action({
  args: {
    query: v.string(),
    entityTypes: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Generate query embedding
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: args.query,
      dimensions: 1536,
    });

    const queryEmbedding = response.data[0].embedding;

    // Vector search on embeddings table
    const results = await ctx.vectorSearch("embeddings", "by_embedding", {
      vector: queryEmbedding,
      limit: args.limit || 20,
    });

    // Hydrate entities and filter by type if specified
    const entities = await Promise.all(
      results.map(async (r) => {
        const entity = await ctx.runQuery(internal.entities.get, {
          id: r._id,
        });
        return { entity, score: r._score };
      })
    );

    // Filter by entity type if specified
    const filtered = args.entityTypes
      ? entities.filter((e) => args.entityTypes!.includes(e.entity?.type || ""))
      : entities;

    return filtered.map((e) => e.entity);
  },
});

// Hybrid search combining vector similarity and keyword matching
export const hybridSearch = action({
  args: {
    query: v.string(),
    entityTypes: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Run semantic search
    const semanticResults = await ctx.runAction(internal.search.semanticSearch, {
      query: args.query,
      entityTypes: args.entityTypes,
      limit: args.limit,
    });

    // Run keyword search using search index
    const keywordResults = await ctx.runQuery(internal.search.keywordSearch, {
      query: args.query,
      entityTypes: args.entityTypes,
      limit: args.limit,
    });

    // Combine and deduplicate results
    const combined = new Map();
    semanticResults.forEach((entity) => combined.set(entity._id, entity));
    keywordResults.forEach((entity) => combined.set(entity._id, entity));

    return Array.from(combined.values());
  },
});
```

**Search UI**: Real-time results with filters (entity type, tags, status), debounced input, instant previews.

**Success Criteria**: ✅ Semantic search returns relevant results, ✅ Sub-300ms response time, ✅ Works for all entity types

---

## Phase 3: Viral Growth & ELEVATE (Weeks 5-6)

### Week 5: ELEVATE Journey System

**9-Step Candy Crush-Style Progress System**

#### Journey Steps (ELEVATE Framework)

1. **Hook** - Capture attention with free AI business analysis
2. **Gift** - Provide immediate value (insights report)
3. **Identify** - Payment gate ($100) - qualify serious users
4. **Engage** - Interactive workshops and tools
5. **Sell** - Core product/service delivery
6. **Nurture** - Ongoing support and resources
7. **Upsell** - Premium features and services
8. **Understand** - Analytics and optimization
9. **Share** - Referral rewards and viral loop

#### Workflow Implementation

**File**: `convex/elevate/journey.ts`

```typescript
import { WorkflowManager } from "@convex-dev/workflow";

const workflow = new WorkflowManager(components.workflow);

export const elevateJourney = workflow.define({
  defaultRetryBehavior: { maxAttempts: 3, initialBackoffMs: 1000 }
}, async (ctx, { userId, journeyId }) => {
  
  // Step 1: Hook - Generate AI analysis
  await ctx.step("hook", async () => {
    const analysis = await ctx.runAction(internal.ai.generateBusinessAnalysis, {
      userId,
    });
    await ctx.runMutation(internal.elevate.saveStep, {
      userId,
      stepId: "hook",
      status: "completed",
      output: analysis,
    });
  });
  
  // Wait for user to review (24 hours)
  await ctx.wait(24 * 60 * 60 * 1000);
  
  // Step 2: Gift - Deliver insights
  await ctx.step("gift", async () => {
    await ctx.runMutation(internal.notifications.sendInsightsReport, { userId });
  });
  
  // Step 3: Identify - Payment gate
  await ctx.step("identify", async () => {
    const paid = await waitForPayment(ctx, userId, 100);
    if (!paid) {
      throw new Error("Payment not completed");
    }
  });
  
  // Continue remaining steps...
  
  return { completed: true };
});
```

#### Visual Journey UI

**File**: `src/components/features/elevate/JourneyMap.tsx`

**Features**:

- SVG path visualization (Candy Crush style)
- Step nodes with lock/unlock states
- Star ratings (1-3 per step)
- Progress percentage
- Achievement badges
- Animated transitions

**Pattern**:

```typescript
<svg viewBox="0 0 800 600">
  <path d="M 100,300 Q 200,100 400,300 T 700,300" />
  {steps.map((step, i) => (
    <g key={step.id}>
      <circle 
        cx={positions[i].x} 
        cy={positions[i].y}
        r="30"
        className={step.status === 'completed' ? 'fill-green' : 'fill-gray'}
      />
      <text>{step.name}</text>
    </g>
  ))}
</svg>
```

**Payment Gate**: Integrated Stripe checkout modal at "Identify" step.

**Success Criteria**: ✅ All 9 steps functional, ✅ Payment gate works, ✅ Progress persists, ✅ Workflows resume after restart

---

### Week 6: Viral Invitation System

**Magic Links + Referral Tracking**

#### Magic Link Generation

**File**: `convex/invitations/magicLinks.ts`

```typescript
export const generateMagicLink = mutation({
  args: { 
    email: v.string(),
    referralCode: v.string(),
  },
  handler: async (ctx, args) => {
    const token = crypto.randomBytes(32).toString("base64url");
    
    await ctx.db.insert("events", {
      eventType: "invitation_created",
      timestamp: Date.now(),
      metadata: {
        email: args.email,
        token,
        referralCode: args.referralCode,
        expiresAt: Date.now() + (60 * 60 * 1000), // 1 hour
      },
    });
    
    return `https://one.ie/invite/${token}`;
  },
});
```

#### Auto-Registration Flow

**File**: `src/pages/invite/[token].astro`

```typescript
// Server-side validation
const { token } = Astro.params;
const invitation = await convex.query(api.invitations.verify, { token });

if (invitation.valid) {
  // Auto-register user
  const userId = await convex.mutation(api.auth.autoRegister, {
    email: invitation.email,
    referredBy: invitation.referralCode,
  });
  
  // Create session and redirect
  return Astro.redirect("/dashboard");
}
```

#### Referral Tracking

**Schema**: Track referrer → referred → conversion pipeline

**Commission Model**:

- 10% of referred user's first transaction
- Tiered bonuses (5 referrals = $50 bonus, 25 = $500)
- Lifetime tracking with attribution

**Bulk Invitations**: Queue-based processing for 100+ invitations with personalized messages.

**Success Criteria**: ✅ Magic links work reliably, ✅ Auto-registration smooth, ✅ Referral commissions accurate, ✅ K-factor > 1

---

## Phase 4: Scale & Production Readiness (Weeks 7-8)

### Week 7: AI Agent Marketplace

**10 Business Agent Types from Ontology (strategy, research, marketing, sales, service, design, engineering, finance, legal, intelligence)**

#### Agent Registry

**File**: `convex/agents/register.ts`

```typescript
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const registerAgent = mutation({
  args: {
    creatorId: v.id("entities"),
    agentType: v.union(
      v.literal("strategy_agent"),
      v.literal("research_agent"),
      v.literal("marketing_agent"),
      v.literal("sales_agent"),
      v.literal("service_agent"),
      v.literal("design_agent"),
      v.literal("engineering_agent"),
      v.literal("finance_agent"),
      v.literal("legal_agent"),
      v.literal("intelligence_agent")
    ),
    name: v.string(),
    description: v.string(),
    capabilities: v.array(v.string()),
    systemPrompt: v.string(),
    pricingModel: v.union(
      v.literal("per_request"),
      v.literal("token_based"),
      v.literal("subscription")
    ),
    basePrice: v.number(),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Validate creator exists
    const creator = await ctx.db.get(args.creatorId);
    if (!creator || creator.type !== "creator") {
      throw new Error("Creator not found");
    }

    // Create agent entity
    const agentId = await ctx.db.insert("entities", {
      type: args.agentType,
      name: args.name,
      properties: {
        description: args.description,
        capabilities: args.capabilities,
        systemPrompt: args.systemPrompt,
        model: "gpt-4-turbo",
        temperature: 0.7,
        pricingModel: args.pricingModel,
        basePrice: args.basePrice,
        totalExecutions: 0,
        successRate: 0,
        averageExecutionTime: 0,
      },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create ownership connection
    await ctx.db.insert("connections", {
      fromEntityId: args.creatorId,
      toEntityId: agentId,
      relationshipType: "owns",
      metadata: { revenueShare: 1.0 },
      createdAt: Date.now(),
    });

    // Add tags
    if (args.tags) {
      for (const tagName of args.tags) {
        let tag = await ctx.db
          .query("tags")
          .withIndex("by_name", (q) => q.eq("name", tagName))
          .unique();

        if (!tag) {
          const tagId = await ctx.db.insert("tags", {
            name: tagName,
            category: "technology",
            usageCount: 0,
            createdAt: Date.now(),
          });
          tag = await ctx.db.get(tagId);
        }

        await ctx.db.insert("entityTags", {
          entityId: agentId,
          tagId: tag!._id,
          createdAt: Date.now(),
        });

        await ctx.db.patch(tag!._id, {
          usageCount: tag!.usageCount + 1,
        });
      }
    }

    // Log entity creation event with agent-specific metadata
    await ctx.db.insert("events", {
      entityId: agentId,
      eventType: "entity_created",
      timestamp: Date.now(),
      actorType: "user",
      actorId: args.creatorId,
      metadata: {
        entityType: args.agentType,
        pricingModel: args.pricingModel,
        basePrice: args.basePrice,
        capabilities: args.capabilities,
      },
    });

    return { agentId, success: true };
  },
});
```

#### Agent Execution

**File**: `convex/agents/execute.ts`

```typescript
"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const invokeAgent = action({
  args: {
    agentId: v.id("entities"),
    userId: v.id("entities"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const startTime = Date.now();

    // Get agent configuration
    const agent = await ctx.runQuery(internal.agents.get, {
      id: args.agentId,
    });

    if (!agent || !agent.type.endsWith("_agent")) {
      throw new Error("Agent not found");
    }

    // Execute agent with OpenAI
    const response = await openai.chat.completions.create({
      model: agent.properties.model || "gpt-4-turbo",
      messages: [
        { role: "system", content: agent.properties.systemPrompt },
        { role: "user", content: args.message },
      ],
      temperature: agent.properties.temperature || 0.7,
    });

    const executionTime = Date.now() - startTime;
    const aiResponse = response.choices[0].message.content || "";

    // Track invocation (update metrics)
    await ctx.runMutation(internal.agents.trackInvocation, {
      agentId: args.agentId,
      executionTime,
      success: true,
    });

    // Log agent execution event with success status in metadata
    await ctx.runMutation(internal.events.create, {
      entityId: args.agentId,
      eventType: "agent_executed",
      actorType: "user",
      actorId: args.userId,
      metadata: {
        status: "success",
        message: args.message,
        response: aiResponse,
        executionTime,
        tokensUsed: response.usage?.total_tokens || 0,
      },
    });

    return {
      response: aiResponse,
      executionTime,
      tokensUsed: response.usage?.total_tokens || 0,
    };
  },
});
```

**File**: `convex/agents/trackInvocation.ts`

```typescript
import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const trackInvocation = internalMutation({
  args: {
    agentId: v.id("entities"),
    executionTime: v.number(),
    success: v.boolean(),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) return;

    const totalExecutions = agent.properties.totalExecutions || 0;
    const successRate = agent.properties.successRate || 0;
    const avgExecTime = agent.properties.averageExecutionTime || 0;

    // Update metrics
    const newTotalExecutions = totalExecutions + 1;
    const newSuccessRate =
      (successRate * totalExecutions + (args.success ? 1 : 0)) / newTotalExecutions;
    const newAvgExecTime =
      (avgExecTime * totalExecutions + args.executionTime) / newTotalExecutions;

    await ctx.db.patch(args.agentId, {
      properties: {
        ...agent.properties,
        totalExecutions: newTotalExecutions,
        successRate: newSuccessRate,
        averageExecutionTime: newAvgExecTime,
      },
      updatedAt: Date.now(),
    });
  },
});
```

#### Agent Marketplace UI

**File**: `src/components/features/agents/AgentMarketplace.tsx`

**Features**:

- Browse by category/capability
- Try before you buy (free tier)
- Usage-based billing
- Rating and review system
- Agent-to-agent delegation

**Success Criteria**: ✅ Agents execute reliably, ✅ Billing tracks usage accurately, ✅ UI responsive and intuitive

---

### Week 8: Analytics & Optimization

**Dashboard for Revenue, Engagement, and Performance Metrics**

#### Analytics Implementation

**File**: `convex/analytics/dashboards.ts`

```typescript
export const getRevenueMetrics = query({
  args: { timeRange: v.string() },
  handler: async (ctx, args) => {
    // Query consolidated payment events
    const payments = await ctx.db
      .query("events")
      .withIndex("by_type_time", (q) =>
        q.eq("eventType", "payment_processed")
         .gte("timestamp", getTimeRangeStart(args.timeRange))
      )
      .collect();

    // Filter to completed payments only using metadata
    const completedPayments = payments.filter(
      (p) => p.metadata?.status === "completed"
    );

    const totalRevenue = completedPayments.reduce(
      (sum, p) => sum + (p.metadata?.amount || 0),
      0
    );

    const platformFees = completedPayments.reduce(
      (sum, p) => sum + (p.metadata?.platformFee || 0),
      0
    );

    return {
      totalRevenue,
      platformFees,
      transactionCount: completedPayments.length,
      averageOrderValue: totalRevenue / completedPayments.length || 0,
      statusBreakdown: {
        initiated: payments.filter((p) => p.metadata?.status === "initiated").length,
        completed: completedPayments.length,
        failed: payments.filter((p) => p.metadata?.status === "failed").length,
        refunded: payments.filter((p) => p.metadata?.status === "refunded").length,
      },
    };
  },
});

export const getElevateAnalytics = query({
  args: {},
  handler: async (ctx) => {
    // Query progress_updated events for journey tracking
    const progressEvents = await ctx.db
      .query("events")
      .withIndex("by_eventType", (q) => q.eq("eventType", "progress_updated"))
      .filter((q) => q.eq(q.field("metadata.journeyType"), "elevate"))
      .collect();

    // Calculate step completion rates using metadata
    const stepCounts = {};
    progressEvents.forEach((event) => {
      const step = event.metadata?.stepId;
      if (step) {
        stepCounts[step] = (stepCounts[step] || 0) + 1;
      }
    });

    return {
      totalJourneys: new Set(progressEvents.map((e) => e.actorId)).size,
      stepCompletionRates: stepCounts,
      conversionRate: (stepCounts["share"] || 0) / (stepCounts["hook"] || 1),
    };
  },
});
```

#### Analytics Dashboard UI

**File**: `src/pages/analytics/index.astro`

**Charts**:

- Revenue over time (line chart)
- Transaction volume (bar chart)
- ELEVATE funnel (funnel chart)
- Top-performing blocks (table)
- User engagement heatmap
- Real-time activity feed

**Libraries**: Recharts for React components, TailwindCSS for styling.

**Success Criteria**: ✅ All metrics accurate, ✅ Real-time updates, ✅ Export functionality, ✅ Sub-second load times

---

## Effect.ts Service Layer Integration

**Production-Grade Error Handling & Dependency Injection**

### Typed Error Channels

**Purpose**: All errors are typed and explicit - no silent failures or generic error handling.

```typescript
import { Effect, Data } from "effect";

// Define typed error classes
class ValidationError extends Data.TaggedError("ValidationError")<{
  field: string;
  message: string;
}> {}

class DatabaseError extends Data.TaggedError("DatabaseError")<{
  operation: string;
  cause: unknown;
}> {}

class ExternalServiceError extends Data.TaggedError("ExternalServiceError")<{
  service: string;
  statusCode?: number;
  message: string;
}> {}

class NotFoundError extends Data.TaggedError("NotFoundError")<{
  entityType: string;
  entityId: string;
}> {}
```

### Service Layer Architecture

**File**: `convex/services/entities.ts`

```typescript
import { Effect, Layer, Context } from "effect";
import { v } from "convex/values";

// Define service interface with typed errors
class EntityService extends Context.Tag("EntityService")<
  EntityService,
  {
    create: (data: EntityCreateData) => Effect.Effect<
      string, // Success type: entity ID
      ValidationError | DatabaseError // Error types
    >;
    get: (id: string) => Effect.Effect<
      Entity,
      NotFoundError | DatabaseError
    >;
    update: (id: string, data: Partial<Entity>) => Effect.Effect<
      void,
      NotFoundError | ValidationError | DatabaseError
    >;
    search: (query: string) => Effect.Effect<
      Entity[],
      ExternalServiceError | DatabaseError
    >;
  }
>() {}

// Implementation
const EntityServiceLive = Layer.effect(
  EntityService,
  Effect.gen(function* () {
    const db = yield* DatabaseService;
    const embeddings = yield* EmbeddingService;

    return {
      create: (data: EntityCreateData) =>
        Effect.gen(function* () {
          // Validation with typed error
          if (!data.name || data.name.trim().length === 0) {
            return yield* Effect.fail(
              new ValidationError({
                field: "name",
                message: "Name is required and cannot be empty",
              })
            );
          }

          if (!data.type) {
            return yield* Effect.fail(
              new ValidationError({
                field: "type",
                message: "Entity type is required",
              })
            );
          }

          // Create entity with error handling
          const entityId = yield* Effect.tryPromise({
            try: () =>
              db.insert("entities", {
                type: data.type,
                name: data.name,
                properties: data.properties || {},
                status: data.status || "active",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              }),
            catch: (error) =>
              new DatabaseError({
                operation: "insert",
                cause: error,
              }),
          });

          // Generate embedding asynchronously (errors logged but don't fail creation)
          yield* embeddings
            .generate(entityId)
            .pipe(
              Effect.catchAll((error) =>
                Effect.logWarning(`Failed to generate embedding: ${error}`)
              )
            );

          return entityId;
        }),

      get: (id: string) =>
        Effect.gen(function* () {
          const entity = yield* Effect.tryPromise({
            try: () => db.get(id),
            catch: (error) =>
              new DatabaseError({
                operation: "get",
                cause: error,
              }),
          });

          if (!entity) {
            return yield* Effect.fail(
              new NotFoundError({
                entityType: "entity",
                entityId: id,
              })
            );
          }

          return entity;
        }),

      update: (id: string, data: Partial<Entity>) =>
        Effect.gen(function* () {
          // Check entity exists
          yield* Effect.get(id);

          // Validation
          if (data.name !== undefined && data.name.trim().length === 0) {
            return yield* Effect.fail(
              new ValidationError({
                field: "name",
                message: "Name cannot be empty",
              })
            );
          }

          // Update entity
          yield* Effect.tryPromise({
            try: () =>
              db.patch(id, {
                ...data,
                updatedAt: Date.now(),
              }),
            catch: (error) =>
              new DatabaseError({
                operation: "update",
                cause: error,
              }),
          });
        }),

      search: (query: string) =>
        Effect.gen(function* () {
          // Generate query embedding
          const embedding = yield* embeddings
            .generateQuery(query)
            .pipe(
              Effect.mapError(
                (error) =>
                  new ExternalServiceError({
                    service: "OpenAI",
                    message: `Failed to generate embedding: ${error}`,
                  })
              )
            );

          // Vector search
          const results = yield* Effect.tryPromise({
            try: () => db.vectorSearch("embeddings", { vector: embedding }),
            catch: (error) =>
              new DatabaseError({
                operation: "vectorSearch",
                cause: error,
              }),
          });

          return results;
        }),
    };
  })
);
```

### Usage in Convex Functions

**File**: `convex/entities/create.ts`

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { Effect } from "effect";
import { EntityService, ValidationError, DatabaseError } from "../services/entities";
import { MainLayer } from "../services/layers";

export const createEntity = mutation({
  args: {
    type: v.string(),
    name: v.string(),
    properties: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const program = Effect.gen(function* () {
      const service = yield* EntityService;
      return yield* service.create({
        type: args.type,
        name: args.name,
        properties: args.properties,
      });
    });

    // Run program with explicit error handling
    const result = await Effect.runPromise(
      program.pipe(
        Effect.provide(MainLayer),
        Effect.catchTags({
          ValidationError: (error) =>
            Effect.succeed({
              success: false,
              error: "validation",
              field: error.field,
              message: error.message,
            }),
          DatabaseError: (error) =>
            Effect.succeed({
              success: false,
              error: "database",
              message: "Failed to create entity",
            }),
        }),
        Effect.map((entityId) => ({
          success: true,
          entityId,
        }))
      )
    );

    return result;
  },
});
```

### Testing with Mocked Services

**File**: `convex/services/entities.test.ts`

```typescript
import { Effect, Layer } from "effect";
import { EntityService, ValidationError } from "./entities";

const MockEntityService = Layer.succeed(EntityService, {
  create: () => Effect.succeed("mock-entity-id"),
  get: () => Effect.succeed({ _id: "mock-id", name: "Mock Entity" }),
  update: () => Effect.succeed(undefined),
  search: () => Effect.succeed([]),
});

describe("EntityService", () => {
  test("creates entity successfully", async () => {
    const program = Effect.gen(function* () {
      const service = yield* EntityService;
      return yield* service.create({
        type: "creator",
        name: "Test Creator",
      });
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(MockEntityService))
    );

    expect(result).toBe("mock-entity-id");
  });

  test("validates required fields", async () => {
    const program = Effect.gen(function* () {
      const service = yield* EntityService;
      return yield* service.create({
        type: "creator",
        name: "", // Invalid
      });
    });

    const result = await Effect.runPromiseExit(
      program.pipe(Effect.provide(MockEntityService))
    );

    if (Effect.isFailure(result)) {
      expect(result.cause._tag).toBe("ValidationError");
    }
  });
});
```

**Benefits of Effect.ts Pattern**:

- **Typed error channels**: Every error is explicit in the type signature
- **No silent failures**: Impossible to ignore errors
- **Automatic dependency injection**: Services compose cleanly
- **Testable**: Mock any dependency with `Layer.succeed`
- **Composable**: Chain operations with `Effect.gen`
- **Full observability**: Built-in logging and tracing
- **Retry logic**: Built-in retry with backoff
- **Concurrent operations**: Safe parallel execution with `Effect.all`

### Advanced Pattern: Atomic Operations with Rollback

```typescript
export const createContentWithOwnership = Effect.gen(function* () {
  const entities = yield* EntityService;
  const connections = yield* ConnectionService;
  const events = yield* EventService;

  // All operations or none (atomic)
  const contentId = yield* entities.create({
    type: "blog_post",
    name: "My Post",
  });

  yield* connections.create({
    fromEntityId: creatorId,
    toEntityId: contentId,
    relationshipType: "owns",
  });

  yield* events.log({
    entityId: contentId,
    eventType: "entity_created",
    metadata: { entityType: "blog_post" },
  });

  return contentId;
}).pipe(
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      // Rollback logic here
      yield* Effect.logError(`Transaction failed: ${error}`);
      return yield* Effect.fail(error);
    })
  )
);
```

---



### Environment Setup

```bash
# Production
CONVEX_DEPLOY_KEY=prod_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
CLERK_SECRET_KEY=sk_live_xxx
OPENAI_API_KEY=sk-xxx
SITE_URL=https://one.ie

# Monitoring
AXIOM_API_KEY=xxx
SENTRY_DSN=xxx
```

---

---

## Risk Mitigation Matrix

|Risk|Likelihood|Impact|Mitigation|Owner|
|---|---|---|---|---|
|Payment failures|Medium|High|Stripe retry logic, clear error messages|Backend|
|Migration data loss|Low|Critical|Batched processing, dual-write, backups|DevOps|
|Performance degradation|Medium|High|Proper indexing, load testing, caching|Backend|
|Security breach|Low|Critical|Security audit, penetration testing, bug bounty|Security|
|Low user adoption|Medium|High|Beta testing, user interviews, onboarding optimization|Product|
|Feature creep|High|Medium|Strict prioritization, MVP focus, iterative releases|PM|
