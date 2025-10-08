# Events: Actions & Time-Stamped Logs

**If something HAPPENED at a specific TIME, it's an event.**

For complete event type definitions, see **[Ontology.md](./ontology.md#events-all-the-actions)**

---

## The Events Table

```typescript
{
  _id: Id<"events">,
  type: EventType,               // What happened
  actorId: Id<"things">,       // Who/what caused this
  targetId?: Id<"things">,     // Optional target thing
  timestamp: number,             // When it happened
  metadata: {
    // Event-specific data
    // ALWAYS includes "protocol" for protocol-specific events
  }
}
```

---

## 67 Event Types

### Entity Lifecycle (4)
- `entity_created` - Thing created
- `entity_updated` - Thing updated
- `entity_deleted` - Thing deleted
- `entity_archived` - Thing archived

### User Events (5)
- `user_registered` - New user signup
- `user_verified` - Email verified
- `user_login` - User logged in
- `user_logout` - User logged out
- `profile_updated` - Profile changed

### Authentication Events (6)
- `password_reset_requested` - Reset email sent
- `password_reset_completed` - Password changed
- `email_verification_sent` - Verification email sent
- `email_verified` - Email confirmed
- `two_factor_enabled` - 2FA turned on
- `two_factor_disabled` - 2FA turned off

### Organization Events (5)
- `organization_created` - Org created
- `organization_updated` - Org settings changed
- `user_invited_to_org` - Invitation sent
- `user_joined_org` - User joined org
- `user_removed_from_org` - User removed

### Dashboard & UI Events (4)
- `dashboard_viewed` - Dashboard accessed
- `settings_updated` - Settings changed
- `theme_changed` - Theme switched (light/dark)
- `preferences_updated` - Preferences changed

### AI/Clone Events (4)
- `clone_created` - AI clone created
- `clone_updated` - Clone settings changed
- `voice_cloned` - Voice ready
- `appearance_cloned` - Appearance ready

### Agent Events (4)
- `agent_created` - Agent created
- `agent_executed` - Agent started task
- `agent_completed` - Agent finished task
- `agent_failed` - Agent task failed

### Token Events (7)
- `token_created` - Token entity created
- `token_minted` - Token minted on-chain
- `token_burned` - Token burned
- `tokens_purchased` - User bought tokens
- `tokens_staked` - Tokens staked
- `tokens_unstaked` - Tokens unstaked
- `tokens_transferred` - Tokens sent

### Course Events (5)
- `course_created` - Course created
- `course_enrolled` - User enrolled
- `lesson_completed` - Lesson finished
- `course_completed` - Course finished
- `certificate_earned` - Certificate issued

### Analytics Events (5)
- `metric_calculated` - Metric computed
- `insight_generated` - AI insight created
- `prediction_made` - AI prediction made
- `optimization_applied` - Optimization applied
- `report_generated` - Report created

### Inference Events (7) ⚡
**Powers the knowledge layer**

- `inference_request` - User requests AI inference
- `inference_completed` - Result delivered
- `inference_failed` - Inference failed
- `inference_quota_exceeded` - Monthly limit hit
- `inference_revenue_collected` - Daily revenue sweep
- `org_revenue_generated` - Org generates platform revenue
- `revenue_share_distributed` - Revenue share paid out

### Blockchain Events (5) ⛓️
**Protocol-agnostic blockchain tracking**

- `nft_minted` - NFT created on-chain
- `nft_transferred` - NFT ownership changed
- `tokens_bridged` - Cross-chain bridge
- `contract_deployed` - Smart contract deployed
- `treasury_withdrawal` - Platform owner withdraws

### Consolidated Events (11)
Uses `metadata` for variants + protocol identity:

- `content_event` - metadata.action: created|updated|deleted|viewed|shared|liked
- `payment_event` - metadata.status: requested|verified|processed + protocol
- `subscription_event` - metadata.action: started|renewed|cancelled
- `commerce_event` - metadata.eventType + protocol (ACP, AP2)
- `livestream_event` - metadata.status: started|ended + metadata.action: joined|left
- `notification_event` - metadata.channel: email|sms|push|in_app
- `referral_event` - metadata.action: created|completed|rewarded
- `communication_event` - metadata.protocol (A2A, ACP, AG-UI) + messageType
- `task_event` - metadata.action: delegated|completed|failed + protocol
- `mandate_event` - metadata.mandateType: intent|cart + protocol (AP2)
- `price_event` - metadata.action: checked|changed

---

## Common Patterns

### Pattern 1: User Action

```typescript
// User purchased tokens
{
  type: "tokens_purchased",
  actorId: userId,
  targetId: tokenId,
  timestamp: Date.now(),
  metadata: {
    amount: 100,
    usdAmount: 10,
    paymentId: "pi_123",
    txHash: "0x456",
    network: "sui"
  }
}
```

### Pattern 2: Inference Request → Completion

```typescript
// 1. User requests inference
{
  type: "inference_request",
  actorId: userId,
  targetId: inferenceRequestId,
  timestamp: Date.now(),
  metadata: {
    organizationId,
    model: "gpt-4",
    prompt: "Create a fitness course...",
    cost: 0.045,
    price: 0.10
  }
}

// 2. Inference completes
{
  type: "inference_completed",
  actorId: "system",
  targetId: inferenceRequestId,
  timestamp: Date.now(),
  metadata: {
    result: courseId,
    tokensGenerated: 2500,
    latency: 3.2,
    revenue: 0.10
  }
}

// 3. Update org usage (happens in mutation, not event)
```

### Pattern 3: Content Lifecycle (Consolidated)

```typescript
// Content created
{
  type: "content_event",
  actorId: creatorId,
  targetId: contentId,
  timestamp: Date.now(),
  metadata: {
    action: "created",
    contentType: "blog_post",
    generatedBy: "marketing_agent"
  }
}

// Content viewed
{
  type: "content_event",
  actorId: userId,
  targetId: contentId,
  timestamp: Date.now(),
  metadata: {
    action: "viewed",
    duration: 120,  // seconds
    source: "feed"
  }
}
```

### Pattern 4: Payment Flow (Consolidated)

```typescript
// Payment completed
{
  type: "payment_event",
  actorId: userId,
  targetId: paymentId,
  timestamp: Date.now(),
  metadata: {
    status: "completed",
    amount: 99.00,
    currency: "USD",
    paymentId: "pi_123456",
    method: "stripe"
  }
}

// Subscription renewed
{
  type: "subscription_event",
  actorId: userId,
  targetId: subscriptionId,
  timestamp: Date.now(),
  metadata: {
    action: "renewed",
    tier: "pro",
    amount: 29.00,
    nextBillingDate: Date.now() + 30 * 24 * 60 * 60 * 1000
  }
}
```

### Pattern 5: Protocol Communication (Consolidated)

```typescript
// A2A: Agent delegates task
{
  type: "communication_event",
  actorId: oneAgentId,
  targetId: externalAgentId,
  timestamp: Date.now(),
  metadata: {
    protocol: "a2a",
    messageType: "task_delegation",
    task: "research_market_trends",
    parameters: { industry: "fitness" }
  }
}

// ACP: Purchase initiated
{
  type: "commerce_event",
  actorId: agentId,
  targetId: transactionId,
  timestamp: Date.now(),
  metadata: {
    protocol: "acp",
    eventType: "purchase_initiated",
    agentPlatform: "chatgpt",
    productId,
    amount: 99.00
  }
}

// X402: Payment verified
{
  type: "payment_event",
  actorId: "system",
  targetId: paymentId,
  timestamp: Date.now(),
  metadata: {
    protocol: "x402",
    status: "verified",
    network: "base",
    txHash: "0x...",
    verified: true
  }
}
```

---

## The Inference Revenue Flow

### Daily Revenue Collection

```typescript
// Collect all inference revenue for the day
const today = new Date().setHours(0, 0, 0, 0);
const inferenceEvents = await db
  .query("events")
  .withIndex("type_time", q =>
    q.eq("type", "inference_completed")
     .gte("timestamp", today)
  )
  .collect();

// Calculate metrics
const metrics = {
  totalInferences: inferenceEvents.length,
  totalRevenue: sum(inferenceEvents.map(e => e.metadata.revenue)),
  totalCosts: sum(inferenceEvents.map(e => e.metadata.cost)),
  netProfit: 0,
  profitMargin: 0
};

metrics.netProfit = metrics.totalRevenue - metrics.totalCosts;
metrics.profitMargin = (metrics.netProfit / metrics.totalRevenue) * 100;

// Log revenue collection
await db.insert("events", {
  type: "inference_revenue_collected",
  actorId: "system",
  targetId: platformOwnerId,
  timestamp: Date.now(),
  metadata: {
    ...metrics,
    network: "sui",
    treasuryAddress: process.env.PLATFORM_TREASURY_SUI,
    txDigest: "..."
  }
});
```

### Revenue Share Distribution

```typescript
// If org has revenue share
const org = await db.get(organizationId);

if (org.properties.revenueShare > 0) {
  const orgRevenue = metrics.totalRevenue * org.properties.revenueShare;
  const platformRevenue = metrics.totalRevenue - orgRevenue;

  // Log revenue generation
  await db.insert("events", {
    type: "org_revenue_generated",
    actorId: organizationId,
    targetId: platformOwnerId,
    timestamp: Date.now(),
    metadata: {
      totalRevenue: metrics.totalRevenue,
      orgShare: orgRevenue,
      platformShare: platformRevenue,
      revenueSharePercentage: org.properties.revenueShare
    }
  });

  // Distribute to org owner
  await db.insert("events", {
    type: "revenue_share_distributed",
    actorId: platformOwnerId,
    targetId: orgOwnerId,
    timestamp: Date.now(),
    metadata: {
      amount: orgRevenue,
      percentage: org.properties.revenueShare,
      network: "sui",
      txDigest: "..."
    }
  });
}
```

---

## Blockchain Events

Protocol-agnostic blockchain tracking via `metadata.network`:

```typescript
// NFT minted
{
  type: "nft_minted",
  actorId: creatorId,
  targetId: nftId,
  timestamp: Date.now(),
  metadata: {
    network: "sui",
    tokenId: "0x123",
    collectionId: "0x456",
    txDigest: "..."
  }
}

// Tokens bridged cross-chain
{
  type: "tokens_bridged",
  actorId: userId,
  targetId: tokenId,
  timestamp: Date.now(),
  metadata: {
    fromNetwork: "sui",
    toNetwork: "base",
    amount: 1000,
    fromTxHash: "0x...",
    toTxHash: "0x..."
  }
}

// Contract deployed
{
  type: "contract_deployed",
  actorId: platformOwnerId,
  targetId: contractId,
  timestamp: Date.now(),
  metadata: {
    network: "sui",
    packageId: "0x...",
    contractType: "token",
    txDigest: "..."
  }
}
```

---

## Querying Events

### Get Thing's History

```typescript
const history = await db
  .query("events")
  .withIndex("thing_type_time", q => q.eq("targetId", thingId))
  .order("desc")  // Most recent first
  .collect();
```

### Get Events by Type

```typescript
const inferenceEvents = await db
  .query("events")
  .withIndex("type_time", q =>
    q.eq("type", "inference_completed")
     .gte("timestamp", startDate)
  )
  .collect();
```

### Get User's Activity

```typescript
const activity = await db
  .query("events")
  .withIndex("actor_time", q =>
    q.eq("actorId", userId)
     .gte("timestamp", last30Days)
  )
  .order("desc")
  .collect();
```

### Cross-Protocol Analytics

```typescript
// All payments across all protocols
const allPayments = await db
  .query("events")
  .filter(q => q.eq(q.field("type"), "payment_event"))
  .collect();

// Only X402 blockchain payments
const x402Payments = allPayments.filter(
  e => e.metadata.protocol === "x402"
);

// Total revenue by protocol
const byProtocol = allPayments.reduce((acc, e) => {
  const protocol = e.metadata.protocol || "traditional";
  acc[protocol] = (acc[protocol] || 0) + e.metadata.amount;
  return acc;
}, {});
```

---

## Event Retention & Archival

### Recommended Windows

- **Hot** (fast queries): last 30-90 days in primary events table
- **Warm** (analytics): 90-365 days; restrict heavy scans
- **Cold** (archive): >365 days; export to warehouse/storage

### Patterns

- Use `type_time` and `actor_time` indexes for filters
- Precompute aggregates into `metric` entities
- Schedule rollups to archive old events

---

## Performance

### Indexes

```typescript
events:
  - thing_type_time(targetId, type, timestamp)
  - type_time(type, timestamp)
  - actor_time(actorId, timestamp)
```

### Query Optimization

- Always use indexes
- Filter by type when possible
- Use time ranges to limit results
- Batch event inserts in transactions

---

## Key Principles

- **Immutable** - Events never change, only append
- **Time-stamped** - Every event has exact timestamp
- **Actor-driven** - Who did it is always tracked
- **Protocol-agnostic** - Protocol identity in metadata.protocol
- **Consolidated types** - Use metadata for variants
- **Complete audit trail** - Everything that happens is logged

**Events tell the story. Things and connections show the current state. Events show how we got here.**
