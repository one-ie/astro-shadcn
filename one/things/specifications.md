# Protocol Specifications - How ONE Leverages Open Standards

**Version:** 1.0.0
**Purpose:** Understand how A2A, ACP, AP2, X402, and ACPayments work together to create the ultimate AI-native creator platform

---

## Overview: The Specification Stack

ONE platform integrates **5 complementary protocols** to enable the full spectrum of AI agent capabilities:

```
┌────────────────────────────────────────────────────────────────┐
│                     CREATOR PLATFORM (ONE)                     │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Content      │  │ Audience     │  │ Revenue      │        │
│  │ Creation     │  │ Growth       │  │ Generation   │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│         ▲                  ▲                  ▲                │
└─────────┼──────────────────┼──────────────────┼────────────────┘
          │                  │                  │
┌─────────┴──────────────────┴──────────────────┴────────────────┐
│               PROTOCOL LAYER (5 Specifications)                │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  A2A Protocol        │  Agent ↔ Agent Communication            │
│  ACP (REST)          │  Agent ↔ Frontend REST API              │
│  X402                │  HTTP Payment Protocol (micropayments)  │
│  AP2                 │  Agent Payment Authorization            │
│  ACPayments          │  Combined Payment Ecosystem             │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│  Convex (DB)  │  Effect.ts (Services)  │  Astro + React (UI)  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Communication Protocols

### A2A Protocol - Agent-to-Agent Communication

**Purpose:** Enable AI agents to collaborate across platforms

**Official Spec:** https://a2a-protocol.org/latest/

**What It Enables:**
- Cross-platform agent collaboration (LangGraph ↔ CrewAI ↔ ONE agents)
- Task delegation between agents
- Standardized message format for interoperability
- Framework-agnostic agent discovery

**Use Cases in ONE:**
1. **Content Generation Pipeline**
   - Strategy Agent delegates research to external LangGraph agent
   - Marketing Agent gets SEO insights from specialized SEO agent
   - All coordinated via A2A protocol

2. **External Agent Integration**
   - ElizaOS agents collaborate with ONE agents
   - AutoGen agents participate in multi-agent workflows
   - CrewAI teams integrated into platform

**Message Structure:**
```typescript
{
  messageId: "msg_123",
  from: { agentId: "one-strategy", endpoint: "https://one.ie/agents/strategy" },
  to: { agentId: "elizaos-research", endpoint: "https://eliza.ai/agents/research" },
  message: {
    type: "task_delegation",
    content: {
      task: "research_market_trends",
      parameters: { industry: "fitness", depth: "detailed" }
    }
  }
}
```

**Integration Pattern:**
```typescript
// Convex service wraps A2A protocol
export class A2AService extends Effect.Service {
  delegateTask: (to: AgentId, task: Task) =>
    Effect.gen(function* () {
      const message = createA2AMessage({ to, task });
      yield* sendToAgent(message);

      // Use ONE ontology event type with protocol metadata
      yield* db.insert("events", {
        type: "task_delegated",
        actorId: fromAgentId,
        targetId: toAgentId,
        timestamp: Date.now(),
        metadata: {
          protocol: "a2a",
          task: task.type,
          parameters: task.parameters
        }
      });
    })
}
```

---

### ACP (Agent Communication Protocol) - REST-Based Agent Comms

**Purpose:** REST API for agent-to-frontend communication

**Official Spec:** https://agentcommunicationprotocol.dev/

**What It Enables:**
- Synchronous and asynchronous agent interactions
- Multimodal communication (text, images, audio, video)
- Agent discovery by capability
- Streaming responses

**Use Cases in ONE:**
1. **Real-time Agent Responses**
   - Intelligence Agent streams analytics insights
   - Marketing Agent sends content previews
   - Sales Agent provides live funnel metrics

2. **Agent Discovery**
   - Frontend discovers available agents
   - Filters by capability (e.g., "image_generation")
   - Routes requests to appropriate agent

**REST Endpoints:**
```
POST   /agents/{id}/messages     - Send message
GET    /agents/{id}/messages     - Get message history
POST   /agents/{id}/tasks        - Create async task
GET    /agents/{id}/tasks/{tid}  - Get task status
GET    /agents/{id}/capabilities - Get agent info
GET    /agents                   - Discover agents
```

**Integration Pattern:**
```typescript
// Astro API route implements ACP
export const POST: APIRoute = async ({ params, request }) => {
  const message = await request.json();

  const result = await convex.mutation(api.agents.receiveMessage, {
    agentId: params.id,
    message
  });

  return new Response(JSON.stringify(result));
};
```

---

## Part 2: Payment Protocols

### X402 - HTTP Payment Required

**Purpose:** HTTP-native micropayments using 402 status code

**Official Spec:** https://www.x402.org/

**What It Enables:**
- Pay-per-use API access
- Instant cryptocurrency payments
- Zero fees (blockchain-direct)
- Multi-chain support (Base, Ethereum, Solana)

**Use Cases in ONE:**
1. **Agent API Monetization**
   - $0.01 per Intelligence Agent analysis
   - $0.005 per message to external agent
   - $0.10 per workflow execution

2. **Content Access**
   - $0.50 per premium course lesson
   - $1.00 per consultation booking
   - $5.00 per exclusive livestream

**Payment Flow:**
```
1. Client: GET /api/agent/analyze
2. Server: 402 Payment Required
   {
     "accepts": [
       { "scheme": "permit", "network": "base", "amount": "0.01" }
     ]
   }
