# Workflow - Ontology-Driven Development

**Version:** 1.0.0
**Purpose:** Define the exact workflow for building features on the ONE Platform using the 4-table ontology

---

## Overview

Every feature in ONE Platform follows a 6-phase workflow that ensures consistency, quality, and adherence to the ontology. This workflow prevents technical debt and makes AI agents more effective at code generation.

**The Golden Rule:** If you can't map your feature to the 4 tables (things, connections, events, tags), you're thinking about it wrong.

---

## The 6-Phase Workflow

```
Phase 1: UNDERSTAND
  ↓
Phase 2: MAP TO ONTOLOGY
  ↓
Phase 3: DESIGN SERVICES
  ↓
Phase 4: IMPLEMENT BACKEND
  ↓
Phase 5: BUILD FRONTEND
  ↓
Phase 6: TEST & DOCUMENT
```

---

## Phase 1: UNDERSTAND

**Goal:** Fully understand the feature requirements and context.

### Step 1.1: Read Context Documentation

**MANDATORY READING ORDER:**

1. **`one/connections/ontology.md`** (5 min) - The 4-table universe
2. **`one/things/README.md`** (2 min) - Understand thing types
3. **`one/connections/README.md`** (2 min) - Understand connection types
4. **`one/events/README.md`** (2 min) - Understand event types
5. **`one/things/files.md`** (3 min) - File organization

**For specific features, also read:**
- **Blockchain features:** `one/things/Sui.md`, `one/connections/cryptonetworks.md`
- **Inference features:** `one/events/InferenceRevenue.md`
- **Protocol features:** `one/connections/protocols.md` + specific protocol doc
- **Integration features:** `one/connections/communications.md` + specific integration doc
- **Agent features:** `one/things/AgentKit.md`, `one/things/CopilotKit.md`

### Step 1.2: Identify Feature Category

**Ask yourself:**
- Is this a new entity type?
- Is this a new relationship?
- Is this a new action/event?
- Is this a query/reporting feature?
- Does it involve external protocols (A2A, ACP, AP2, X402)?
- Does it involve blockchain (SUI, Solana, Base)?

### Step 1.3: Find Similar Patterns

**Search for existing implementations:**
- Similar entity types in `convex/schema.ts`
- Similar mutations in `convex/mutations/`
- Similar queries in `convex/queries/`
- Similar services in `convex/services/`
- Similar components in `src/components/features/`

**Example:**
If building "NFT Minting", search for:
- Token minting patterns
- Blockchain transaction patterns
- Payment processing patterns

---

## Phase 2: MAP TO ONTOLOGY

**Goal:** Map the feature to the 4-table ontology BEFORE writing any code.

### Step 2.1: Identify Things

**Question:** What entities are involved?

**Template:**
```
Things:
  - <thing_name> (type: "<thing_type>")
    properties: { <key properties> }
  - <thing_name> (type: "<thing_type>")
    properties: { <key properties> }
```

**Example: Token Purchase**
```
Things:
  - user (type: "creator" or "audience_member")
    properties: { email, walletAddress }
  - token (type: "token")
    properties: { contractAddress, totalSupply, price }
```

### Step 2.2: Identify Connections

**Question:** How do entities relate to each other?

**Template:**
```
Connections:
  - <from_thing> → <to_thing> (relationshipType: "<type>")
    metadata: { <relationship details> }
```

**Example: Token Purchase**
```
Connections:
  - user → token (relationshipType: "holds_tokens")
    metadata: {
      balance: 100,
      balanceObjectId: "0x123...",  // SUI coin object
      walletAddress: "0xabc...",
      acquiredAt: Date.now()
    }
```

### Step 2.3: Identify Events

**Question:** What actions need to be logged?

**Template:**
```
Events:
  - <event_type>
    actorId: <who_did_it>
    targetId: <what_it_affected>
    metadata: { <event details> }
```

**Example: Token Purchase**
```
Events:
  - tokens_purchased
    actorId: userId
    targetId: tokenId
    metadata: {
      network: "sui",
      amount: 100,
      paidAmount: 0.5,  // SUI paid
      txDigest: "9mKG...",
    }
```

### Step 2.4: Tags & Knowledge

**Question:** What categorization or semantic data is needed?

Use tags for categorization; use knowledge items for RAG when needed.

