# Agent Payments Protocol (AP2) Integration

## Overview

**Agent Payments Protocol (AP2)** is an open protocol developed by Google in collaboration with over 60 organizations to securely initiate and transact agent-led payments across platforms. It's an extension of the Agent2Agent (A2A) protocol that enables AI agents to transact on behalf of users with cryptographic trust and compliance.

- **Developed By**: Google + 60+ partner organizations
- **Built On**: Agent2Agent (A2A) protocol
- **Key Innovation**: Cryptographically-signed "Mandates" for trust
- **Payment Support**: Credit cards, cryptocurrencies, bank transfers
- **Compliance**: Verifiable credentials (VCs) for audit trails

## Key Partners

- **Payment Processors**: Coinbase, Mastercard, Adyen
- **Financial Institutions**: American Express
- **Enterprise**: Salesforce
- **Web3**: Multiple blockchain platforms
- **60+ organizations** total

## How AP2 Works

### Trust Model: Mandates

AP2 establishes trust through cryptographically-signed digital contracts called **Mandates**:

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│     User     │ ──────> │   AI Agent   │ ──────> │   Merchant   │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │
       │  1. Intent Mandate     │                        │
       │  (What to buy)         │                        │
       │ ───────────────────────>                        │
       │                        │  2. Cart Mandate       │
       │                        │  (Immutable record)    │
       │                        │ ──────────────────────>│
       │                        │                        │
       │                        │  3. Payment Processing │
       │                        │ <──────────────────────│
       │  4. Confirmation       │                        │
       │ <──────────────────────                         │
```

### Two Transaction Models

#### 1. Real-Time Purchases (Human Present)

User is actively involved in the transaction:

```typescript
// Flow 1: Immediate purchase
User → Intent Mandate → Agent → Cart Mandate → Merchant → Payment
```

**Intent Mandate**: Captures user's request
- "Buy the best laptop under $1500"
- Signed by user
- Timestamp and context

**Cart Mandate**: Secure, unchangeable record
- Specific product(s)
- Final price
- Payment terms
- Cryptographically signed
- Non-repudiable

#### 2. Delegated Tasks (Human Not Present)

Agent acts autonomously based on pre-authorized rules:

```typescript
// Flow 2: Autonomous execution
User → Detailed Intent Mandate → Agent monitors → Conditions met → Auto Cart Mandate → Payment
```

**Detailed Intent Mandate**: Transaction rules
- Budget constraints
- Timing windows
- Approval thresholds
- Fallback actions

**Autonomous Cart Generation**: Agent creates Cart Mandate when conditions are met
- No human in the loop
- Pre-authorized by Intent Mandate
- Verifiable audit trail

## Technical Architecture

### Verifiable Credentials (VCs)

AP2 uses cryptographic VCs for trust:

```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential", "IntentMandate"],
  "issuer": "did:user:abc123",
  "issuanceDate": "2025-10-05T00:00:00Z",
  "credentialSubject": {
    "agentDID": "did:agent:xyz789",
    "intent": {
      "action": "purchase",
      "constraints": {
        "maxPrice": 1500,
        "category": "laptops",
        "features": ["16GB RAM", "1TB SSD"]
      }
    }
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2025-10-05T00:00:00Z",
    "verificationMethod": "did:user:abc123#key-1",
    "proofPurpose": "assertionMethod",
    "proofValue": "z58DAdFfa9SkqZMVPxAQp..."
  }
}
```

### Non-Repudiation

Every mandate creates an immutable audit trail:

1. **Intent Mandate** signed by user
2. **Cart Mandate** signed by agent
3. **Payment Receipt** signed by merchant
4. **Fulfillment Record** signed by logistics

All stored on distributed ledger or trusted storage.

## Use Cases

### 1. Smarter Shopping

**Scenario**: Automated price monitoring and purchase

```typescript
// User sets up Intent Mandate
{
  product: "Sony WH-1000XM5 Headphones",
  maxPrice: 300,
  validUntil: "2025-12-31",
  autoExecute: true
}

// Agent monitors prices
// When price drops to $279, agent auto-purchases
```

### 2. Personalized Merchant Offers

**Scenario**: Dynamic pricing based on user preferences

```typescript
// Merchant detects agent shopping
{
  agentDID: "did:agent:user123",
  userPreferences: ["eco-friendly", "premium"],
  currentCart: 450
}

