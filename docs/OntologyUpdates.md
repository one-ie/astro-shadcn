# Ontology Updates - Protocol Integration Requirements

**Version:** 2.0.0
**Purpose:** Define required updates to ontology for A2A, ACP, X402, AP2, and CopilotKit integration
**Status:** Proposal (requires review before implementation)

---

## Current State Analysis

### Existing Schema (convex/schema.ts)

**Current Tables:**
- `users` - Basic authentication only
- `sessions` - Session management
- `passwordResets` - Password reset tokens
- `emailVerifications` - Email verification
- `magicLinks` - Magic link authentication
- `twoFactorAuth` - 2FA configuration

**Missing:**
- 4-table ontology (entities, connections, events, tags)
- Entity types (creators, agents, content, payments, etc.)
- Relationship tracking
- Event logging
- Payment records

**Assessment:** Current schema is **auth-only**. Needs complete ontology implementation.

---

## Required Updates

### Phase 1: Core Ontology Tables

#### 1.1 Entities Table

**Purpose:** Store ALL "things" in the system

```typescript
entities: defineTable({
  type: v.union(
    // CORE (migration from users table)
    v.literal("creator"),
    v.literal("audience_member"),
    v.literal("ai_clone"),

    // BUSINESS AGENTS (10 types)
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

    // CONTENT
    v.literal("blog_post"),
    v.literal("video"),
    v.literal("podcast"),
    v.literal("social_post"),
    v.literal("email"),
    v.literal("course"),
    v.literal("lesson"),

    // PRODUCTS
    v.literal("digital_product"),
    v.literal("membership"),
    v.literal("consultation"),
    v.literal("nft"),

    // COMMUNITY
    v.literal("community"),
    v.literal("conversation"),
    v.literal("message"),

    // TOKEN
    v.literal("token"),
    v.literal("token_contract"),

    // KNOWLEDGE
    v.literal("knowledge_item"),
    v.literal("embedding"),

    // PLATFORM
    v.literal("website"),
    v.literal("landing_page"),
    v.literal("template"),
    v.literal("livestream"),
    v.literal("recording"),
    v.literal("media_asset"),

    // BUSINESS
    v.literal("payment"),
    v.literal("subscription"),
    v.literal("invoice"),
    v.literal("metric"),
    v.literal("insight"),
    v.literal("prediction"),
    v.literal("report"),

    // MARKETING
    v.literal("notification"),
    v.literal("email_campaign"),
    v.literal("announcement"),
    v.literal("referral"),
    v.literal("campaign"),
    v.literal("lead"),

    // PROTOCOL-SPECIFIC (NEW)
    v.literal("intent_mandate"),      // AP2 intent mandates
    v.literal("cart_mandate"),        // AP2 cart mandates
    v.literal("payment_transaction"), // ACP/X402 transactions
    v.literal("revenue_split"),       // Multi-agent revenue sharing
    v.literal("product"),             // ACP products
    v.literal("external_agent"),      // A2A external agents
    v.literal("external_workflow"),   // N8N/Zapier workflows
    v.literal("external_connection")  // External service connections
  ),
  name: v.string(),
  properties: v.any(), // Type-specific JSON properties
  status: v.union(
    v.literal("active"),
    v.literal("inactive"),
    v.literal("draft"),
    v.literal("published"),
    v.literal("archived")
  ),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
})
  .index("by_type", ["type"])
  .index("by_status", ["status"])
  .index("by_created", ["createdAt"])
  .searchIndex("search_entities", {
    searchField: "name",
    filterFields: ["type", "status"],
  }),
```

**Migration from users table:**
```typescript
// Each user becomes a creator or audience_member entity
{
  type: "creator", // or "audience_member"
  name: user.name || user.email,
  properties: {
    email: user.email,
    emailVerified: user.emailVerified,
    // Preserve auth data in properties
  },
  status: "active",
  createdAt: user.createdAt,
  updatedAt: Date.now()
}
```

#### 1.2 Connections Table

**Purpose:** Store ALL relationships between entities