**Template:**
```
Tags:
  - thingTags: [<tag1>, <tag2>] // applied via junction

Knowledge (optional):
  - knowledge_item things for chunks/summaries
  - embedding things for vectors when stored explicitly
```

**Example: Token Purchase**
```
Tags:
  - ["network:sui", "protocol:sui-move", "status:active"]

Knowledge:
  - None (tokens typically don’t require RAG)
```

### Step 2.5: Validate Ontology Mapping

**Checklist:**
- [ ] All entities map to existing thing types (or propose new type)
- [ ] All relationships use existing connection types
- [ ] All events use existing event types
- [ ] Metadata captures protocol/network specifics
- [ ] No custom tables needed (everything fits in 4 tables)

**If validation fails:** Re-think the feature. The ontology is intentionally complete.

### Step 2.6: Protocol Mapping

Declare protocol usage explicitly across primitives.

- Thing: set `properties.protocol` (e.g., `openai`, `ap2`, `acp`, `x402`, `sui`).
- Connection: set `metadata.protocol` for protocol-scoped relationships.
- Event: set `metadata.protocol` and echo key protocol fields (ids, tx hashes, network, status).

---

## Phase 3: DESIGN SERVICES

**Goal:** Design pure Effect.ts services for business logic.

### Step 3.1: Define Service Interface

**Pattern:**
```typescript
// convex/services/<category>/<service>.ts
export class <Service>Service extends Effect.Service<<Service>Service>()(
  "<Service>Service",
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;
      const <provider> = yield* <Provider>;

      return {
        <method>: (args: <Args>) =>
          Effect.gen(function* () {
            // Business logic here
          }),
      };
    }),
    dependencies: [ConvexDatabase.Default, <Provider>.Default],
  }
) {}
```

**Example: Token Purchase Service**
```typescript
// convex/services/blockchain/token.ts
export class TokenService extends Effect.Service<TokenService>()(
  "TokenService",
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;
      const sui = yield* SuiProvider;

      return {
        purchase: (args: PurchaseTokenArgs) =>
          Effect.gen(function* () {
            // 1. Validate
            const user = yield* Effect.tryPromise(() => db.get(args.userId));
            const token = yield* Effect.tryPromise(() => db.get(args.tokenId));

            if (!user) {
              return yield* Effect.fail(new UserNotFoundError());
            }

            // 2. Execute blockchain transaction
            const tx = new Transaction();
            // ... build transaction
            const result = yield* sui.executeTransaction(tx);

            // 3. Create/update connection
            yield* Effect.tryPromise(() =>
              db.insert("connections", {
                fromThingId: args.userId,
                toThingId: args.tokenId,
                relationshipType: "holds_tokens",
                metadata: {
                  network: "sui",
                  balance: args.amount,
                  balanceObjectId: result.objectId,
                  walletAddress: user.properties.walletAddress,
                  acquiredAt: Date.now(),
                },
                createdAt: Date.now(),
              })
            );

            // 4. Log event
            yield* Effect.tryPromise(() =>
              db.insert("events", {
                type: "tokens_purchased",
                actorId: args.userId,
                targetId: args.tokenId,
                timestamp: Date.now(),
                metadata: {
                  network: "sui",
                  amount: args.amount,
                  txDigest: result.digest,
                },
              })
            );

            return { success: true, txDigest: result.digest };
          }),
      };
    }),
    dependencies: [ConvexDatabase.Default, SuiProvider.Default],
  }
) {}
```

### Step 3.2: Define Error Types

**Pattern:**
```typescript
// convex/services/<category>/errors.ts
import { Data } from "effect";

export class <Error>Error extends Data.TaggedError("<Error>Error")<{
  message: string;
  code?: string;
}> {}
```

**Example:**
```typescript
// convex/services/blockchain/errors.ts
export class UserNotFoundError extends Data.TaggedError("UserNotFoundError")<{
  message: string;
  userId: string;
}> {}

export class InsufficientBalanceError extends Data.TaggedError("InsufficientBalanceError")<{
  message: string;
  required: number;
  available: number;
}> {}

export class BlockchainError extends Data.TaggedError("BlockchainError")<{
  message: string;
  network: "sui" | "solana" | "base";
  txHash?: string;
}> {}
```

