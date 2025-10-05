# ACPayments - Agent Collaboration Payment System

**Version:** 2.0.0
**Purpose:** Comprehensive payment and billing system for multi-agent collaboration, combining X402 protocol with Agentic Commerce Protocol (ACP)
**Related:** X402.md (HTTP payment protocol), Ontology.md (entity/event types)

---

## Overview

**ACPayments** integrates two complementary payment protocols to create a complete payment ecosystem for the ONE platform:

1. **X402 Protocol** - HTTP-native micropayments for API/agent services
2. **ACP (Agentic Commerce Protocol)** - AI agent-initiated product purchases

**Key Capabilities:**
- ✅ **Agent-to-Agent Payments** - Agents pay each other for services (X402)
- ✅ **AI Commerce** - Agents purchase products for users (ACP)
- ✅ **Workflow-Based Billing** - Multi-agent orchestration payments
- ✅ **Revenue Sharing** - Distribute payments across agents
- ✅ **Subscription Models** - Recurring access payments
- ✅ **Usage-Based Pricing** - Pay-per-use with automatic tracking
- ✅ **Escrow & Settlements** - Hold and release on completion

**Built On:**
- **X402 Protocol** - Micropayments for services
- **ACP (Stripe + OpenAI)** - AI-native product commerce
- **Effect.ts** - Type-safe payment services
- **Convex** - Real-time payment tracking
- **Multi-Chain** - Base, Ethereum, Solana support

---

## Part 1: Agentic Commerce Protocol (ACP)

### What is ACP?

**Agentic Commerce Protocol (ACP)** is an open standard developed by Stripe and OpenAI for programmatic commerce flows between buyers, AI agents, and businesses.

**License:** Apache 2.0 (open source)
**Compatibility:** REST and MCP (Model Context Protocol)
**First Implementation:** OpenAI's Instant Checkout in ChatGPT
**PSP:** Stripe (first compatible payment service provider)

### ACP Architecture

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│  AI Agent   │ ──────> │  Business   │ ──────> │    Stripe    │
│ (Buyer Rep) │ <────── │  (Merchant) │ <────── │     (PSP)    │
└─────────────┘         └─────────────┘         └──────────────┘
     │                        │                        │
     │  1. Discover Products  │                        │
     │  2. Initiate Purchase  │                        │
     │                   3. Accept/Decline             │
     │                   4. Process Payment ───────────>
     │                        │         5. Confirm ────┘
     │  6. Complete Order     │
```

### ACP Features

**1. Open Standard**
- Community-designed protocol
- Works with any AI agent or payment processor
- No vendor lock-in

**2. Merchant Control**
- Merchants remain "merchant of record"
- Full control over product presentation
- Accept/decline transactions per agent or transaction
- Support for multiple commerce types:
  - Physical goods
  - Digital goods
  - Subscriptions
  - Async purchases

**3. Security & Compliance**
- PCI compliant
- Secure payment credential handling
- Payment token passing between buyers and businesses

### ACP Ontology Integration

#### Entity Types

**New Types:**
```typescript
| 'product'              // Sellable product/service
| 'payment_transaction'  // ACP transaction record
```

**Product Properties:**
```typescript
{
  type: "product",
  name: "Course: Web Development",
  properties: {
    price: 99.00,
    currency: "USD",
    productType: "digital_good", // or "physical_good", "subscription"
    acpEnabled: true,
    stripeProductId: "prod_xxx",
    inventory?: number,
    fulfillmentMethod: "digital_download" | "shipping" | "email",
    description: string,
    images: string[],
  }
}
```

**Payment Transaction Properties:**
```typescript
{
  type: "payment_transaction",
  name: "ACP Payment via ChatGPT",
  properties: {
    protocol: "acp",
    amount: 99.00,
    currency: "USD",
    status: "pending" | "approved" | "declined" | "completed" | "refunded",
    paymentMethod: "acp",
    agentPlatform: "chatgpt" | "claude" | "gemini",
    stripePaymentId: "pi_xxx",
    merchantId: Id<'entities'>,
    productId: Id<'entities'>,
    buyerId: Id<'entities'>,
    agentId: Id<'entities'>,
    declineReason?: string,
    refundReason?: string,
    completedAt?: number,
  }
}
```

#### Event Types

Uses existing event types:

```typescript
// ACP purchase initiated
{
  type: 'commerce_event',
  actorId: agentId,
  targetId: transactionId,
  timestamp: Date.now(),
  metadata: {
    eventType: 'purchase_initiated',
    protocol: 'acp',
    agentPlatform: 'chatgpt',
    productId: productId,
    amount: 99.00
  }
}