```typescript
connections: defineTable({
  fromEntityId: v.id("entities"),
  toEntityId: v.id("entities"),
  relationshipType: v.union(
    // OWNERSHIP
    v.literal("owns"),
    v.literal("created_by"),

    // AI RELATIONSHIPS
    v.literal("clone_of"),
    v.literal("trained_on"),
    v.literal("powers"),

    // CONTENT RELATIONSHIPS
    v.literal("authored"),
    v.literal("generated_by"),
    v.literal("published_to"),
    v.literal("part_of"),
    v.literal("references"),

    // COMMUNITY RELATIONSHIPS
    v.literal("member_of"),
    v.literal("following"),
    v.literal("moderates"),
    v.literal("participated_in"),

    // BUSINESS RELATIONSHIPS
    v.literal("manages"),
    v.literal("reports_to"),
    v.literal("collaborates_with"),

    // TOKEN RELATIONSHIPS
    v.literal("holds_tokens"),
    v.literal("staked_in"),
    v.literal("earned_from"),

    // PRODUCT RELATIONSHIPS
    v.literal("purchased"),
    v.literal("enrolled_in"),
    v.literal("completed"),
    v.literal("teaching"),

    // PAYMENT RELATIONSHIPS (consolidated)
    v.literal("transacted"),

    // REFERRAL RELATIONSHIPS (consolidated)
    v.literal("referred"),

    // NOTIFICATION RELATIONSHIPS (consolidated)
    v.literal("notified"),

    // MEDIA RELATIONSHIPS
    v.literal("featured_in"),
    v.literal("hosted_on"),

    // ANALYTICS RELATIONSHIPS
    v.literal("analyzed_by"),
    v.literal("optimized_by"),
    v.literal("influences"),

    // COMMUNICATION RELATIONSHIPS (NEW - protocol agnostic)
    v.literal("communicates_with"),  // Any agent communication (metadata.protocol)
    v.literal("delegated_to"),        // Task delegation (metadata.protocol)
    v.literal("assigned_to"),         // Task assignment (metadata.protocol) - MOVED from business

    // TRANSACTION RELATIONSHIPS (NEW - protocol agnostic)
    v.literal("approved"),             // Approval of anything (metadata.approvalType)
    v.literal("rejected"),             // Rejection of anything (metadata.rejectionType)
    v.literal("initiated"),            // Initiation of process (metadata.processType)
    v.literal("paid_via"),             // Payment method connection (metadata.protocol)
    v.literal("fulfills"),             // Fulfillment relationship (metadata.fulfillmentType)
  ),
  metadata: v.optional(v.any()), // Relationship-specific data
  strength: v.optional(v.number()), // 0.0 to 1.0
  validFrom: v.optional(v.number()),
  validTo: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
})
  .index("from_type", ["fromEntityId", "relationshipType"])
  .index("to_type", ["toEntityId", "relationshipType"])
  .index("bidirectional", ["fromEntityId", "toEntityId"]),
```

#### 1.3 Events Table

**Purpose:** Log ALL actions that happen in the system