3. Client: POST /api/agent/analyze
   Headers: X-PAYMENT: { permit payload }
4. Server: 200 OK (payment verified)
```

**Integration Pattern:**
```typescript
// X402 middleware
export async function x402Middleware(request, resource, amount) {
  const payment = request.headers.get('X-PAYMENT');

  if (!payment) {
    return new Response(JSON.stringify({
      x402Version: 1,
      accepts: [{ scheme: "permit", network: "base", amount }]
    }), { status: 402 });
  }

  const verified = await verifyPayment(payment);
  if (!verified) return new Response("Payment failed", { status: 402 });

  return null; // Continue processing
}
```

---

### AP2 - Agent Payments Protocol

**Purpose:** Cryptographically-signed payment mandates for autonomous agents

**Official Spec:** https://cloud.google.com/blog/.../announcing-agents-to-payments-ap2-protocol

**What It Enables:**
- **Intent Mandates**: User authorizes agent to make purchases
- **Cart Mandates**: Immutable purchase records
- **Autonomous Payments**: Agent pays on user's behalf
- **Verifiable Credentials**: Cryptographic proof of authorization

**Use Cases in ONE:**
1. **Autonomous Content Purchases**
   - User: "Keep me upskilled in React, budget $50/month"
   - Agent: Auto-purchases relevant courses when available

2. **Smart Subscriptions**
   - User: "Maintain Slack licenses for all employees"
   - Agent: Auto-scales licenses based on headcount

3. **Multi-Platform Bookings**
   - User: "Book 5-day Hawaii vacation, budget $3000"
   - Agent: Coordinates flights + hotel + car + activities

**Two Transaction Models:**

**Real-Time (Human Present):**
```typescript
// User approves each purchase
User → Intent Mandate → Agent finds product → Cart Mandate → User approves → Payment
```

**Autonomous (Human Not Present):**
```typescript
// Pre-authorized by Intent Mandate
User → Detailed Intent Mandate → Agent monitors → Conditions met → Auto-execute → Payment
```

**Integration Pattern:**
```typescript
// Create Intent Mandate
export class AP2Service extends Effect.Service {
  createIntentMandate: (args: {
    userId: Id<'entities'>;
    intent: { maxPrice: number; category: string };
    autoExecute: boolean;
  }) =>
    Effect.gen(function* () {
      const vc = yield* crypto.signCredential({
        type: "IntentMandate",
        issuer: args.userId,
        claims: { intent: args.intent, autoExecute: args.autoExecute }
      });

      const mandateId = yield* db.insert("entities", {
        type: "intent_mandate",
        properties: { ...args, signature: vc.proof }
      });

      return { mandateId, credential: vc };
    })
}
```

---

### ACP (Agentic Commerce Protocol) - AI Agent Shopping

**Purpose:** AI agents purchase products on behalf of users

**Official Spec:** https://www.agenticcommerce.dev/ (Stripe + OpenAI)

**What It Enables:**
- AI agents discover products
- Merchant approval flow
- Secure payment via Stripe
- OpenAI ChatGPT integration

**Use Cases in ONE:**
1. **AI Course Recommendations**
   - ChatGPT discovers ONE courses
   - Recommends to user based on goals
   - User approves purchase in ChatGPT
   - ONE receives payment via ACP

2. **Content Bundles**
   - Agent: "This user needs full marketing stack"
   - Finds: Marketing course + Templates + Consultation
   - Creates bundle offer
   - User approves with one click

**Purchase Flow:**
```
1. AI Agent discovers product on ONE platform
2. Agent creates purchase request
3. Merchant (creator) approves/declines
4. If approved, process payment via Stripe
5. Deliver product to user
```

**Integration Pattern:**
```typescript
// Merchant approves ACP transaction
export class ACPPaymentService extends Effect.Service {
  processTransaction: (args: {
    transactionId: Id<'entities'>;
    merchantId: Id<'entities'>;
    approved: boolean;
  }) =>
    Effect.gen(function* () {
      yield* db.patch(args.transactionId, {
        "properties.status": args.approved ? "approved" : "declined"
      });

      if (args.approved) {
        return yield* processStripePayment(args.transactionId);
      }
    })
}
```

---

## Part 3: ACPayments - Unified Payment Ecosystem

**Purpose:** Combine X402 + AP2 + ACP into complete payment system

**What ACPayments Provides:**

```
┌─────────────────────────────────────────────────────────────┐
│                      ACPayments System                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │      X402     │  │      AP2      │  │      ACP      │  │
│  │ Micropayments │  │  Autonomous   │  │  AI Shopping  │  │
│  │  (HTTP 402)   │  │  Mandates     │  │   (Stripe)    │  │
│  └───────────────┘  └───────────────┘  └───────────────┘  │
│          │                  │                  │            │
│          └──────────────────┴──────────────────┘            │
│                            │                                │
│                   ┌────────┴────────┐                       │
│                   │  Unified Layer  │                       │
│                   │  - Single API   │                       │
│                   │  - Type safety  │                       │
│                   │  - Ontology     │                       │
│                   └─────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