// Merchant approval decision
{
  type: 'commerce_event',
  actorId: merchantId,
  targetId: transactionId,
  timestamp: Date.now(),
  metadata: {
    eventType: 'transaction_decision',
    protocol: 'acp',
    approved: true,
    processingTime: 150
  }
}

// Payment completed
{
  type: 'payment_completed',
  actorId: stripeEntityId,
  targetId: transactionId,
  timestamp: Date.now(),
  metadata: {
    protocol: 'acp',
    stripePaymentId: 'pi_xxx',
    amount: 99.00,
    fee: 3.20
  }
}

// Product delivered
{
  type: 'content_changed',
  actorId: systemId,
  targetId: productId,
  timestamp: Date.now(),
  metadata: {
    action: 'delivered',
    protocol: 'acp',
    buyerId: buyerId,
    deliveryMethod: 'digital_download',
    transactionId: transactionId
  }
}
```

### ACP Service Implementation

**File:** `convex/services/acp-payment.ts`

```typescript
import { Effect } from 'effect';
import { ConvexDatabase } from './convex-database';
import type { Id } from '../_generated/dataModel';

export class ACPPaymentService extends Effect.Service<ACPPaymentService>()(
  'ACPPaymentService',
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;

      return {
        /**
         * Agent initiates product purchase
         */
        initiatePurchase: (args: {
          agentId: Id<'entities'>;
          productId: Id<'entities'>;
          buyerId: Id<'entities'>;
          agentPlatform: 'chatgpt' | 'claude' | 'gemini';
        }) =>
          Effect.gen(function* () {
            // 1. Validate product is ACP-enabled
            const product = yield* db.get(args.productId);

            if (!product.properties.acpEnabled) {
              yield* Effect.fail(
                new Error('Product is not enabled for Agentic Commerce')
              );
            }

            // 2. Create transaction entity
            const transactionId = yield* db.insert('entities', {
              type: 'payment_transaction',
              name: `ACP Transaction ${Date.now()}`,
              properties: {
                protocol: 'acp',
                amount: product.properties.price as number,
                currency: (product.properties.currency as string) || 'USD',
                status: 'pending',
                paymentMethod: 'acp',
                agentPlatform: args.agentPlatform,
                productId: args.productId,
                buyerId: args.buyerId,
                agentId: args.agentId,
                merchantId: product.properties.merchantId as Id<'entities'>,
              },
              status: 'active',
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });

            // 3. Create connection: agent → transaction
            yield* db.insert('connections', {
              fromEntityId: args.agentId,
              toEntityId: transactionId,
              relationshipType: 'initiated',
              metadata: {
                type: 'purchase_initiation',
                timestamp: Date.now(),
              },
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });

            // 4. Log event
            yield* db.insert('events', {
              type: 'commerce_event',
              actorId: args.agentId,
              targetId: transactionId,
              timestamp: Date.now(),
              metadata: {
                eventType: 'purchase_initiated',
                protocol: 'acp',
                agentPlatform: args.agentPlatform,
                productId: args.productId,
                amount: product.properties.price,
              },
            });

            return { transactionId, status: 'pending' };
          }),

        /**
         * Merchant approves/declines transaction
         */
        processTransaction: (args: {
          transactionId: Id<'entities'>;
          merchantId: Id<'entities'>;
          approved: boolean;
          reason?: string;
        }) =>
          Effect.gen(function* () {
            const transaction = yield* db.get(args.transactionId);

            if (transaction.properties.status !== 'pending') {
              yield* Effect.fail(
                new Error('Transaction is not in pending state')
              );
            }

            // Update transaction status
            yield* db.patch(args.transactionId, {
              'properties.status': args.approved ? 'approved' : 'declined',
              'properties.declineReason': args.reason,
              updatedAt: Date.now(),
            });

            // Create approval connection
            yield* db.insert('connections', {
              fromEntityId: args.merchantId,
              toEntityId: args.transactionId,
              relationshipType: args.approved ? 'approved' : 'rejected',
              metadata: {
                reason: args.reason,
                timestamp: Date.now(),
              },
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });

            // Log event
            yield* db.insert('events', {
              type: 'commerce_event',
              actorId: args.merchantId,
              targetId: args.transactionId,
              timestamp: Date.now(),
              metadata: {
                eventType: 'transaction_decision',
                protocol: 'acp',
                approved: args.approved,
                reason: args.reason,
              },
            });

            // If approved, process payment
            if (args.approved) {
              return yield* processStripePayment({
                transactionId: args.transactionId,
                amount: transaction.properties.amount as number,
                currency: (transaction.properties.currency as string) || 'USD',
              });
            }

            return { success: true, status: 'declined' };
          }),
      };
    }),
    dependencies: [ConvexDatabase.Default],
  }
) {}

