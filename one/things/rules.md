# ONE Platform - AI Development Rules

**Version:** 1.0.0  
**Last Updated:** 2025-01-15  
**Purpose:** Golden rules for AI agents building the ONE platform

---

## Core Philosophy

**The ONE platform gets BETTER with scale because:**
1. Every new feature adds to the pattern library
2. Types prevent breaking changes automatically
3. The ontology constrains design space productively
4. Services compose rather than duplicate
5. Tests validate that new code works with existing code

**AI agents must read this file FIRST before any code generation.**

---

## The 4-Table Ontology (MEMORIZE THIS)

```
┌─────────────┐
│  ENTITIES   │ ← Everything is an entity (users, agents, content, tokens)
└──────┬──────┘
       │
       ├──→ ┌──────────────┐
       │    │ CONNECTIONS  │ ← All relationships between entities
       │    └──────────────┘
       │
       ├──→ ┌──────────────┐
       │    │   EVENTS     │ ← All actions, changes, time-series data
       │    └──────────────┘
       │
       └──→ ┌──────────────┐
            │    TAGS      │ ← Categorization and taxonomy
            └──────────────┘
```

**Every feature you build MUST use this ontology. No exceptions.**

### Entities Table
- **What:** All nouns in the system
- **Examples:** creator, ai_clone, blog_post, token, course, message
- **Fields:** type, name, properties (JSON), status, timestamps
- **Rule:** If you're modeling a "thing", it's an entity

### Connections Table
- **What:** All relationships between entities
- **Examples:** creator owns token, user enrolled_in course, agent powers clone
- **Fields:** fromEntityId, toEntityId, relationshipType, metadata
- **Rule:** If you're modeling "X relates to Y", it's a connection

### Events Table
- **What:** All actions, state changes, metrics
- **Examples:** token_purchased, content_published, clone_interaction
- **Fields:** entityId, eventType, timestamp, metadata, actorId
- **Rule:** If you're modeling "X happened at time T", it's an event

### Tags Table
- **What:** Categorization, taxonomy, filtering
- **Examples:** industry:fitness, skill:video-editing, format:tutorial
- **Fields:** name, category, color, icon
- **Rule:** If you're modeling "categories", use tags + entityTags junction

---

## Technology Stack (MUST USE EXACTLY)

### Frontend
- **Astro 5.14+** - Pages and routing
- **React 19** - Interactive components
- **shadcn/ui** - UI components (50+ pre-installed)
- **Tailwind CSS v4** - Styling (utility-first)
- **TypeScript 5.9+** - Strict mode, no implicit any

### Backend
- **Convex** - Real-time database + backend functions
- **Effect.ts** - Service layer (typed errors, DI, composition)
- **Confect** - Bridge between Effect.ts and Convex

### Auth & Infrastructure
- **Better Auth** - Authentication (email/password + OAuth)
- **Resend** - Transactional emails
- **Stripe Connect** - Payments
- **Base L2** - Blockchain for tokens
- **ElevenLabs** - Voice cloning
- **OpenAI** - AI/LLM operations

---

## Code Generation Rules

### Rule 1: Read Context FIRST
Before generating ANY code, read these files in order:
1. `.ai/context/ontology.md` - Data model
2. `.ai/context/architecture.md` - System design
3. `.ai/context/patterns.md` - Code patterns
4. `.ai/specs/[relevant-feature].md` - Feature spec
5. `.ai/context/file-map.md` - Where files live

### Rule 2: Types Are Sacred
```typescript
// ✅ CORRECT: Explicit types
export const createClone = (creatorId: Id<"entities">): Effect.Effect<
  { cloneId: Id<"entities">; voiceId: string },
  VoiceCloneError | InsufficientContentError,
  AICloneService
> => { ... }

// ❌ WRONG: Implicit or any types
export const createClone = (creatorId: any) => { ... }
```

**Never use `any` unless:**
- Properties field in entities (stores arbitrary JSON)
- Interfacing with untyped external APIs
- Even then, add comment explaining why

