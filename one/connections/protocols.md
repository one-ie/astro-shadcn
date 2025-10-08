# Protocol Integration - Quick Reference

**Last Updated:** 2025-01-05
**Status:** Design Complete, Implementation Pending

---

## The Big Idea

**ONE has a single ontology. Protocols map TO it, not the other way around.**

```
❌ WRONG: Protocol-specific events
ap2_price_check, acp_purchase_initiated, x402_payment_verified

✅ CORRECT: Generic events + protocol metadata
price_checked, commerce_event, payment_verified
(+ metadata.protocol: "ap2" | "acp" | "x402")
```

---

## The 5 Protocols

| Protocol | Purpose | Spec Doc | Integration Doc |
|----------|---------|----------|-----------------|
| **A2A** | Agent-to-agent communication | [A2A.md](./a2a.md) | [Specifications.md](./specifications.md) |
| **ACP (REST)** | Agent-to-frontend REST API | [ACP.md](./acp.md) | [Specifications.md](./specifications.md) |
| **X402** | HTTP 402 micropayments | [X402.md](./x402.md) | [Specifications.md](./specifications.md) |
| **AP2** | Autonomous agent payments | [AP2.md](./ap2.md) | [Specifications.md](./specifications.md) |
| **ACPayments** | Unified payment ecosystem | [acps.md](./acps.md) | [Specifications.md](./specifications.md) |

---

## The Ontology

**Our 4-table ontology is defined in:**
- **[Ontology.md](./ontology.md)** - The ONE source of truth
- **[ontologyupdates.md](./ontologyupdates.md)** - Implementation plan

**Tables:**
1. **entities** - All "things" (56 entity types)
2. **connections** - All relationships (25 connection types: 18 specific + 7 consolidated)
3. **events** - All actions (35 event types: 24 specific + 11 consolidated)
4. **tags** - All categories (12 tag categories)

---

## How Protocols Map

### Event Mapping Pattern

```typescript
// AP2 price check
{
  type: "price_checked",           // ← Ontology event type
  actorId: agentId,
  targetId: intentMandateId,
  timestamp: Date.now(),
  metadata: {
    protocol: "ap2",               // ← Protocol identifier
    productId: "prod_123",
    currentPrice: 1399,
    targetPrice: 1500,
    withinBudget: true
  }
}

// ACP purchase initiated
{
  type: "commerce_event",          // ← Ontology event type
  actorId: agentId,
  targetId: transactionId,
  timestamp: Date.now(),
  metadata: {
    protocol: "acp",               // ← Protocol identifier
    eventType: "purchase_initiated",
    agentPlatform: "chatgpt",
    productId: productId,
    amount: 99.00
  }
}

// X402 payment verified
{
  type: "payment_verified",        // ← Ontology event type
  actorId: systemId,
  targetId: paymentId,
  timestamp: Date.now(),
  metadata: {
    protocol: "x402",              // ← Protocol identifier
    network: "base",
    txHash: "0x...",
    amount: "0.01",
    verified: true
  }
}
```

### Connection Mapping Pattern

```typescript
// A2A: Agent communicates with external agent
{
  fromEntityId: oneAgentId,
  toEntityId: externalAgentId,
  relationshipType: "communicates_with",  // ← Ontology connection type
  metadata: {
    protocol: "a2a",                      // ← Protocol identifier
    platform: "elizaos",
    messagesExchanged: 42
  }
}

// AP2: Cart fulfills intent
{
  fromEntityId: intentMandateId,
  toEntityId: cartMandateId,
  relationshipType: "fulfills",           // ← Ontology connection type
  metadata: {
    protocol: "ap2",                      // ← Protocol identifier
    fulfillmentType: "intent_to_cart",
    matchScore: 0.95
  }
}
```

---

## Query Examples

### Cross-Protocol Queries