// Merchant creates personalized offer
{
  discount: 15%, // for eco-preference match
  bundleOffer: "Free carbon-neutral shipping",
  validFor: "30 minutes"
}
```

### 3. Coordinated Multi-Platform Bookings

**Scenario**: Book entire vacation across platforms

```typescript
// Intent Mandate: "Book 5-day Hawaii vacation for 2, budget $3000"

Agent coordinates:
1. Flights → Agent contacts airline APIs
2. Hotel → Agent contacts Booking.com
3. Car rental → Agent contacts Hertz
4. Activities → Agent contacts Viator

// Single Cart Mandate with all items
{
  flight: $800,
  hotel: $1200,
  car: $300,
  activities: $400,
  total: $2700, // Under budget!
  payment: "Split across 2 cards"
}
```

### 4. Autonomous B2B Procurement

**Scenario**: Auto-reorder office supplies

```typescript
// Intent Mandate: "Keep 20+ boxes of paper in stock"

Agent monitors:
- Current inventory: 18 boxes
- Trigger: < 20 boxes
- Action: Order 30 boxes from approved vendor

// Cart Mandate auto-generated
{
  vendor: "Office Depot",
  product: "Paper, Letter, 10 ream case",
  quantity: 3,
  price: 120,
  approvalLevel: "auto" // Pre-approved by Intent
}
```

### 5. Enterprise Software License Scaling

**Scenario**: Auto-scale SaaS licenses

```typescript
// Intent Mandate: "Maintain Slack licenses for all employees"

Agent monitors:
- Current licenses: 500
- Active employees: 515
- Action: Purchase 20 more licenses (buffer)

// Cart Mandate
{
  service: "Slack Business+",
  quantity: 20,
  pricePerSeat: 12.50,
  total: 250,
  billingCycle: "monthly"
}
```

## Integration with ONE Platform

### Ontology Mapping

Using our 4-table ontology:

#### Entities

```typescript
// Intent Mandate (user instruction to agent)
{
  type: "intent_mandate",
  name: "Purchase laptop under $1500",
  properties: {
    userId: userId,
    agentId: agentId,
    intent: {
      action: "purchase",
      constraints: {
        maxPrice: 1500,
        category: "laptops",
        features: ["16GB RAM", "1TB SSD"]
      }
    },
    validUntil: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    autoExecute: true,
    signature: "0x...", // Cryptographic signature
    credentialHash: "sha256:..."
  },
  status: "active",
  createdAt: Date.now()
}

// Cart Mandate (immutable purchase record)
{
  type: "cart_mandate",
  name: "Laptop purchase order",
  properties: {
    intentMandateId: intentMandateId,
    agentId: agentId,
    merchantId: merchantId,
    items: [
      {
        productId: "prod_123",
        name: "Dell XPS 15",
        price: 1399,
        quantity: 1
      }
    ],
    subtotal: 1399,
    tax: 112,
    total: 1511, // Wait, over budget!
    status: "pending_approval", // Requires human approval
    signature: "0x...",
    credentialHash: "sha256:..."
  },
  createdAt: Date.now()
}

// Payment transaction
{
  type: "ap2_transaction",
  name: "AP2 Payment",
  properties: {
    cartMandateId: cartMandateId,
    amount: 1511,
    currency: "USD",
    paymentMethod: "credit_card", // or "crypto", "bank_transfer"
    paymentProvider: "stripe", // or "coinbase", "adyen"
    status: "completed",
    transactionHash: "tx_abc123",
    confirmationNumber: "AP2-2025-XYZ"
  }
}
```

#### Connections

```typescript
// User authorizes agent
{
  fromEntityId: userId,
  toEntityId: agentId,
  relationshipType: "authorizes_payments",
  metadata: {
    maxPerTransaction: 2000,
    dailyLimit: 5000,
    allowedCategories: ["electronics", "software"],
    requiresApproval: true // for purchases > $1000
  },
  createdAt: Date.now()
}