```typescript
events: defineTable({
  type: v.union(
    // CREATOR EVENTS
    v.literal("creator_created"),
    v.literal("creator_updated"),
    v.literal("content_uploaded"),

    // AI CLONE EVENTS
    v.literal("clone_created"),
    v.literal("clone_interaction"),
    v.literal("clone_generated_content"),
    v.literal("voice_cloned"),
    v.literal("appearance_cloned"),

    // AGENT EVENTS
    v.literal("agent_created"),
    v.literal("agent_executed"),
    v.literal("agent_completed"),
    v.literal("agent_failed"),

    // CONTENT EVENTS (consolidated)
    v.literal("content_changed"),     // created, updated, deleted
    v.literal("content_interacted"),  // viewed, shared, liked

    // AUDIENCE EVENTS
    v.literal("user_joined"),
    v.literal("user_engaged"),
    v.literal("ugc_created"),
    v.literal("comment_posted"),

    // COURSE EVENTS
    v.literal("course_created"),
    v.literal("course_enrolled"),
    v.literal("lesson_completed"),
    v.literal("course_completed"),
    v.literal("certificate_earned"),

    // TOKEN EVENTS
    v.literal("token_deployed"),
    v.literal("tokens_purchased"),
    v.literal("tokens_earned"),
    v.literal("tokens_burned"),
    v.literal("tokens_staked"),
    v.literal("tokens_unstaked"),
    v.literal("governance_vote"),

    // BUSINESS EVENTS
    v.literal("revenue_generated"),
    v.literal("cost_incurred"),
    v.literal("referral_made"),

    // GROWTH EVENTS
    v.literal("viral_share"),
    v.literal("referral_converted"),
    v.literal("achievement_unlocked"),
    v.literal("level_up"),

    // ANALYTICS EVENTS
    v.literal("metric_calculated"),
    v.literal("insight_generated"),
    v.literal("prediction_made"),
    v.literal("optimization_applied"),
    v.literal("report_generated"),

    // PAYMENT EVENTS (consolidated - uses metadata.protocol + status)
    v.literal("payment_requested"),     // All protocols (metadata: { protocol, amount })
    v.literal("payment_verified"),      // All protocols (metadata: { protocol, txHash })
    v.literal("payment_processed"),     // All protocols (metadata: { protocol, status })
    v.literal("subscription_updated"),  // All protocols (metadata: { protocol, action })

    // COMMERCE EVENTS (consolidated - uses metadata.protocol + eventType)
    v.literal("commerce_event"),        // All commerce actions (metadata: { protocol, eventType })

    // LIVESTREAM EVENTS (consolidated)
    v.literal("livestream_status_changed"), // scheduled, started, ended
    v.literal("livestream_interaction"),    // joined, left, message

    // NOTIFICATION EVENTS (consolidated)
    v.literal("notification_delivered"),

    // REFERRAL EVENTS (consolidated)
    v.literal("referral_activity"),
    v.literal("lead_captured"),

    // COMMUNICATION EVENTS (NEW - uses metadata.protocol)
    v.literal("message_sent"),          // A2A, ACP, AG-UI (metadata.protocol)
    v.literal("message_received"),      // A2A, ACP (metadata.protocol)
    v.literal("task_delegated"),        // A2A, ACP (metadata.protocol)
    v.literal("task_completed"),        // A2A, ACP (metadata.protocol)
    v.literal("task_failed"),           // Any protocol (metadata.protocol)
    v.literal("stream_chunk_sent"),     // ACP streaming (metadata.protocol: "acp")

    // COMMERCE EVENTS (NEW - already exists as "commerce_event")
    // Uses metadata.protocol: "acp" | "ap2" | "x402"
    // Uses metadata.eventType for specific actions

    // MANDATE EVENTS (NEW - uses metadata.protocol: "ap2")
    v.literal("mandate_created"),       // Intent or Cart (metadata.mandateType)
    v.literal("mandate_approved"),      // Cart approved (metadata.mandateType: "cart")
    v.literal("mandate_rejected"),      // Cart rejected (metadata.mandateType: "cart")

    // PRICE TRACKING (NEW - protocol agnostic)
    v.literal("price_checked"),         // Any price monitoring (metadata.protocol)
    v.literal("price_changed"),         // Price updates (metadata.protocol)
  ),
  actorId: v.id("entities"),
  targetId: v.optional(v.id("entities")),
  timestamp: v.number(),
  metadata: v.any(), // Event-specific data
})
  .index("entity_type_time", ["targetId", "type", "timestamp"])
  .index("type_time", ["type", "timestamp"])
  .index("actor_time", ["actorId", "timestamp"]),
```

#### 1.4 Tags Table

**Purpose:** Categorize and organize entities

```typescript
tags: defineTable({
  name: v.string(),
  category: v.union(
    v.literal("skill"),
    v.literal("industry"),
    v.literal("topic"),
    v.literal("format"),
    v.literal("goal"),
    v.literal("audience"),
    v.literal("technology"),
    v.literal("status"),
    v.literal("capability"),      // NEW: Agent capabilities
    v.literal("protocol"),         // NEW: Protocol types
    v.literal("payment_method"),   // NEW: Payment methods
    v.literal("network")           // NEW: Blockchain networks
  ),
  description: v.optional(v.string()),
  color: v.optional(v.string()),
  icon: v.optional(v.string()),
  usageCount: v.number(),
  createdAt: v.number(),
})
  .index("by_name", ["name"])
  .index("by_category", ["category"])
  .index("by_usage", ["usageCount"]),

entityTags: defineTable({
  entityId: v.id("entities"),
  tagId: v.id("tags"),
  createdAt: v.number(),
})
  .index("by_entity", ["entityId"])
  .index("by_tag", ["tagId"]),
```