### Step 3.3: Service Rules

**MUST:**
- Pure functions only (no side effects outside Effect)
- Explicit types (no `any`)
- Typed errors with `_tag` pattern
- Dependency injection via Effect.Service
- Business logic ONLY (no Convex-specific code)

**MUST NOT:**
- Use `console.log` (use Effect.log)
- Catch errors with try/catch (use Effect.tryPromise)
- Mix UI logic with business logic
- Hard-code configuration (use environment variables)

### Step 3.4: Service Invariants Checklist

- Validate inputs with `v` validators and explicit types.
- Enforce tenancy and roles via connections before mutating.
- Prefer consolidated types (`transacted`, `communicated`, `delegated`).
- Always include `metadata.protocol` when a provider/protocol is involved.
- Ensure indexes exist for every non-id lookup used.

---

## Phase 4: IMPLEMENT BACKEND

**Goal:** Create thin Convex wrappers that call Effect.ts services.

### Step 4.1: Create Mutation

**Pattern:**
```typescript
// convex/mutations/<domain>.ts
import { confect } from "@/convex/lib/confect";
import { v } from "convex/values";
import { Effect } from "effect";
import { <Service>Service } from "@/convex/services/<category>/<service>";
import { MainLayer } from "@/convex/layers";

export const <methodName> = confect.mutation({
  args: {
    // Convex validators
    <arg>: v.id("things"),
    <arg>: v.number(),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const service = yield* <Service>Service;
      return yield* service.<method>(args);
    }).pipe(Effect.provide(MainLayer)),
});
```

**Example: Token Purchase Mutation**
```typescript
// convex/mutations/tokens.ts
export const purchase = confect.mutation({
  args: {
    tokenId: v.id("things"),
    amount: v.number(),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const tokenService = yield* TokenService;
      const userId = yield* Effect.fromNullable(
        ctx.auth.userId,
        () => new UnauthorizedError({ message: "Must be logged in" })
      );

      return yield* tokenService.purchase({
        userId,
        tokenId: args.tokenId,
        amount: args.amount,
      });
    }).pipe(Effect.provide(MainLayer)),
});
```

### Step 4.2: Create Query

**Pattern:**
```typescript
// convex/queries/<domain>.ts
export const <queryName> = confect.query({
  args: {
    <arg>: v.id("things"),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const service = yield* <Service>Service;
      return yield* service.<method>(args);
    }).pipe(Effect.provide(MainLayer)),
});
```

**Example: Get Token Balance**
```typescript
// convex/queries/tokens.ts
export const getBalance = confect.query({
  args: {
    userId: v.id("things"),
    tokenId: v.id("things"),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const tokenService = yield* TokenService;
      return yield* tokenService.getBalance(args);
    }).pipe(Effect.provide(MainLayer)),
});
```

### Step 4.3: Backend Rules

**Convex functions should:**
- Validate arguments with Convex validators
- Call service methods (thin wrapper)
- Provide MainLayer
- Handle authentication/authorization
- Return serializable data only

**Convex functions should NOT:**
- Contain business logic (use services)
- Make external API calls directly (use services)
- Parse/transform complex data (use services)

### Step 4.4: Streaming & AG-UI (Optional)

For AI outputs that the UI should render dynamically, emit `communication_event` rows with structured payloads and protocol metadata.

```typescript
await ctx.db.insert('events', {
  type: 'communication_event',
  actorId: agentId,
  targetId: conversationId,
  timestamp: Date.now(),
  metadata: {
    protocol: 'openai',
    messageType: 'ui',
    component: 'Card',
    data: { title: 'Campaign Outline', items: ['Hook', 'CTA', 'Channels'] },
  },
});
```

See `one/things/CopilotKit.md` and `one/things/AgentKit.md` for details.

---

## Phase 5: BUILD FRONTEND

**Goal:** Create React components that use Convex hooks.

### Step 5.1: Create Feature Component

**Pattern:**
```typescript
// src/components/features/<domain>/<Component>.tsx
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import type { Id } from "@/convex/_generated/dataModel";

export function <Component>({ <prop> }: { <prop>: <Type> }) {
  const <mutation> = useMutation(api.<domain>.<method>);
  const <query> = useQuery(api.<domain>.<query>, { <arg> });

  return (
    <div>
      {/* UI here */}
      <Button onClick={() => <mutation>({ <arg> })}>
        Action
      </Button>
    </div>
  );
}
```