// Intent Mandate → Cart Mandate
{
  fromEntityId: intentMandateId,
  toEntityId: cartMandateId,
  relationshipType: "fulfills_intent",
  metadata: {
    matchScore: 0.95, // How well cart matches intent
    deviations: [] // Any deviations from intent
  },
  createdAt: Date.now()
}

// Cart Mandate → Payment
{
  fromEntityId: cartMandateId,
  toEntityId: transactionId,
  relationshipType: "paid_via",
  metadata: {
    paymentProvider: "stripe",
    processingTime: 1500 // ms
  },
  createdAt: Date.now()
}

// Agent → Merchant
{
  fromEntityId: agentId,
  toEntityId: merchantId,
  relationshipType: "transacted_with",
  metadata: {
    totalSpent: 1511,
    transactionCount: 1,
    trustScore: 0.98
  },
  createdAt: Date.now()
}
```

#### Events

```typescript
// Intent Mandate created
{
  entityId: intentMandateId,
  eventType: "ap2_intent_created",
  timestamp: Date.now(),
  actorType: "user",
  actorId: userId,
  metadata: {
    agentId: agentId,
    maxBudget: 1500,
    autoExecute: true
  }
}

// Agent monitors market
{
  entityId: intentMandateId,
  eventType: "ap2_price_check",
  timestamp: Date.now(),
  actorType: "agent",
  actorId: agentId,
  metadata: {
    productId: "prod_123",
    currentPrice: 1399,
    targetPrice: 1500,
    withinBudget: true
  }
}

// Cart Mandate generated
{
  entityId: cartMandateId,
  eventType: "ap2_cart_created",
  timestamp: Date.now(),
  actorType: "agent",
  actorId: agentId,
  metadata: {
    intentMandateId: intentMandateId,
    itemCount: 1,
    total: 1511,
    requiresApproval: true // Over base price due to tax
  }
}

// Human approves (since total > maxPrice after tax)
{
  entityId: cartMandateId,
  eventType: "ap2_cart_approved",
  timestamp: Date.now(),
  actorType: "user",
  actorId: userId,
  metadata: {
    approvalMethod: "push_notification",
    responseTime: 45000 // 45 seconds
  }
}

// Payment processed
{
  entityId: transactionId,
  eventType: "ap2_payment_completed",
  timestamp: Date.now(),
  actorType: "payment_processor",
  metadata: {
    provider: "stripe",
    amount: 1511,
    paymentMethod: "card_ending_4242"
  }
}

// Product delivered
{
  entityId: cartMandateId,
  eventType: "ap2_fulfillment_complete",
  timestamp: Date.now(),
  actorType: "merchant",
  actorId: merchantId,
  metadata: {
    trackingNumber: "1Z999AA1...",
    deliveryDate: Date.now() + 2 * 24 * 60 * 60 * 1000
  }
}
```

#### Tags

```typescript
{
  name: "ap2-enabled",
  type: "protocol",
  category: "payments"
}

{
  name: "autonomous-payment",
  type: "payment_mode",
  category: "ap2"
}

{
  name: "verifiable-credential",
  type: "trust_mechanism",
  category: "ap2"
}