---

### Phase 2: Auth Migration Strategy

**Keep existing auth tables for backward compatibility:**

```typescript
// Keep as-is (no changes)
users: defineTable({ ... }),
sessions: defineTable({ ... }),
passwordResets: defineTable({ ... }),
emailVerifications: defineTable({ ... }),
magicLinks: defineTable({ ... }),
twoFactorAuth: defineTable({ ... }),

// Add new field to link to entities table
users: defineTable({
  // ... existing fields
  entityId: v.optional(v.id("entities")), // NEW: Link to entity
}),
```

**Migration function:**
```typescript
export const migrateUsersToEntities = internalMutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    for (const user of users) {
      // Create entity for each user
      const entityId = await ctx.db.insert("entities", {
        type: "creator", // or determine from user.role
        name: user.name || user.email,
        properties: {
          email: user.email,
          emailVerified: user.emailVerified,
          originalUserId: user._id,
        },
        status: "active",
        createdAt: user.createdAt,
        updatedAt: Date.now(),
      });

      // Link back to user
      await ctx.db.patch(user._id, { entityId });
    }
  },
});
```

---

### Phase 3: Protocol-Specific Properties

#### 3.1 Intent Mandate Properties (AP2)

```typescript
{
  type: "intent_mandate",
  properties: {
    userId: Id<'entities'>,
    agentId: Id<'entities'>,
    intent: {
      action: "purchase" | "subscribe" | "book",
      constraints: {
        maxPrice: number,
        category: string,
        features?: string[],
        deadline?: number
      }
    },
    validUntil: number,
    autoExecute: boolean,
    signature: string,          // Cryptographic signature
    credentialHash: string,     // Verifiable credential hash
    status: "active" | "expired" | "fulfilled"
  }
}
```

#### 3.2 Cart Mandate Properties (AP2)

```typescript
{
  type: "cart_mandate",
  properties: {
    intentMandateId: Id<'entities'>,
    agentId: Id<'entities'>,
    merchantId: Id<'entities'>,
    items: Array<{
      productId: Id<'entities'>,
      name: string,
      price: number,
      quantity: number
    }>,
    subtotal: number,
    tax: number,
    total: number,
    status: "pending_approval" | "approved" | "declined" | "completed",
    signature: string,
    credentialHash: string,
    approvedAt?: number,
    completedAt?: number
  }
}
```

#### 3.3 Payment Transaction Properties (X402 + ACP)

```typescript
{
  type: "payment_transaction",
  properties: {
    protocol: "x402" | "acp" | "ap2",

    // X402 specific
    scheme?: "permit" | "transfer" | "signature" | "invoice",
    network?: "base" | "ethereum" | "solana",
    txHash?: string,

    // ACP specific
    agentPlatform?: "chatgpt" | "claude" | "gemini",
    stripePaymentId?: string,

    // Common fields
    amount: number,
    currency: string,
    status: "pending" | "approved" | "declined" | "completed" | "refunded",
    paymentMethod: "acp" | "x402" | "stripe",
    productId: Id<'entities'>,
    buyerId: Id<'entities'>,
    merchantId: Id<'entities'>,
    agentId?: Id<'entities'>,
    declineReason?: string,
    refundReason?: string,
    completedAt?: number
  }
}
```

#### 3.4 External Agent Properties (A2A)

```typescript
{
  type: "external_agent",
  properties: {
    platform: "elizaos" | "autogen" | "crewai" | "langchain" | "custom",
    agentId: string,
    name: string,
    description: string,
    capabilities: string[],
    apiEndpoint: string,
    websocketUrl?: string,
    status: "online" | "offline" | "busy",
    lastSeen: number,
    metadata: {
      personality?: any,  // ElizaOS character
      tools?: string[],   // Available tools
      model?: string,     // LLM model
    },
    conversationCount: number,
    messageCount: number
  }
}
```