**Unified Payment Types:**

| Type | Protocol | Use Case | Settlement |
|------|----------|----------|------------|
| **Micropayment** | X402 | API calls, per-use | Instant (blockchain) |
| **Autonomous** | AP2 | Pre-authorized purchases | Delegated to agent |
| **AI Commerce** | ACP | ChatGPT product discovery | Stripe processing |
| **Revenue Split** | ACPayments | Multi-agent collaboration | Distributed payments |
| **Subscription** | ACPayments | Recurring access | Automated billing |

**Ontology Integration:**

```typescript
// Single "payment" entity type handles all protocols
{
  type: "payment",
  properties: {
    protocol: "x402" | "ap2" | "acp" | "revenue-split" | "subscription",
    amount: string,
    status: "pending" | "completed" | "failed",
    // Protocol-specific fields in metadata
  }
}

// Events log all payment activities (using ONE ontology)
{
  type: "payment_processed",          // Generic ontology event
  actorId: blockchainId,
  targetId: transactionId,
  timestamp: Date.now(),
  metadata: {
    protocol: "x402",                 // Protocol identifier
    status: "completed",
    network: "base",
    txHash: "0x..."
  }
}
```

---

## Part 4: How They Work Together

### Scenario 1: AI Agent Buys Course for User

**Protocols Used:** A2A + AP2 + ACP

```
1. User to ONE Platform:
   "I want to learn React, budget $100/month"

2. ONE Intelligence Agent (via A2A):
   Delegates to external Content Discovery Agent
   "Find best React courses under $100"

3. Content Discovery Agent (via ACP):
   Discovers React course on ONE platform
   Price: $79, Rating: 4.8, 50 hours

4. ONE Intelligence Agent creates AP2 Intent Mandate:
   { maxPrice: 100, category: "React courses", autoExecute: true }

5. Course meets criteria → Auto-purchase via AP2
   Cart Mandate signed by agent
   Payment processed via X402 (blockchain)

6. User receives:
   - Course access
   - Receipt with verifiable credentials
   - Auto-enrollment confirmation
```