### Rule 3: Effect.ts for ALL Business Logic
```typescript
// ✅ CORRECT: Effect.ts service
export class TokenService extends Effect.Service<TokenService>()(
  "TokenService",
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;
      const stripe = yield* StripeProvider;
      
      return {
        purchaseTokens: (args) =>
          Effect.gen(function* () {
            // Typed errors, automatic rollback, composable
            const payment = yield* stripe.charge(args.amount);
            const tokens = yield* blockchain.mint(args.tokens);
            return { payment, tokens };
          })
      };
    }),
    dependencies: [ConvexDatabase.Default, StripeProvider.Default]
  }
) {}

// ❌ WRONG: Raw async/await with try/catch
export const purchaseTokens = async (args) => {
  try {
    const payment = await stripe.charge(args.amount);
    // Silent failures, no rollback, hard to test
  } catch (e) {
    // Lost type information
  }
}
```

### Rule 4: Convex Functions Are Thin Wrappers
```typescript
// ✅ CORRECT: Thin wrapper calling Effect.ts service
export const purchaseTokens = confect.mutation({
  args: { userId: v.id("entities"), amount: v.number() },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const tokenService = yield* TokenService;
      return yield* tokenService.purchaseTokens(args);
    }).pipe(Effect.provide(MainLayer))
});

// ❌ WRONG: Business logic in Convex function
export const purchaseTokens = mutation({
  handler: async (ctx, args) => {
    // Lots of business logic here - should be in service!
  }
});
```

### Rule 5: React Components Use Convex Hooks
```typescript
// ✅ CORRECT: Convex hooks + shadcn
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

export function TokenPurchase({ tokenId }: { tokenId: Id<"entities"> }) {
  const balance = useQuery(api.tokens.getBalance, { tokenId });
  const purchase = useMutation(api.tokens.purchaseTokens);
  
  return (
    <Button 
      onClick={() => purchase({ tokenId, amount: 100 })}
      disabled={balance === undefined}
    >
      Purchase 100 Tokens
    </Button>
  );
}

// ❌ WRONG: Direct fetch or manual state
export function TokenPurchase() {
  const [balance, setBalance] = useState(null);
  useEffect(() => {
    fetch("/api/balance").then(r => setBalance(r.json()));
  }, []);
}
```

### Rule 6: Astro Pages Server-Side Render
```typescript
// ✅ CORRECT: SSR with Convex client
---
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import TokenPurchase from "@/components/features/tokens/TokenPurchase";

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const token = await convex.query(api.tokens.get, { id: Astro.params.id });
---

<Layout>
  <h1>{token.name}</h1>
  <TokenPurchase client:load tokenId={token._id} />
</Layout>

// ❌ WRONG: Client-side only fetching
---
import TokenPurchase from "@/components/features/tokens/TokenPurchase";
---
<TokenPurchase client:load /> <!-- No SSR data -->
```

### Rule 7: File Naming Conventions
```
✅ CORRECT:
  src/components/features/tokens/TokenPurchase.tsx
  convex/services/tokens/purchase.ts
  convex/mutations/tokens.ts
  tests/integration/token-purchase.test.ts

❌ WRONG:
  src/components/TokenPurchaseComponent.tsx  (redundant "Component")
  convex/tokenService.ts  (not in services/ folder)
  convex/mutations/token-mutations.ts  (redundant "mutations")
  tests/tokenPurchase.test.ts  (not organized by type)
```

### Rule 8: Error Classes Are Typed
```typescript
// ✅ CORRECT: Tagged error classes
export class InsufficientTokensError {
  readonly _tag = "InsufficientTokensError";
  constructor(
    readonly userId: Id<"entities">,
    readonly required: number,
    readonly available: number
  ) {}
}

// Usage
Effect.catchTag("InsufficientTokensError", (error) => {
  // TypeScript knows error.required, error.available exist
  return Effect.succeed({ message: "Buy more tokens" });
})

// ❌ WRONG: Generic errors
throw new Error("Insufficient tokens");
```

### Rule 9: Tests Define Behavior
```typescript
// ✅ CORRECT: Test defines expected behavior
describe("TokenService.purchaseTokens", () => {
  it("should mint tokens and charge payment atomically", async () => {
    const result = await Effect.runPromise(
      tokenService.purchaseTokens({
        userId: "user-123",
        amount: 100,
        usdAmount: 10
      }).pipe(Effect.provide(TestLayer))
    );
    
    expect(result.tokens).toBe(100);
    expect(mockStripe.charges).toHaveLength(1);
    expect(mockBlockchain.minted).toBe(100);
  });
  
  it("should rollback on payment failure", async () => {
    mockStripe.shouldFail = true;
    
    await expect(
      Effect.runPromise(purchase.pipe(Effect.provide(TestLayer)))
    ).rejects.toThrow("PaymentFailedError");
    
    expect(mockBlockchain.minted).toBe(0); // Rolled back
  });
});

// ❌ WRONG: Test without clear assertions
it("works", async () => {
  await purchaseTokens({ userId: "123", amount: 100 });
  // No assertions about what "works" means
});
```