#### 3.5 Product Properties (ACP)

```typescript
{
  type: "product",
  properties: {
    price: number,
    currency: "USD" | "EUR",
    productType: "digital_good" | "physical_good" | "subscription",
    acpEnabled: boolean,
    stripeProductId: string,
    inventory?: number,
    fulfillmentMethod: "digital_download" | "shipping" | "email",
    description: string,
    images: string[],
    merchantId: Id<'entities'>
  }
}
```

---

### Phase 4: CopilotKit AG-UI Integration

#### 4.1 Message Properties (AG-UI Protocol)

```typescript
{
  type: "message",
  properties: {
    conversationId: Id<'entities'>,
    senderId: Id<'entities'>,
    senderType: "user" | "one_agent" | "external_agent",
    content: {
      protocol: "ag-ui",
      version: "1.0.0",
      message: {
        type: "text" | "ui" | "action" | "context_request" | "reasoning" | "tool_call" | "error",
        agentId: Id<'entities'>,
        conversationId: Id<'entities'>,
        timestamp: number,
        payload: any // Type-specific payload
      }
    },
    timestamp: number
  }
}
```

#### 4.2 New Event Type for AG-UI

Already included in events table:
```typescript
v.literal("ag_ui_message_sent")
```

---

## Protocol Mapping to Ontology

### Design Principle: ONE Ontology + Protocol Metadata

**Our ontology is protocol-agnostic.** Instead of creating `ap2_price_check` or `acp_purchase_initiated` events, we use generic event types with protocol metadata:

```typescript
// ❌ BAD: Protocol-specific event types
{ type: "ap2_price_check" }
{ type: "acp_purchase_initiated" }
{ type: "x402_payment_verified" }

// ✅ GOOD: Generic event + protocol metadata
{ type: "price_checked", metadata: { protocol: "ap2" } }
{ type: "commerce_event", metadata: { protocol: "acp", eventType: "purchase_initiated" } }
{ type: "payment_verified", metadata: { protocol: "x402", network: "base" } }
```

### Event Mapping Examples

#### A2A Protocol Events

```typescript
// A2A: Message sent
{
  type: "message_sent",
  actorId: agentId,
  targetId: conversationId,
  metadata: {
    protocol: "a2a",
    messageId: "msg_123",
    recipientAgentId: "external-agent-456",
    messageType: "task_delegation"
  }
}

// A2A: Task delegated
{
  type: "task_delegated",
  actorId: orchestratorAgentId,
  targetId: externalAgentId,
  metadata: {
    protocol: "a2a",
    task: "research_market_trends",
    parameters: { industry: "fitness" }
  }
}

// A2A: Task completed
{
  type: "task_completed",
  actorId: externalAgentId,
  targetId: taskId,
  metadata: {
    protocol: "a2a",
    result: { ... },
    executionTime: 2500
  }
}
```

#### ACP Protocol Events

```typescript
// ACP: Purchase initiated
{
  type: "commerce_event",
  actorId: agentId,
  targetId: transactionId,
  metadata: {
    protocol: "acp",
    eventType: "purchase_initiated",
    agentPlatform: "chatgpt",
    productId: productId,
    amount: 99.00
  }
}

// ACP: Merchant decision
{
  type: "commerce_event",
  actorId: merchantId,
  targetId: transactionId,
  metadata: {
    protocol: "acp",
    eventType: "transaction_decision",
    approved: true,
    processingTime: 150
  }
}

// ACP: Product delivered
{
  type: "content_changed",
  actorId: systemId,
  targetId: productId,
  metadata: {
    action: "delivered",
    protocol: "acp",
    buyerId: buyerId,
    deliveryMethod: "digital_download",
    transactionId: transactionId
  }
}
```

#### AP2 Protocol Events