// Helper: Process Stripe payment
const processStripePayment = (args: {
  transactionId: Id<'entities'>;
  amount: number;
  currency: string;
}) =>
  Effect.gen(function* () {
    const db = yield* ConvexDatabase;

    // Create Stripe payment intent (simplified)
    const paymentIntentId = `pi_${Date.now()}`;

    // Update transaction
    yield* db.patch(args.transactionId, {
      'properties.stripePaymentId': paymentIntentId,
      'properties.status': 'completed',
      'properties.completedAt': Date.now(),
      updatedAt: Date.now(),
    });

    // Log completion
    yield* db.insert('events', {
      type: 'payment_completed',
      actorId: 'system' as Id<'entities'>,
      targetId: args.transactionId,
      timestamp: Date.now(),
      metadata: {
        protocol: 'acp',
        stripePaymentId: paymentIntentId,
        amount: args.amount,
        currency: args.currency,
      },
    });

    return {
      success: true,
      paymentIntentId,
      status: 'completed',
    };
  });
```

---

## Part 2: X402 + Multi-Agent Workflows

### X402 Service Integration

See **X402.md** for complete X402 protocol implementation.

**Key X402 Features:**
- HTTP 402 status code payment flow
- Micropayments ($0.001+)
- Multi-chain support (Base, Ethereum, Solana)
- Instant settlement (~2 seconds)

### Multi-Agent Revenue Sharing

**File:** `convex/services/agent-payment.ts`

```typescript
import { Effect } from 'effect';
import { ConvexDatabase } from './convex-database';
import { X402PaymentService } from './x402-payment';
import type { Id } from '../_generated/dataModel';

export class AgentPaymentService extends Effect.Service<AgentPaymentService>()(
  'AgentPaymentService',
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;
      const x402 = yield* X402PaymentService;

      return {
        /**
         * Create revenue split for multi-agent workflow
         */
        createRevenueSplit: (args: {
          workflowId: Id<'entities'>;
          totalAmount: string;
          participants: Array<{
            agentId: Id<'entities'>;
            percentage: number; // 0-100
          }>;
        }) =>
          Effect.gen(function* () {
            // Validate percentages sum to 100
            const totalPercentage = args.participants.reduce(
              (sum, p) => sum + p.percentage,
              0
            );
            if (totalPercentage !== 100) {
              yield* Effect.fail(
                new Error(`Revenue split must sum to 100%, got ${totalPercentage}%`)
              );
            }

            // Create revenue split entity
            const revenueSplitId = yield* db.insert('entities', {
              type: 'revenue_split',
              name: `Revenue Split: ${args.workflowId}`,
              properties: {
                workflowId: args.workflowId,
                totalAmount: args.totalAmount,
                asset: 'USDC',
                participants: args.participants,
                status: 'pending',
                createdAt: Date.now(),
              },
              status: 'active',
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });

            return { revenueSplitId, participants: args.participants };
          }),

        /**
         * Distribute revenue to participants
         */
        distributeRevenue: (args: { revenueSplitId: Id<'entities'> }) =>
          Effect.gen(function* () {
            const revenueSplit = yield* db.get(args.revenueSplitId);
            const { totalAmount, participants } = revenueSplit.properties as {
              totalAmount: string;
              participants: Array<{
                agentId: Id<'entities'>;
                percentage: number;
              }>;
            };

            const total = parseFloat(totalAmount);
            const distributions = [];

            // Distribute to each participant
            for (const participant of participants) {
              const amount = (total * participant.percentage) / 100;

              const payment = yield* db.insert('entities', {
                type: 'payment',
                name: `Revenue Share: ${participant.percentage}%`,
                properties: {
                  protocol: 'revenue-split',
                  revenueSplitId: args.revenueSplitId,
                  recipientId: participant.agentId,
                  amount: amount.toFixed(6),
                  asset: 'USDC',
                  percentage: participant.percentage,
                  status: 'completed',
                  completedAt: Date.now(),
                },
                status: 'active',
                createdAt: Date.now(),
                updatedAt: Date.now(),
              });

              distributions.push({
                agentId: participant.agentId,
                amount: amount.toFixed(6),
                paymentId: payment,
              });
            }

            // Update revenue split status
            yield* db.patch(args.revenueSplitId, {
              'properties.status': 'distributed',
              'properties.distributedAt': Date.now(),
              updatedAt: Date.now(),
            });

            return { distributions, status: 'distributed' };
          }),
      };
    }),
    dependencies: [ConvexDatabase.Default, X402PaymentService.Default],
  }
) {}
```

---

## Part 3: Frontend Components

### ACP Checkout Component

**File:** `src/components/payment/ACPCheckout.tsx`

```tsx
import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Id } from '@/convex/_generated/dataModel';