{
  name: "multi-platform-booking",
  type: "use_case",
  category: "ap2"
}
```

### Technical Implementation

#### 1. Service Layer (Effect.ts)

```typescript
// convex/services/payments/ap2Service.ts
export class AP2Service extends Effect.Service<AP2Service>()(
  "AP2Service",
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;
      const crypto = yield* CryptoProvider;
      const payment = yield* PaymentProvider;

      return {
        // User creates Intent Mandate
        createIntentMandate: (args: {
          userId: Id<"entities">;
          agentId: Id<"entities">;
          intent: IntentSpec;
          autoExecute: boolean;
          validUntil: number;
        }) =>
          Effect.gen(function* () {
            // 1. Generate verifiable credential
            const vc = yield* crypto.signCredential({
              type: "IntentMandate",
              issuer: args.userId,
              subject: args.agentId,
              claims: {
                intent: args.intent,
                autoExecute: args.autoExecute,
                validUntil: args.validUntil
              }
            });

            // 2. Create Intent Mandate entity
            const mandateId = yield* Effect.tryPromise(() =>
              db.insert("entities", {
                type: "intent_mandate",
                name: `Intent: ${args.intent.action}`,
                properties: {
                  userId: args.userId,
                  agentId: args.agentId,
                  intent: args.intent,
                  autoExecute: args.autoExecute,
                  validUntil: args.validUntil,
                  signature: vc.proof.proofValue,
                  credentialHash: vc.hash
                },
                status: "active",
                createdAt: Date.now(),
                updatedAt: Date.now()
              })
            );

            // 3. Create authorization connection
            yield* Effect.tryPromise(() =>
              db.insert("connections", {
                fromEntityId: args.userId,
                toEntityId: args.agentId,
                relationshipType: "authorizes_payments",
                metadata: {
                  mandateId: mandateId,
                  constraints: args.intent.constraints
                },
                createdAt: Date.now()
              })
            );

            // 4. Log event
            yield* Effect.tryPromise(() =>
              db.insert("events", {
                entityId: mandateId,
                eventType: "ap2_intent_created",
                timestamp: Date.now(),
                actorType: "user",
                actorId: args.userId,
                metadata: {
                  agentId: args.agentId,
                  autoExecute: args.autoExecute
                }
              })
            );

            return { mandateId, credential: vc };
          }),

        // Agent creates Cart Mandate
        createCartMandate: (args: {
          intentMandateId: Id<"entities">;
          agentId: Id<"entities">;
          merchantId: Id<"entities">;
          items: CartItem[];
        }) =>
          Effect.gen(function* () {
            // 1. Validate against Intent Mandate
            const intentMandate = yield* Effect.tryPromise(() =>
              db.get(args.intentMandateId)
            );

            if (intentMandate.properties.agentId !== args.agentId) {
              return yield* Effect.fail({
                _tag: "UnauthorizedAgent",
                message: "Agent not authorized for this intent"
              });
            }

            // 2. Calculate totals
            const subtotal = args.items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            );
            const tax = subtotal * 0.08; // 8% tax example
            const total = subtotal + tax;

            // 3. Check if within budget
            const maxPrice = intentMandate.properties.intent.constraints.maxPrice;
            const requiresApproval = !intentMandate.properties.autoExecute ||
                                     total > maxPrice;

            // 4. Sign Cart Mandate
            const vc = yield* crypto.signCredential({
              type: "CartMandate",
              issuer: args.agentId,
              claims: {
                intentMandateId: args.intentMandateId,
                items: args.items,
                total: total,
                merchantId: args.merchantId
              }
            });

            // 5. Create Cart Mandate entity
            const cartId = yield* Effect.tryPromise(() =>
              db.insert("entities", {
                type: "cart_mandate",
                name: `Cart for Intent ${args.intentMandateId}`,
                properties: {
                  intentMandateId: args.intentMandateId,
                  agentId: args.agentId,
                  merchantId: args.merchantId,
                  items: args.items,
                  subtotal,
                  tax,
                  total,
                  status: requiresApproval ? "pending_approval" : "approved",
                  signature: vc.proof.proofValue,
                  credentialHash: vc.hash
                },
                status: "active",
                createdAt: Date.now(),
                updatedAt: Date.now()
              })
            );

            // 6. Create connection
            yield* Effect.tryPromise(() =>
              db.insert("connections", {
                fromEntityId: args.intentMandateId,
                toEntityId: cartId,
                relationshipType: "fulfills_intent",
                metadata: {
                  withinBudget: total <= maxPrice,
                  requiresApproval
                },
                createdAt: Date.now()
              })
            );

            // 7. Log event
            yield* Effect.tryPromise(() =>
              db.insert("events", {
                entityId: cartId,
                eventType: "ap2_cart_created",
                timestamp: Date.now(),
                actorType: "agent",
                actorId: args.agentId,
                metadata: {
                  intentMandateId: args.intentMandateId,
                  total,
                  requiresApproval
                }
              })
            );

            // 8. Auto-execute if approved
            if (!requiresApproval) {
              return yield* this.processPayment({
                cartMandateId: cartId,
                paymentMethod: "default"
              });
            }

            return { cartId, requiresApproval: true };
          }),

        // Process payment
        processPayment: (args: {
          cartMandateId: Id<"entities">;
          paymentMethod: string;
        }) =>
          Effect.gen(function* () {
            // 1. Get Cart Mandate
            const cart = yield* Effect.tryPromise(() =>
              db.get(args.cartMandateId)
            );

            if (cart.properties.status !== "approved") {
              return yield* Effect.fail({
                _tag: "CartNotApproved",
                message: "Cart must be approved before payment"
              });
            }

            // 2. Process payment
            const paymentResult = yield* payment.charge({
              amount: cart.properties.total,
              currency: "USD",
              method: args.paymentMethod,
              metadata: {
                cartMandateId: args.cartMandateId,
                protocol: "AP2"
              }
            });

            // 3. Create transaction entity
            const txId = yield* Effect.tryPromise(() =>
              db.insert("entities", {
                type: "ap2_transaction",
                name: `AP2 Payment ${paymentResult.id}`,
                properties: {
                  cartMandateId: args.cartMandateId,
                  amount: cart.properties.total,
                  currency: "USD",
                  paymentMethod: args.paymentMethod,
                  paymentProvider: paymentResult.provider,
                  status: "completed",
                  transactionHash: paymentResult.id,
                  confirmationNumber: `AP2-${Date.now()}`
                },
                status: "active",
                createdAt: Date.now(),
                updatedAt: Date.now()
              })
            );

            // 4. Create connection
            yield* Effect.tryPromise(() =>
              db.insert("connections", {
                fromEntityId: args.cartMandateId,
                toEntityId: txId,
                relationshipType: "paid_via",
                metadata: {
                  paymentProvider: paymentResult.provider
                },
                createdAt: Date.now()
              })
            );

            // 5. Log event
            yield* Effect.tryPromise(() =>
              db.insert("events", {
                entityId: txId,
                eventType: "ap2_payment_completed",
                timestamp: Date.now(),
                actorType: "payment_processor",
                metadata: {
                  amount: cart.properties.total,
                  provider: paymentResult.provider
                }
              })
            );

            return { transactionId: txId, status: "completed" };
          }),

        // Approve Cart Mandate (human in loop)
        approveCart: (args: {
          cartMandateId: Id<"entities">;
          userId: Id<"entities">;
        }) =>
          Effect.gen(function* () {
            // Update cart status
            yield* Effect.tryPromise(() =>
              db.patch(args.cartMandateId, {
                properties: { status: "approved" },
                updatedAt: Date.now()
              })
            );

            // Log approval
            yield* Effect.tryPromise(() =>
              db.insert("events", {
                entityId: args.cartMandateId,
                eventType: "ap2_cart_approved",
                timestamp: Date.now(),
                actorType: "user",
                actorId: args.userId,
                metadata: {}
              })
            );

            return { approved: true };
          })
      };
    }),
    dependencies: [
      ConvexDatabase.Default,
      CryptoProvider.Default,
      PaymentProvider.Default
    ]
  }
) {}
```

#### 2. React Components

```typescript
// src/components/features/payments/AP2IntentCreator.tsx
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export function AP2IntentCreator({ userId, agentId }) {
  const createIntent = useMutation(api.ap2.createIntentMandate);
  const [maxPrice, setMaxPrice] = useState(1500);
  const [autoExecute, setAutoExecute] = useState(false);

  const handleCreate = async () => {
    await createIntent({
      userId,
      agentId,
      intent: {
        action: "purchase",
        constraints: {
          maxPrice,
          category: "laptops",
          features: ["16GB RAM", "1TB SSD"]
        }
      },
      autoExecute,
      validUntil: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create AP2 Intent Mandate</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Max Price ($)</label>
          <Input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Auto-Execute</label>
          <Switch
            checked={autoExecute}
            onCheckedChange={setAutoExecute}
          />
        </div>
        <Button onClick={handleCreate} className="w-full">
          Create Intent Mandate
        </Button>
      </CardContent>
    </Card>
  );
}
```

```typescript
// src/components/features/payments/AP2CartApproval.tsx
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AP2CartApproval({ userId }) {
  const pendingCarts = useQuery(api.ap2.listPendingCarts, { userId });
  const approveCart = useMutation(api.ap2.approveCart);

  const handleApprove = async (cartId) => {
    await approveCart({ cartMandateId: cartId, userId });
  };

  if (!pendingCarts?.length) {
    return <p className="text-muted-foreground">No pending approvals</p>;
  }

  return (
    <div className="space-y-4">
      {pendingCarts.map(cart => (
        <Card key={cart._id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>${cart.properties.total.toFixed(2)}</span>
              <Badge variant="secondary">Requires Approval</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              {cart.properties.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span>${item.price}</span>
                </div>
              ))}
            </div>
            <Button onClick={() => handleApprove(cart._id)} className="w-full">
              Approve Payment
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

## AP2 vs ACP Comparison

| Feature | AP2 (Google) | ACP (Stripe/OpenAI) |
|---------|-------------|---------------------|
| **Protocol Scope** | Agent-to-agent + payments | Agent-to-business commerce |
| **Trust Model** | Verifiable credentials (VCs) | Payment tokens |
| **Autonomous** | Full autonomy with mandates | Human present required |
| **Payment Methods** | Crypto, cards, bank transfers | Primarily Stripe |
| **Multi-Platform** | Native support | Single platform focus |
| **Web3 Support** | Yes (via A2A x402) | No |
| **Enterprise Focus** | B2B + B2C | Primarily B2C |
| **Audit Trail** | Cryptographic VCs | Payment receipts |

**Which to use?**
- **AP2**: Complex multi-platform bookings, autonomous B2B, crypto payments
- **ACP**: Simple e-commerce, Stripe-based, ChatGPT integration

**Can use both**: Implement both protocols for maximum agent compatibility

## Benefits for ONE Platform

### For Creators
- **Autonomous Sales**: Agents buy courses/content 24/7
- **Dynamic Pricing**: Personalized offers to agents
- **B2B Revenue**: Enterprises license content at scale
- **Cross-Platform**: Single course sold on multiple AI platforms

### For Audience
- **Smart Shopping**: Agents find best deals automatically
- **Delegated Learning**: "Keep me upskilled in React" → Agent buys courses
- **Coordinated Purchases**: Bundle courses across creators

### For Platform
- **Protocol Leadership**: Support both AP2 and ACP
- **Web3 Ready**: Crypto payments via AP2
- **Enterprise Scale**: B2B procurement automation
- **Audit Excellence**: Verifiable credential trail

## Implementation Checklist

- [ ] Study AP2 GitHub spec (link needed)
- [ ] Implement verifiable credentials system
- [ ] Create Intent Mandate schema
- [ ] Create Cart Mandate schema
- [ ] Build AP2Service with Effect.ts
- [ ] Add Convex mutations/queries
- [ ] Build React components for intent creation
- [ ] Build approval UI for cart mandates
- [ ] Integrate payment providers (Stripe, Coinbase)
- [ ] Add autonomous agent monitoring
- [ ] Write integration tests
- [ ] Document AP2 vs ACP decision matrix

## Security Considerations

1. **Cryptographic Signatures**: All mandates must be signed
2. **Verifiable Credentials**: Use W3C VC standard
3. **Budget Enforcement**: Hard limits on auto-execution
4. **Approval Thresholds**: Require human approval over limits
5. **Audit Trail**: Immutable event log
6. **Agent Reputation**: Track agent trustworthiness
7. **Merchant Validation**: Verify merchant credentials

## Future Enhancements

1. **Multi-Agent Coordination**: Multiple agents coordinate purchases
2. **Reputation System**: Agent trust scores
3. **Smart Contracts**: On-chain payment execution
4. **Predictive Intents**: AI predicts user needs
5. **Subscription Mandates**: Recurring payment authorization
6. **Budget Pools**: Shared budgets across multiple intents

## Resources

- **AP2 Announcement**: https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol
- **A2A Protocol**: Agent2Agent standard
- **W3C Verifiable Credentials**: https://www.w3.org/TR/vc-data-model/
- **AP2 GitHub**: (Awaiting public link)

## Conclusion

AP2 represents the future of autonomous commerce. By combining cryptographic trust (verifiable credentials) with flexible payment methods and multi-platform support, it enables truly autonomous agent transactions. Our ontology cleanly handles the Intent → Cart → Payment flow while maintaining full auditability and security.

The combination of AP2 (for autonomous, multi-platform, web3) and ACP (for simple e-commerce) positions ONE as the most agent-friendly creator platform.