```typescript
// AP2: Intent Mandate created
{
  type: "mandate_created",
  actorId: userId,
  targetId: mandateId,
  metadata: {
    protocol: "ap2",
    mandateType: "intent",
    autoExecute: true,
    maxBudget: 1500
  }
}

// AP2: Price check
{
  type: "price_checked",
  actorId: agentId,
  targetId: intentMandateId,
  metadata: {
    protocol: "ap2",
    productId: "prod_123",
    currentPrice: 1399,
    targetPrice: 1500,
    withinBudget: true
  }
}

// AP2: Cart Mandate created
{
  type: "mandate_created",
  actorId: agentId,
  targetId: cartMandateId,
  metadata: {
    protocol: "ap2",
    mandateType: "cart",
    intentMandateId: intentMandateId,
    itemCount: 1,
    total: 1511,
    requiresApproval: true
  }
}

// AP2: Cart approved
{
  type: "mandate_approved",
  actorId: userId,
  targetId: cartMandateId,
  metadata: {
    protocol: "ap2",
    mandateType: "cart",
    approvalMethod: "push_notification",
    responseTime: 45000
  }
}

// AP2: Payment completed
{
  type: "payment_processed",
  actorId: paymentProcessorId,
  targetId: transactionId,
  metadata: {
    protocol: "ap2",
    status: "completed",
    amount: 1511,
    paymentMethod: "card_ending_4242"
  }
}
```

#### X402 Protocol Events

```typescript
// X402: Payment requested (402 status)
{
  type: "payment_requested",
  actorId: apiServiceId,
  targetId: resourceId,
  metadata: {
    protocol: "x402",
    scheme: "permit",
    network: "base",
    amount: "0.01",
    resource: "/api/agent/analyze"
  }
}

// X402: Payment verified
{
  type: "payment_verified",
  actorId: systemId,
  targetId: paymentId,
  metadata: {
    protocol: "x402",
    network: "base",
    txHash: "0x...",
    amount: "0.01",
    verified: true
  }
}

// X402: Payment processed
{
  type: "payment_processed",
  actorId: blockchainId,
  targetId: transactionId,
  metadata: {
    protocol: "x402",
    status: "completed",
    network: "base",
    txHash: "0x...",
    confirmations: 12
  }
}
```

#### AG-UI Protocol Events (CopilotKit)

```typescript
// AG-UI: Message sent
{
  type: "message_sent",
  actorId: agentId,
  targetId: conversationId,
  metadata: {
    protocol: "ag-ui",
    messageType: "ui", // or "text" | "action" | "reasoning"
    component: "chart",
    data: { chartType: "line", ... }
  }
}

// AG-UI: Action suggested
{
  type: "agent_executed",
  actorId: agentId,
  targetId: conversationId,
  metadata: {
    action: "ag_ui_action_suggested",
    protocol: "ag-ui",
    actions: [
      { id: "export_report", label: "Export PDF" }
    ]
  }
}
```

### Connection Mapping Examples

```typescript
// A2A: Agent communicates with external agent
{
  fromEntityId: oneAgentId,
  toEntityId: externalAgentId,
  relationshipType: "communicates_with",
  metadata: {
    protocol: "a2a",
    platform: "elizaos",
    messagesExchanged: 42,
    lastMessageAt: Date.now()
  }
}

// AP2: Cart fulfills intent
{
  fromEntityId: intentMandateId,
  toEntityId: cartMandateId,
  relationshipType: "fulfills",
  metadata: {
    protocol: "ap2",
    fulfillmentType: "intent_to_cart",
    matchScore: 0.95,
    deviations: []
  }
}

// ACP: Merchant approved transaction
{
  fromEntityId: merchantId,
  toEntityId: transactionId,
  relationshipType: "approved",
  metadata: {
    protocol: "acp",
    approvalType: "transaction",
    approvedAt: Date.now()
  }
}
```

### Benefits of This Approach

**1. Single Source of Truth**
- Ontology.md defines ALL event/connection types
- No protocol-specific pollution
- Clean, maintainable schema

**2. Protocol Flexibility**
- Add new protocols without schema changes
- Just use metadata to specify protocol
- Backwards compatible

**3. Cross-Protocol Queries**
- Find all payments: `type: "payment_processed"`
- Find AP2 payments: `type: "payment_processed", metadata.protocol: "ap2"`
- Find all A2A messages: `type: "message_sent", metadata.protocol: "a2a"`

**4. Future-Proof**
- New protocols? Just add to metadata
- Protocol versions? `metadata.protocolVersion`
- Protocol extensions? More metadata fields