interface ACPCheckoutProps {
  productId: Id<'entities'>;
  agentId: Id<'entities'>;
  buyerId: Id<'entities'>;
  agentPlatform: 'chatgpt' | 'claude' | 'gemini';
}

export function ACPCheckout({ productId, agentId, buyerId, agentPlatform }: ACPCheckoutProps) {
  const initiate = useMutation(api.acpPayments.initiatePurchase);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await initiate({
        productId,
        agentId,
        buyerId,
        agentPlatform,
      });

      console.log('Purchase initiated:', result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Badge variant="secondary">ACP Enabled</Badge>
          Instant Checkout
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <Button
          onClick={handlePurchase}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? 'Processing...' : 'Purchase via AI Agent'}
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Merchant Approval Dashboard

**File:** `src/components/payment/ACPMerchantDashboard.tsx`

```tsx
import React from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Id } from '@/convex/_generated/dataModel';

interface ACPMerchantDashboardProps {
  merchantId: Id<'entities'>;
}

export function ACPMerchantDashboard({ merchantId }: ACPMerchantDashboardProps) {
  const pendingTransactions = useQuery(
    api.acpPayments.listPendingTransactions,
    { merchantId }
  );
  const processTransaction = useMutation(api.acpPayments.processTransaction);

  const handleApprove = async (transactionId: Id<'entities'>) => {
    await processTransaction({
      transactionId,
      merchantId,
      approved: true,
    });
  };

  const handleDecline = async (transactionId: Id<'entities'>, reason: string) => {
    await processTransaction({
      transactionId,
      merchantId,
      approved: false,
      reason,
    });
  };

  if (!pendingTransactions?.length) {
    return (
      <div className="text-center text-muted-foreground">
        No pending transactions
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingTransactions.map((tx) => (
        <Card key={tx._id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                ${tx.properties.amount} {tx.properties.currency}
              </span>
              <Badge variant="secondary">{tx.properties.agentPlatform}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button onClick={() => handleApprove(tx._id)} className="flex-1">
              Approve
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDecline(tx._id, 'Manual review required')}
              className="flex-1"
            >
              Decline
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

## Summary

### ACPayments Unified System

**Protocols:**
- ✅ **ACP (Agentic Commerce Protocol)** - AI agent product purchases
- ✅ **X402 Protocol** - HTTP-native API/service micropayments

**New Entity Types:** 5
- `product` (ACP)
- `payment_transaction` (ACP)
- `revenue_split` (multi-agent)
- `subscription` (recurring)
- `escrow` (workflow payments)

**Existing Types Reused:**
- `payment` (all payment records)
- `conversation` (payment context)
- `message` (payment notifications)

**Breaking Changes:** ZERO

**Key Features:**
- ✅ AI commerce (ACP with Stripe)
- ✅ Service micropayments (X402)
- ✅ Multi-agent revenue sharing
- ✅ Workflow escrow
- ✅ Subscription billing
- ✅ Usage tracking

🎉 **Result:** Complete payment ecosystem for AI-native platform with both product commerce and service micropayments.

## Resources

- **ACP Website**: https://www.agenticcommerce.dev/
- **Stripe ACP Docs**: https://stripe.com/docs/agentic-commerce
- **X402 Protocol**: https://www.x402.org/
- **X402 GitHub**: https://github.com/coinbase/x402
- **OpenAI Instant Checkout**: https://platform.openai.com/docs/instant-checkout