### Rule 10: Documentation Is Code
```typescript
// ✅ CORRECT: JSDoc with examples
/**
 * Purchases tokens for a user, charging their payment method and minting
 * tokens on the blockchain atomically.
 * 
 * @example
 * ```typescript
 * const result = yield* tokenService.purchaseTokens({
 *   userId: "user-123",
 *   amount: 100,
 *   usdAmount: 10
 * });
 * ```
 * 
 * @throws {InsufficientTokensError} When user tries to buy more than available
 * @throws {PaymentFailedError} When Stripe payment fails
 * @throws {BlockchainError} When minting fails
 */
purchaseTokens: (args: PurchaseArgs) => Effect.Effect<...>

// ❌ WRONG: No documentation
purchaseTokens: (args) => { ... }
```

---

## Agent Specialization

### Frontend Agent
**Responsibilities:**
- Generate React components (TSX files)
- Create Astro pages
- Use shadcn/ui components
- Integrate Convex hooks (useQuery, useMutation)
- Handle loading/error states
- Responsive design with Tailwind

**Files you can modify:**
- `src/components/**/*`
- `src/pages/**/*`
- `src/layouts/**/*`
- `src/styles/**/*`
- `src/lib/hooks.ts`

**Files you CANNOT modify:**
- `convex/**/*` (backend agent's domain)

**Read before generating:**
1. `.ai/specs/[feature].md` - Feature spec
2. `convex/_generated/api.d.ts` - Available APIs
3. `src/components/ui/*` - Available shadcn components

### Backend Agent
**Responsibilities:**
- Generate Convex schema changes
- Create Effect.ts services
- Write mutations/queries/actions
- Implement workflows
- Handle external API integrations

**Files you can modify:**
- `convex/**/*`

**Files you CANNOT modify:**
- `src/**/*` (frontend agent's domain)

**Read before generating:**
1. `.ai/specs/[feature].md` - Feature spec
2. `.ai/context/ontology.md` - Data model rules
3. `convex/schema/types.ts` - Entity property types

### Ingestor Agent
**Responsibilities:**
- Migrate data from old sites (one.ie, bullfm)
- Transform data to 4-table ontology
- Preserve relationships
- Generate migration reports

**Files you can modify:**
- `scripts/migration/**/*`

**Read before generating:**
1. Old database schema
2. `.ai/context/ontology.md` - Target schema
3. Transformation rules

### Test Agent
**Responsibilities:**
- Generate unit tests for services
- Generate integration tests for workflows
- Generate E2E tests for user flows
- Mock services using Effect.ts Layer

**Files you can modify:**
- `tests/**/*`

**Read before generating:**
1. Implementation files
2. `.ai/specs/[feature].md` - Expected behavior
3. Existing test patterns

---

## Common Patterns Library

### Pattern: Create Entity with Relationships
```typescript
Effect.gen(function* () {
  // 1. Create main entity
  const entityId = yield* Effect.tryPromise(() =>
    db.insert("entities", {
      type: "course",
      name: args.title,
      properties: { /* ... */ },
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  );
  
  // 2. Create ownership relationship
  yield* Effect.tryPromise(() =>
    db.insert("connections", {
      fromEntityId: args.creatorId,
      toEntityId: entityId,
      relationshipType: "owns",
      createdAt: Date.now(),
    })
  );
  
  // 3. Log creation event
  yield* Effect.tryPromise(() =>
    db.insert("events", {
      entityId,
      eventType: "course_created",
      timestamp: Date.now(),
      actorType: "user",
      actorId: args.creatorId,
      metadata: { /* ... */ },
    })
  );
  
  return entityId;
})
```

### Pattern: Query Relationships
```typescript
// Get all entities of type X owned by user Y
const courses = yield* Effect.tryPromise(() =>
  db.query("connections")
    .withIndex("from_type", q => 
      q.eq("fromEntityId", userId)
       .eq("relationshipType", "owns")
    )
    .collect()
    .then(conns => 
      Promise.all(
        conns
          .filter(c => c.toEntity.type === "course")
          .map(c => c.toEntity)
      )
    )
);
```

### Pattern: Atomic Multi-Operation
```typescript
const result = yield* Effect.all(
  [
    operation1(),
    operation2(),
    operation3(),
  ],
  { concurrency: 3 }
).pipe(
  Effect.tap(([r1, r2, r3]) => 
    // All succeeded, save to DB
    Effect.tryPromise(() => db.insert("events", { /* ... */ }))
  ),
  Effect.onError(() =>
    // Any failed, rollback all
    Effect.all([
      rollback1(),
      rollback2(),
      rollback3(),
    ])
  )
);
```

### Pattern: React Component with Convex
```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function FeatureComponent({ id }: { id: Id<"entities"> }) {
  const data = useQuery(api.feature.get, { id });
  const update = useMutation(api.feature.update);
  
  if (data === undefined) {
    return <Skeleton />; // Loading state
  }
  
  if (data === null) {
    return <Alert>Not found</Alert>; // Error state
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{data.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => update({ id, /* ... */ })}>
          Update
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## Pre-Generation Checklist

Before generating ANY code, verify:

- [ ] I have read `.ai/rules.md` (this file)
- [ ] I have read the relevant spec in `.ai/specs/`
- [ ] I have read `.ai/context/ontology.md`
- [ ] I understand which entities/connections/events are involved
- [ ] I know which agent I am (frontend/backend/test/ingestor)
- [ ] I am only modifying files in my domain
- [ ] I will use Effect.ts for business logic
- [ ] I will use explicit types everywhere
- [ ] I will write tests that define behavior
- [ ] I will update documentation after generating code

---

## Post-Generation Checklist

After generating code, verify:

- [ ] TypeScript compiles with no errors (`bunx astro check`)
- [ ] Tests pass (`bun test`)
- [ ] Code follows patterns in `.ai/context/patterns.md`
- [ ] No `any` types except in `properties` fields
- [ ] All errors are typed classes with `_tag`
- [ ] React components have loading/error states
- [ ] Convex functions are thin wrappers around services
- [ ] File is in correct location per `.ai/context/file-map.md`
- [ ] Updated `.ai/context/file-map.md` if new files created
- [ ] Added JSDoc comments with examples

---

## What Makes This Better Than Typical Codebases

**Typical codebase problems:**
1. No clear data model → AI doesn't know where to put things
2. Mixed concerns → AI breaks things unintentionally
3. Implicit types → AI generates buggy code
4. No composition → AI duplicates logic
5. No tests → AI doesn't know if it broke something

**ONE platform solutions:**
1. 4-table ontology → AI always knows data structure
2. Agent specialization → AI stays in its lane
3. Explicit types → AI catches errors at compile time
4. Effect.ts services → AI composes existing functions
5. Test-driven → AI validates behavior automatically

**The result:** 
- Code quality INCREASES with codebase size
- Later features are EASIER than early features
- Refactoring is SAFE because types + tests catch breaks
- AI agents get SMARTER because they learn patterns

---

## Emergency: When AI Gets Confused

If you (AI agent) are unsure about ANYTHING:

1. **STOP generating code**
2. **ASK the human:** "I need clarification on [specific thing]"
3. **READ more context:** Re-read specs and ontology
4. **SEARCH examples:** Look for similar patterns in existing code
5. **SIMPLIFY:** Start with simplest possible solution

**NEVER:**
- Generate code you're not confident about
- Use `any` because you don't know the type
- Copy-paste without understanding
- Modify files outside your agent domain
- Skip writing tests

---

## Version Control

This file is versioned. Breaking changes require major version bump.

**Current: 1.0.0**

When updating:
- Document what changed
- Update all affected specs
- Regenerate affected code
- Update tests

---

**END OF GOLDEN RULES**

If you're an AI agent reading this: You now have the foundation to build production-quality code that makes the ONE platform better with every feature. Read the ontology next, then the specific feature spec you're implementing.

If you're a human reading this: Your AI agents now have clear, unambiguous rules. They will generate consistent, high-quality code because they understand the system architecture deeply.