---

## Breaking Changes Assessment

### ✅ Non-Breaking Changes

1. **Add new tables** - Doesn't affect existing code
2. **Add optional fields** to users table - Backward compatible
3. **Add new entity types** - Extends enum, doesn't break existing
4. **Add new event types** - Append-only
5. **Add new connection types** - Append-only

### ⚠️ Potentially Breaking Changes

1. **Migration from users to entities**
   - **Impact**: Existing queries to users table need update
   - **Mitigation**: Keep users table, add entityId link
   - **Timeline**: Gradual migration over 2 quarters

2. **New required indexes**
   - **Impact**: Schema deployment will rebuild indexes
   - **Mitigation**: Deploy during low-traffic window
   - **Timeline**: Single deployment

---

## Implementation Checklist

### Phase 1: Core Ontology (Week 1-2)

- [ ] Create entities table with all entity types
- [ ] Create connections table with all relationship types
- [ ] Create events table with all event types
- [ ] Create tags and entityTags tables
- [ ] Add indexes to all tables
- [ ] Deploy schema changes

### Phase 2: Migration (Week 3-4)

- [ ] Add entityId field to users table
- [ ] Create migration function
- [ ] Run migration on staging
- [ ] Verify data integrity
- [ ] Run migration on production
- [ ] Update auth functions to use entityId

### Phase 3: Protocol Services (Week 5-8)

- [ ] Implement A2AService (Effect.ts)
- [ ] Implement ACPService (Effect.ts)
- [ ] Implement X402PaymentService (Effect.ts)
- [ ] Implement AP2Service (Effect.ts)
- [ ] Implement AgentUIService (Effect.ts)
- [ ] Create Convex mutations/queries
- [ ] Add Astro API routes

### Phase 4: Testing (Week 9-10)

- [ ] Unit tests for all services
- [ ] Integration tests for protocol flows
- [ ] End-to-end tests for user journeys
- [ ] Performance testing
- [ ] Security audit

### Phase 5: Documentation (Week 11-12)

- [ ] Update AGENTS.md with new patterns
- [ ] Update Ontology.md with new types
- [ ] Create protocol integration guides
- [ ] Update API documentation
- [ ] Create migration guides

---

## Rollback Plan

If issues occur during deployment:

### Step 1: Immediate Rollback
```bash
# Revert to previous schema
convex deploy --schema-only --rollback
```

### Step 2: Data Consistency Check
```typescript
// Check for orphaned entities
const orphans = await ctx.db
  .query("entities")
  .filter(q => q.eq(q.field("type"), "creator"))
  .collect();

const userIds = orphans.map(e => e.properties.originalUserId);
const existingUsers = await ctx.db
  .query("users")
  .filter(q => q.or(...userIds.map(id => q.eq(q.field("_id"), id))))
  .collect();

// Report missing users
```

### Step 3: Manual Cleanup
```typescript
// Remove entities without corresponding users
await ctx.db.delete(orphanEntityId);
```

---

## Summary

### What Gets Added

**Tables:** 4 new core tables (entities, connections, events, tags/entityTags)
**Entity Types:** 56 total (22 existing + 34 new)
**Connection Types:** 34 total
**Event Types:** 65 total
**Tag Categories:** 12 total

### What Stays Unchanged

**Auth Tables:** 100% preserved (users, sessions, passwordResets, etc.)
**Auth Flow:** No changes to login/signup/reset password
**Existing APIs:** All continue to work during migration

### Migration Timeline

- **Week 1-2**: Schema deployment
- **Week 3-4**: Data migration
- **Week 5-8**: Protocol implementation
- **Week 9-10**: Testing
- **Week 11-12**: Documentation

**Total:** 12 weeks (3 months)

### Risk Level

**Low Risk:**
- Additive changes only
- Auth system untouched
- Gradual migration strategy
- Full rollback capability

**Expected Downtime:** 0 minutes (blue-green deployment)

---

## Next Steps

1. **Review this document** with team
2. **Approve schema changes**
3. **Create staging environment** for testing
4. **Begin Phase 1 implementation**
5. **Schedule migration window**

Once approved, we can proceed with implementation following this exact specification.