**Example: Token Purchase Component**
```typescript
// src/components/features/tokens/TokenPurchase.tsx
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";

export function TokenPurchase({ tokenId }: { tokenId: Id<"things"> }) {
  const [amount, setAmount] = useState(100);
  const [loading, setLoading] = useState(false);

  const purchase = useMutation(api.tokens.purchase);
  const balance = useQuery(api.tokens.getBalance, { tokenId });
  const token = useQuery(api.tokens.get, { id: tokenId });

  const handlePurchase = async () => {
    setLoading(true);
    try {
      await purchase({ tokenId, amount });
    } catch (error) {
      console.error("Purchase failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{token?.name || "Token"}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Your balance: {balance?.metadata.balance || 0}</p>
        <p>Price: {token?.properties.price} SUI</p>

        <div className="flex gap-2 mt-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="border rounded px-2"
          />
          <Button onClick={handlePurchase} disabled={loading}>
            {loading ? "Purchasing..." : `Buy ${amount} Tokens`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Step 5.2: Create Astro Page (if needed)

**Pattern:**
```astro
---
// src/pages/<domain>/[id].astro
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import Layout from "@/layouts/Layout.astro";
import <Component> from "@/components/features/<domain>/<Component>";

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const <data> = await convex.query(api.<domain>.<query>, {
  id: Astro.params.id,
});
---

<Layout title={<data>.name}>
  <h1>{<data>.name}</h1>
  <<Component> client:load <prop>={<data>._id} />
</Layout>
```

**Example: Token Detail Page**
```astro
---
// src/pages/tokens/[id].astro
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import Layout from "@/layouts/Layout.astro";
import TokenPurchase from "@/components/features/tokens/TokenPurchase";

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const token = await convex.query(api.tokens.get, {
  id: Astro.params.id as any,
});
---

<Layout title={token.name}>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-4">{token.name}</h1>
    <p class="text-muted-foreground mb-8">{token.properties.description}</p>

    <TokenPurchase client:load tokenId={token._id} />
  </div>
</Layout>
```

### Step 5.3: Frontend Rules

**Components should:**
- Use Convex hooks (`useQuery`, `useMutation`)
- Use shadcn/ui components
- Handle loading states
- Handle error states
- Be small and focused (single responsibility)

When rendering AG-UI messages, map `communication_event` payloads to PromptKit components (no raw HTML injection).

**Components should NOT:**
- Contain business logic (use mutations)
- Make API calls directly (use Convex)
- Mutate props
- Use class components (use function components)

---

## Phase 6: TEST & DOCUMENT

**Goal:** Ensure quality and maintainability.

### Step 6.1: Write Unit Tests

**Pattern:**
```typescript
// tests/unit/services/<service>.test.ts
import { describe, it, expect } from "vitest";
import { Effect, Layer } from "effect";
import { <Service>Service } from "@/convex/services/<category>/<service>";
import { ConvexDatabase } from "@/convex/lib/convex-database";

describe("<Service>Service.<method>", () => {
  it("should <expected behavior>", async () => {
    // Mock dependencies
    const MockDatabase = Layer.succeed(ConvexDatabase, {
      get: () => Effect.succeed({ _id: "123", type: "token" }),
      insert: () => Effect.succeed("456"),
      // ...
    });

    const TestLayer = MockDatabase;

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const service = yield* <Service>Service;
        return yield* service.<method>({ <args> });
      }).pipe(Effect.provide(TestLayer))
    );

    expect(result.success).toBe(true);
  });

  it("should fail when <error condition>", async () => {
    // Test error cases
  });
});
```

**Example: Token Service Test**
```typescript
// tests/unit/services/token.test.ts
describe("TokenService.purchase", () => {
  it("should purchase tokens successfully", async () => {
    const MockSUI = Layer.succeed(SuiProvider, {
      executeTransaction: () => Effect.succeed({
        digest: "9mKG...",
        objectId: "0x123...",
      }),
    });

    const MockDB = Layer.succeed(ConvexDatabase, {
      get: (id) => Effect.succeed({
        _id: id,
        type: "token",
        properties: { price: 0.1 },
      }),
      insert: () => Effect.succeed("connection_id"),
    });

    const TestLayer = Layer.merge(MockSUI, MockDB);

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const service = yield* TokenService;
        return yield* service.purchase({
          userId: "user_123",
          tokenId: "token_456",
          amount: 100,
        });
      }).pipe(Effect.provide(TestLayer))
    );

    expect(result.success).toBe(true);
    expect(result.txDigest).toBe("9mKG...");
  });
});
```

### Step 6.2: Write Integration Tests

**Pattern:**
```typescript
// tests/integration/<feature>.test.ts
import { describe, it, expect } from "vitest";
import { ConvexTestingHelper } from "convex-test";