**Code Flow:**
```typescript
// 1. User request → Create Intent Mandate (AP2)
const intent = await createIntentMandate({
  userId,
  intent: { category: "React", maxPrice: 100 },
  autoExecute: true
});
// Logs: { type: "mandate_created", metadata: { protocol: "ap2", mandateType: "intent" } }

// 2. A2A delegation → External agent
const discovery = await a2aService.delegateTask({
  to: "content-discovery-agent",
  task: "find_courses",
  params: { topic: "React", maxPrice: 100 }
});
// Logs: { type: "task_delegated", metadata: { protocol: "a2a" } }

// 3. ACP product discovery → Find product
const product = await acpService.discoverProduct({
  query: "React course",
  maxPrice: 100
});
// Logs: { type: "message_sent", metadata: { protocol: "acp" } }

// 4. AP2 cart creation → Auto-purchase ready
const cart = await ap2Service.createCartMandate({
  intentMandateId: intent.id,
  items: [{ productId: product.id, price: 79 }]
});
// Logs: { type: "mandate_created", metadata: { protocol: "ap2", mandateType: "cart" } }

// 5. X402 payment → Blockchain settlement
if (cart.total < 100) {
  await x402Service.processPayment({
    cartId: cart.id,
    network: "base",
    amount: "79"
  });
  // Logs: { type: "payment_processed", metadata: { protocol: "x402", network: "base" } }
}
```

---

### Scenario 2: Multi-Agent Workflow with Revenue Sharing

**Protocols Used:** A2A + ACPayments (Revenue Split)

```
1. User requests: "Create full marketing campaign"

2. Agent Orchestrator (via A2A):
   - Delegates market research to Research Agent
   - Delegates content creation to Marketing Agent
   - Delegates funnel design to Sales Agent

3. Each agent completes their task

4. User pays $500 for complete campaign

5. ACPayments distributes revenue:
   - Research Agent: 30% ($150)
   - Marketing Agent: 40% ($200)
   - Sales Agent: 30% ($150)

6. All payments settled via X402 (instant blockchain)
```

**Code Flow:**
```typescript
// Create revenue split
const revenueSplit = await agentPaymentService.createRevenueSplit({
  workflowId,
  totalAmount: "500",
  participants: [
    { agentId: researchAgentId, percentage: 30 },
    { agentId: marketingAgentId, percentage: 40 },
    { agentId: salesAgentId, percentage: 30 }
  ]
});

// Distribute payments
await agentPaymentService.distributeRevenue({
  revenueSplitId: revenueSplit.id
});
```

---

### Scenario 3: External Agent Integration with Payment

**Protocols Used:** A2A + X402

```
1. ONE user needs ElizaOS agent for specialized task

2. ONE Intelligence Agent (via A2A):
   Discovers ElizaOS agent with "blockchain_analysis" capability

3. ONE sends task via A2A protocol:
   { task: "analyze_nft_market", params: {...} }

4. ElizaOS agent requires payment (via X402):
   Returns 402 Payment Required: $0.50

5. ONE auto-pays via X402:
   Blockchain transfer of $0.50 USDC

6. ElizaOS processes task and returns results

7. ONE delivers insights to user
```

**Code Flow:**
```typescript
// Discover external agent
const elizaAgent = await a2aService.discoverAgents({
  capability: "blockchain_analysis",
  platform: "elizaos"
});

// Delegate task with X402 payment handler
const result = await a2aService.delegateTask({
  to: elizaAgent.id,
  task: { type: "analyze_nft_market" },
  paymentHandler: async (paymentRequired) => {
    // Auto-pay via X402
    return await x402Service.processPayment({
      resource: paymentRequired.resource,
      amount: paymentRequired.maxAmountRequired,
      network: "base"
    });
  }
});
```

---

## Part 5: Architecture Benefits

### Why This Stack Works

**1. Protocol Separation of Concerns**
- **A2A**: Agent collaboration (who talks to whom)
- **ACP**: REST communication (how they talk)
- **X402**: Micropayments (pay-per-use)
- **AP2**: Autonomous payments (delegated spending)
- **ACPayments**: Unified payment ecosystem

**2. Creator Empowerment**

**Traditional Platform:**
```
Creator → Platform Fee (30%) → Limited monetization → No agent integration
```

**ONE Platform:**
```
Creator → X402 (0% fees) → Direct blockchain payments
         → AP2 (autonomous buyers) → 24/7 sales
         → ACP (AI discovery) → Global reach via ChatGPT
         → A2A (agent network) → Infinite distribution
```

**3. Ontology Alignment**

All protocols map cleanly to our 4-table ontology:

```typescript
// Entities: Agents, products, mandates, payments
{ type: "strategy_agent" | "product" | "intent_mandate" | "payment" }

// Connections: Ownership, delegation, transactions
{ relationshipType: "owns" | "delegated_to" | "transacted" }

// Events: All protocol actions
{ type: "a2a_task_delegated" | "x402_payment_completed" | "ap2_cart_created" }

// Tags: Capabilities, categories
{ category: "capability" | "payment_method" | "protocol" }
```

**4. Composability**

Mix and match protocols for any use case:

- **Simple sale**: Just ACP (AI discovers → User buys → Stripe)
- **Micropayment**: Just X402 (Request → 402 → Pay → Access)
- **Autonomous**: AP2 + X402 (Intent → Monitor → Auto-pay → Deliver)
- **Multi-agent**: A2A + ACPayments (Delegate → Collaborate → Split revenue)
- **External**: A2A + X402 (Discover → Delegate → Pay → Receive)

---

## Part 6: Implementation Roadmap

### Phase 1: Foundation (Q1 2025) ✅

- [x] Ontology specification
- [x] Convex schema
- [x] Effect.ts service layer
- [x] PromptKit UI components
- [ ] A2A service implementation
- [ ] ACP REST endpoints

### Phase 2: Payments (Q2 2025)

- [ ] X402 middleware
- [ ] X402 payment service
- [ ] Multi-chain support (Base, Ethereum, Solana)
- [ ] Payment UI components
- [ ] Transaction history

### Phase 3: Autonomous (Q3 2025)

- [ ] AP2 protocol implementation
- [ ] Intent Mandate system
- [ ] Cart Mandate system
- [ ] Verifiable credentials
- [ ] Autonomous payment UI

### Phase 4: Integration (Q4 2025)

- [ ] ElizaOS integration
- [ ] AutoGen integration
- [ ] CrewAI integration
- [ ] ChatGPT ACP integration
- [ ] Full protocol interop

---

## Part 7: Ontology Integration

### The ONE Ontology Principle

**Our ontology is the single source of truth.** Protocols map TO it, not the other way around.

```
❌ WRONG: Protocol-specific event types
{ type: "ap2_price_check" }
{ type: "acp_purchase_initiated" }
{ type: "x402_payment_verified" }

✅ CORRECT: Generic events + protocol metadata
{ type: "price_checked", metadata: { protocol: "ap2" } }
{ type: "commerce_event", metadata: { protocol: "acp", eventType: "purchase_initiated" } }
{ type: "payment_verified", metadata: { protocol: "x402", network: "base" } }
```

### Event Type Mapping

All protocols use the same 38 base event types defined in **Ontology.md**:

| Protocol | Action | Ontology Event | Metadata |
|----------|--------|----------------|----------|
| **A2A** | Agent delegates task | `task_delegated` | `{ protocol: "a2a", task: "research" }` |
| **A2A** | Agent completes task | `task_completed` | `{ protocol: "a2a", result: {...} }` |
| **A2A** | Message sent | `message_sent` | `{ protocol: "a2a", messageType: "task" }` |
| **ACP** | Purchase initiated | `commerce_event` | `{ protocol: "acp", eventType: "purchase_initiated" }` |
| **ACP** | Merchant approves | `commerce_event` | `{ protocol: "acp", eventType: "transaction_decision" }` |
| **ACP** | Product delivered | `content_changed` | `{ protocol: "acp", action: "delivered" }` |
| **AP2** | Intent created | `mandate_created` | `{ protocol: "ap2", mandateType: "intent" }` |
| **AP2** | Price checked | `price_checked` | `{ protocol: "ap2", productId, currentPrice }` |
| **AP2** | Cart created | `mandate_created` | `{ protocol: "ap2", mandateType: "cart" }` |
| **AP2** | Cart approved | `mandate_approved` | `{ protocol: "ap2", mandateType: "cart" }` |
| **X402** | Payment requested | `payment_requested` | `{ protocol: "x402", scheme: "permit" }` |
| **X402** | Payment verified | `payment_verified` | `{ protocol: "x402", txHash: "0x..." }` |
| **X402** | Payment completed | `payment_processed` | `{ protocol: "x402", status: "completed" }` |
| **AG-UI** | UI message sent | `message_sent` | `{ protocol: "ag-ui", messageType: "ui" }` |
| **AG-UI** | Action suggested | `agent_executed` | `{ protocol: "ag-ui", action: "suggestion" }` |

### Connection Type Mapping

All protocols use generic relationship types:

| Protocol | Relationship | Ontology Connection | Metadata |
|----------|--------------|---------------------|----------|
| **A2A** | Agent communicates | `communicates_with` | `{ protocol: "a2a", platform: "elizaos" }` |
| **A2A** | Task delegated | `delegated_to` | `{ protocol: "a2a", taskType: "research" }` |
| **ACP** | Merchant approves | `approved` | `{ protocol: "acp", approvalType: "transaction" }` |
| **ACP** | Purchase initiated | `initiated` | `{ protocol: "acp", processType: "purchase" }` |
| **AP2** | Cart fulfills intent | `fulfills` | `{ protocol: "ap2", fulfillmentType: "intent_to_cart" }` |
| **AP2** | Payment method | `paid_via` | `{ protocol: "ap2", method: "card" }` |
| **X402** | Payment made | `transacted` | `{ protocol: "x402", network: "base" }` |

### Querying Across Protocols

**Find all payments (any protocol):**
```typescript
const allPayments = await ctx.db
  .query("events")
  .filter(q => q.eq(q.field("type"), "payment_processed"))
  .collect();
```

**Find only X402 blockchain payments:**
```typescript
const x402Payments = await ctx.db
  .query("events")
  .filter(q =>
    q.and(
      q.eq(q.field("type"), "payment_processed"),
      q.eq(q.field("metadata.protocol"), "x402")
    )
  )
  .collect();
```

**Find all agent communications (A2A + ACP + AG-UI):**
```typescript
const allMessages = await ctx.db
  .query("events")
  .filter(q => q.eq(q.field("type"), "message_sent"))
  .collect();

// Filter by protocol in application code
const a2aMessages = allMessages.filter(m => m.metadata.protocol === "a2a");
const acpMessages = allMessages.filter(m => m.metadata.protocol === "acp");
const agUiMessages = allMessages.filter(m => m.metadata.protocol === "ag-ui");
```

**Cross-protocol analytics:**
```typescript
// Total revenue across ALL protocols
const allRevenue = await ctx.db
  .query("events")
  .filter(q => q.eq(q.field("type"), "revenue_generated"))
  .collect();

const totalByProtocol = allRevenue.reduce((acc, event) => {
  const protocol = event.metadata.protocol || "unknown";
  acc[protocol] = (acc[protocol] || 0) + event.metadata.amount;
  return acc;
}, {});

// Result: { x402: 1250, acp: 3400, ap2: 890 }
```

### Why This Architecture Wins

**1. Clean Ontology**
- Only 35 event types total (not 100+)
- Only 25 connection types (not 80+)
- No protocol pollution
- Single source of truth

**2. Protocol Flexibility**
- Add new protocols without schema changes
- Protocol versions via metadata
- Backward compatible
- Future-proof

**3. Query Power**
- Query all protocols: `type: "payment_processed"`
- Query specific protocol: `metadata.protocol: "x402"`
- Cross-protocol analytics
- Time-series across protocols

**4. Maintainability**
- One ontology to learn
- Consistent patterns
- Easy to understand
- Self-documenting via metadata

---

## Summary: Why This Matters for Creators

**Before ONE:**
- Creators manually create content
- 30% platform fees
- Limited monetization options
- No AI agents
- No autonomous sales
- Geographic payment restrictions

**After ONE:**
- AI agents create content 24/7
- 0% blockchain fees
- Micropayments, subscriptions, bundles, autonomous
- Multi-agent collaboration
- AI buyers shop while you sleep
- Global crypto payments

**The Future:**
A creator sets up their ONE platform, and AI agents:
1. Create personalized courses for each student (**A2A + ACP**)
2. Market content across all platforms (**A2A delegation**)
3. Accept payments in crypto or fiat (**X402 + ACP**)
4. Auto-purchase tools/services as needed (**AP2 autonomous**)
5. Split revenue with collaborating agents (**ACPayments**)

**All running autonomously, 24/7, globally, with zero fees.**

That's the power of open protocol integration.

---

## Resources

- **A2A Protocol**: https://a2a-protocol.org/latest/
- **ACP (REST)**: https://agentcommunicationprotocol.dev/
- **X402**: https://www.x402.org/
- **AP2**: https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol
- **Agentic Commerce**: https://www.agenticcommerce.dev/
- **Our Docs**: docs/A2A.md, docs/ACP.md, docs/X402.md, docs/AP2.md, docs/ACPayments.md