```typescript
// All payments (any protocol)
const allPayments = await ctx.db
  .query("events")
  .filter(q => q.eq(q.field("type"), "payment_processed"))
  .collect();

// Only X402 blockchain payments
const x402Payments = allPayments.filter(e =>
  e.metadata.protocol === "x402"
);

// Only ACP Stripe payments
const acpPayments = allPayments.filter(e =>
  e.metadata.protocol === "acp"
);

// Total revenue by protocol
const byProtocol = allPayments.reduce((acc, e) => {
  const protocol = e.metadata.protocol || "unknown";
  acc[protocol] = (acc[protocol] || 0) + e.metadata.amount;
  return acc;
}, {});
// Result: { x402: 1250, acp: 3400, ap2: 890 }
```

### Protocol-Specific Queries

```typescript
// All A2A task delegations
const a2aTasks = await ctx.db
  .query("events")
  .filter(q =>
    q.and(
      q.eq(q.field("type"), "task_delegated"),
      q.eq(q.field("metadata.protocol"), "a2a")
    )
  )
  .collect();

// All AP2 mandates
const ap2Mandates = await ctx.db
  .query("events")
  .filter(q =>
    q.and(
      q.eq(q.field("type"), "mandate_created"),
      q.eq(q.field("metadata.protocol"), "ap2")
    )
  )
  .collect();
```

---

## Benefits

### 1. Clean Ontology
- **35 event types** (not 100+) - 24 specific + 11 consolidated
- **25 connection types** (not 80+) - 18 specific + 7 consolidated
- No protocol pollution
- Single source of truth

### 2. Protocol Flexibility
- Add new protocols → just use metadata
- Protocol versions → `metadata.protocolVersion`
- No schema changes needed
- Backward compatible

### 3. Query Power
- Query ALL protocols: `type: "payment_processed"`
- Query ONE protocol: `metadata.protocol: "x402"`
- Cross-protocol analytics
- Time-series across all protocols

### 4. Maintainability
- One ontology to learn
- Consistent patterns everywhere
- Self-documenting via metadata
- Easy to understand

---

## Implementation Status

### ✅ Completed
- Ontology specification (Ontology.md)
- Protocol specifications (A2A.md, ACP.md, X402.md, AP2.md, ACPayments.md)
- Integration design (Specifications.md)
- Schema design (OntologyUpdates.md)

### 🚧 In Progress
- Auth system (users, sessions, etc.)
- Basic Astro + React UI
- Convex backend setup

### 📋 TODO
- [ ] Implement 4-table ontology in schema
- [ ] Migrate users to entities table
- [ ] Implement A2A service
- [ ] Implement ACP service
- [ ] Implement X402 service
- [ ] Implement AP2 service
- [ ] Implement ACPayments unified layer
- [ ] Build React components
- [ ] Write integration tests
- [ ] Deploy to production

---

## Quick Links

**Specifications:**
- [Specifications.md](./specifications.md) - How all protocols work together
- [Ontology.md](./ontology.md) - The ONE ontology (single source of truth)
- [ontologyupdates.md](./ontologyupdates.md) - Implementation plan

**Protocol Specs:**
- [A2A.md](./a2a.md) - Agent-to-agent communication
- [ACP.md](./acp.md) - Agent Communication Protocol (REST)
- [X402.md](./x402.md) - HTTP 402 micropayments
- [AP2.md](./ap2.md) - Agent Payments Protocol
- [acps.md](./acps.md) - Unified payment system

**Other:**
- [CopilotKit.md](./copilotkit.md) - Generative UI patterns
- [AGENTS.md](../AGENTS.md) - Convex development patterns

---

## Key Insight

**The ontology is protocol-agnostic. Protocols are just metadata.**

This means:
- We can add infinite protocols without schema changes
- All protocols share the same query infrastructure
- Cross-protocol analytics work out of the box
- The system is future-proof by design

**This is the power of a well-designed ontology.**

---

**For questions or updates, see [Specifications.md](./specifications.md)**