describe("<Feature> Integration", () => {
  it("should complete full flow", async () => {
    const t = new ConvexTestingHelper();

    // Test full flow: mutation → service → database → event
  });
});
```

### Step 6.3: Update Documentation

**Required updates:**
- Add to `one/things/README.md` if new thing type
- Add to `one/connections/README.md` if new connection type
- Add to `one/events/README.md` if new event type
- Update `one/things/files.md` with new files
- Add code examples to relevant docs

**Optional updates:**
- Create dedicated doc in `one/things/<ThingType>.md`
- Create dedicated doc in `one/events/<EventCategory>.md`
- Update `one/connections/patterns.md` if novel pattern

---

## Workflow Checklist

### Before Starting
- [ ] Read `one/connections/ontology.md`
- [ ] Understand the 4-table model
- [ ] Identify similar existing patterns
- [ ] Map feature to ontology (Phase 2)

### During Implementation
- [ ] Design Effect.ts services (Phase 3)
- [ ] Create thin Convex wrappers (Phase 4)
- [ ] Build React components (Phase 5)
- [ ] Follow naming conventions
- [ ] Use explicit types
- [ ] Set `properties.protocol` / `metadata.protocol` as applicable
- [ ] Ensure indexes exist for all queries

### After Implementation
- [ ] Write unit tests (Phase 6)
- [ ] Write integration tests (Phase 6)
- [ ] Update documentation (Phase 6)
- [ ] Run TypeScript checks (`bunx astro check`)
- [ ] Run tests (`bun test`)
- [ ] Review safety gates (tenancy, approvals, audit events)

---

## Anti-Patterns to Avoid

### ❌ DON'T: Skip Ontology Mapping
```typescript
// BAD: Creating custom tables
await db.insert("custom_nft_table", { ... });
```

### ✅ DO: Map to Ontology
```typescript
// GOOD: Using things table
await db.insert("things", {
  type: "nft",
  properties: { ... }
});
```

### ❌ DON'T: Put Business Logic in Convex Functions
```typescript
// BAD
export const purchase = mutation({
  handler: async (ctx, args) => {
    const balance = await getBalance(args.userId);
    if (balance < args.price) {
      throw new Error("Insufficient balance");
    }
    // ... more logic
  }
});
```

### ✅ DO: Put Business Logic in Services
```typescript
// GOOD
export const purchase = confect.mutation({
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const service = yield* TokenService;
      return yield* service.purchase(args);
    }).pipe(Effect.provide(MainLayer))
});
```

### ❌ DON'T: Use `any` Types
```typescript
// BAD
const result: any = await service.execute();
```

### ✅ DO: Use Explicit Types
```typescript
// GOOD
const result: PurchaseResult = await service.purchase(args);
```

---

## Summary

**The 6-Phase Workflow:**
1. **UNDERSTAND** - Read docs, identify category
2. **MAP TO ONTOLOGY** - Things, connections, events, tags
3. **DESIGN SERVICES** - Pure Effect.ts business logic
4. **IMPLEMENT BACKEND** - Thin Convex wrappers
5. **BUILD FRONTEND** - React components with Convex hooks
6. **TEST & DOCUMENT** - Unit tests, integration tests, docs

**Key Principles:**
- Ontology first, code second
- Pure functions, explicit types
- Business logic in services
- Thin wrappers everywhere
- Test everything

Additional principles:
- Explicit protocol mapping (`properties.protocol`, `metadata.protocol`).
- Prefer consolidated connection/event types.
- Use tags for categorization; use knowledge things for RAG.

**This workflow ensures every feature makes the codebase BETTER, not worse.**
